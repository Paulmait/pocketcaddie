-- 20260106000003_security_self_test.sql
-- Pocket Caddie AI — Security Self-Test Queries
--
-- Run these queries in Supabase SQL editor to verify security setup.
-- These are SELECT-only and safe to run.

-- =================================
-- 1) Verify RLS is enabled
-- =================================
-- All security-sensitive tables should have rowsecurity = true
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('admin_roles', 'audit_logs', 'rate_limits', 'profiles', 'analyses')
order by tablename;

-- Expected: All rows should show rowsecurity = true


-- =================================
-- 2) Verify RLS policies exist
-- =================================
select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('admin_roles', 'audit_logs', 'rate_limits', 'profiles', 'analyses')
order by tablename, policyname;

-- Expected: admin_roles has admin_roles_self_read policy
-- Expected: audit_logs has no policies (service role only)
-- Expected: rate_limits has no policies (service role only)


-- =================================
-- 3) Verify privileges are revoked for anon/authenticated
-- =================================
select table_schema, table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('admin_roles', 'audit_logs', 'rate_limits')
  and grantee in ('anon', 'authenticated')
order by table_name, grantee, privilege_type;

-- Expected: No rows (all privileges revoked)


-- =================================
-- 4) Verify audit_logs append-only triggers exist
-- =================================
select trigger_name, event_manipulation, action_statement
from information_schema.triggers
where trigger_schema = 'public'
  and event_object_table = 'audit_logs'
order by trigger_name;

-- Expected: trg_audit_no_update and trg_audit_no_delete triggers exist


-- =================================
-- 5) Test append-only constraint (should fail)
-- =================================
-- Uncomment to test - this should raise an exception:
-- update public.audit_logs set action = 'TEST' where 1 = 0;
-- delete from public.audit_logs where 1 = 0;


-- =================================
-- 6) Verify helper functions exist
-- =================================
select routine_name, routine_type, security_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name in (
    'is_active_admin',
    'admin_password_is_fresh',
    'bump_rate_limit',
    'insert_audit_log',
    'set_updated_at',
    'block_audit_mutations'
  )
order by routine_name;

-- Expected: All 6 functions should exist with security_type = 'DEFINER'


-- =================================
-- 7) Count current audit logs (info only)
-- =================================
select count(*) as total_audit_logs from public.audit_logs;


-- =================================
-- SUMMARY
-- =================================
-- If all checks pass:
-- [OK] RLS enabled on security tables
-- [OK] Privileges revoked from anon/authenticated
-- [OK] Audit logs are append-only
-- [OK] Helper functions created
--
-- Security foundation is ready for production.
