-- 20260106000002_security_admin.sql
-- Pocket Caddie AI — Security + Admin Foundations
-- Effective: 2026-01-06
--
-- IMPORTANT: Mobile app uses anon key only.
-- Admin actions require service role via Edge Functions or admin portal.

-- Extensions
create extension if not exists pgcrypto;

-- =========================
-- 1) Roles & Admin Mapping
-- =========================
-- We keep "superuser/admin" capabilities OUT of the mobile client.
-- Mobile uses anon key only. Admin actions via service role / admin portal only.

create table if not exists public.admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('support_readonly','support_write_limited','admin')),
  is_active boolean not null default true,
  last_password_change_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists admin_roles_role_idx on public.admin_roles(role);

-- Update timestamp trigger helper (if not exists)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_admin_roles_updated_at on public.admin_roles;
create trigger trg_admin_roles_updated_at
before update on public.admin_roles
for each row execute function public.set_updated_at();


-- ==================================
-- 2) Immutable Audit Log (Append-only)
-- ==================================
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  actor_user_id uuid null references auth.users(id) on delete set null,
  actor_role text not null default 'system', -- 'admin'|'support'|'system'
  action text not null,                     -- e.g. USER_DELETE, DATA_EXPORT, PROFILE_EDIT_ADMIN
  target_user_id uuid null references auth.users(id) on delete set null,

  metadata jsonb not null default '{}'::jsonb,

  -- Optional forensic fields (store hashed IP if you capture it server-side)
  ip_hash text null,
  user_agent text null
);

create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at desc);
create index if not exists audit_logs_action_idx on public.audit_logs(action);
create index if not exists audit_logs_actor_idx on public.audit_logs(actor_user_id);
create index if not exists audit_logs_target_idx on public.audit_logs(target_user_id);

-- Make audit_logs append-only by denying UPDATE/DELETE at the DB level
create or replace function public.block_audit_mutations()
returns trigger language plpgsql as $$
begin
  raise exception 'audit_logs are append-only';
end;
$$;

drop trigger if exists trg_audit_no_update on public.audit_logs;
create trigger trg_audit_no_update
before update on public.audit_logs
for each row execute function public.block_audit_mutations();

drop trigger if exists trg_audit_no_delete on public.audit_logs;
create trigger trg_audit_no_delete
before delete on public.audit_logs
for each row execute function public.block_audit_mutations();


-- =========================
-- 3) Rate Limiting Table
-- =========================
-- Used by Edge Functions to enforce per-user and per-IP limits.
create table if not exists public.rate_limits (
  key text primary key,                 -- e.g. "uid:<uuid>:upload" or "iphash:<hash>:upload"
  window_start timestamptz not null,
  window_seconds int not null,
  count int not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists rate_limits_window_idx on public.rate_limits(window_start);

create or replace function public.bump_rate_limit(p_key text, p_window_seconds int, p_max int)
returns boolean
language plpgsql
security definer
as $$
declare
  now_ts timestamptz := now();
  wl record;
begin
  select * into wl from public.rate_limits where key = p_key for update;

  if not found then
    insert into public.rate_limits(key, window_start, window_seconds, count, updated_at)
    values (p_key, now_ts, p_window_seconds, 1, now_ts);
    return true;
  end if;

  if extract(epoch from (now_ts - wl.window_start)) >= p_window_seconds then
    update public.rate_limits
      set window_start = now_ts, window_seconds = p_window_seconds, count = 1, updated_at = now_ts
      where key = p_key;
    return true;
  end if;

  if wl.count + 1 > p_max then
    return false;
  end if;

  update public.rate_limits
    set count = wl.count + 1, updated_at = now_ts
    where key = p_key;

  return true;
end;
$$;


-- =========================
-- 4) RLS Lockdown
-- =========================
alter table public.admin_roles enable row level security;
alter table public.audit_logs enable row level security;
alter table public.rate_limits enable row level security;

-- IMPORTANT:
-- Mobile app must not read/write admin_roles, audit_logs, rate_limits.
-- Only service role / Edge Functions / admin portal should.

-- Revoke default privileges as defense-in-depth
revoke all on public.admin_roles from anon, authenticated;
revoke all on public.audit_logs from anon, authenticated;
revoke all on public.rate_limits from anon, authenticated;

-- Policies (service role bypasses RLS by design)
-- admin_roles: user can read their own row (optional, for admin portal)
do $$
begin
  begin
    create policy "admin_roles_self_read"
    on public.admin_roles for select
    to authenticated
    using (user_id = auth.uid());
  exception when duplicate_object then null;
  end;
end $$;

-- audit_logs: no authenticated access by default (service role only)
-- rate_limits: no authenticated access by default (service role only)


-- ==========================================
-- 5) Helper: Check if user is active admin
-- ==========================================
create or replace function public.is_active_admin(p_uid uuid, p_min_role text)
returns boolean
language plpgsql
security definer
as $$
declare
  r text;
begin
  select role into r
  from public.admin_roles
  where user_id = p_uid and is_active = true;

  if r is null then
    return false;
  end if;

  -- role hierarchy: support_readonly < support_write_limited < admin
  if p_min_role = 'support_readonly' then
    return true;
  elsif p_min_role = 'support_write_limited' then
    return (r in ('support_write_limited','admin'));
  elsif p_min_role = 'admin' then
    return (r = 'admin');
  else
    return false;
  end if;
end;
$$;


-- ==========================================
-- 6) Password Rotation Check (Admin Portal Only)
-- ==========================================
-- NOTE: Supabase Auth password rotation cannot be forced purely via SQL for OAuth/OTP users.
-- This is enforced in the admin portal middleware:
-- - If admin account uses email+password, require last_password_change_at within 180 days
-- - If admin uses SSO/OTP, enforce MFA and re-auth challenge instead

create or replace function public.admin_password_is_fresh(p_uid uuid, p_max_age_days int default 180)
returns boolean
language plpgsql
security definer
as $$
declare
  last_change timestamptz;
begin
  select last_password_change_at into last_change
  from public.admin_roles
  where user_id = p_uid and is_active = true;

  if last_change is null then
    -- No password change recorded, assume expired
    return false;
  end if;

  return (now() - last_change) < (p_max_age_days || ' days')::interval;
end;
$$;


-- ==========================================
-- 7) Audit Log Insert Helper (for Edge Functions)
-- ==========================================
create or replace function public.insert_audit_log(
  p_actor_user_id uuid,
  p_actor_role text,
  p_action text,
  p_target_user_id uuid default null,
  p_metadata jsonb default '{}'::jsonb,
  p_ip_hash text default null,
  p_user_agent text default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  log_id uuid;
begin
  insert into public.audit_logs (
    actor_user_id,
    actor_role,
    action,
    target_user_id,
    metadata,
    ip_hash,
    user_agent
  ) values (
    p_actor_user_id,
    p_actor_role,
    p_action,
    p_target_user_id,
    p_metadata,
    p_ip_hash,
    p_user_agent
  )
  returning id into log_id;

  return log_id;
end;
$$;
