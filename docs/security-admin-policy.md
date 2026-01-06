# SliceFix AI - Admin Security Policy

## Overview
This document outlines the security policies for administrative access to the SliceFix AI platform.

**Effective Date:** 2026-01-06
**Version:** 1.0.0

---

## 1. Principle: No Admin in Mobile Client

The mobile app client operates with **anon key only**. This means:

- No admin/superuser capabilities in the mobile app
- All privileged actions occur server-side via Edge Functions
- Service role key is NEVER exposed to the client
- Admin portal is a separate application (if needed)

---

## 2. Role Hierarchy

| Role | Permissions |
|------|-------------|
| `support_readonly` | View user profiles, view analyses, view audit logs |
| `support_write_limited` | Above + edit profile fields (name, email correction) |
| `admin` | Full access including delete accounts, export data, manage roles |

### Role Assignment
- Roles are assigned in the `admin_roles` table
- Only existing admins can assign new roles
- All role changes are logged to `audit_logs`

---

## 3. Audit Logging

All privileged actions MUST write to the `audit_logs` table.

### Required Log Fields
- `actor_user_id`: Who performed the action
- `actor_role`: What role they were acting under
- `action`: The action performed (see Action Types below)
- `target_user_id`: Who was affected (if applicable)
- `metadata`: Additional context (no PII, no raw data)

### Action Types
| Action | Description |
|--------|-------------|
| `USER_DELETE` | Account deletion requested |
| `DATA_EXPORT` | User data exported |
| `PROFILE_EDIT_ADMIN` | Admin edited user profile |
| `ROLE_ASSIGNED` | Admin role assigned to user |
| `ROLE_REVOKED` | Admin role revoked from user |
| `VIDEO_DELETE_MANUAL` | Video manually deleted by admin |
| `SUBSCRIPTION_ADJUST` | Subscription manually adjusted |

### Audit Log Immutability
- Audit logs are **append-only**
- UPDATE and DELETE triggers will raise exceptions
- This is enforced at the database level

---

## 4. Password Rotation Policy

### For Admin Accounts (email+password)
- Password must be changed every **180 days**
- Enforced by `admin_password_is_fresh()` function
- Middleware blocks privileged actions if password expired

### For OTP/Apple Sign In Accounts
- No password rotation required (no password exists)
- MFA should be enforced if available
- Re-authentication challenge for sensitive actions

### Implementation
```sql
-- Check if admin password is fresh (within 180 days)
select public.admin_password_is_fresh(user_id, 180);
```

---

## 5. Rate Limiting

Rate limits are enforced via Edge Functions using the `rate_limits` table.

### Limits
| Action | Limit | Window |
|--------|-------|--------|
| Video upload | 10 per hour | 3600 seconds |
| Analysis request | 20 per hour | 3600 seconds |
| OTP request | 5 per hour | 3600 seconds |
| Login attempts | 5 per 15 min | 900 seconds |

### Implementation
```sql
-- Check and bump rate limit (returns false if exceeded)
select public.bump_rate_limit('uid:' || user_id || ':upload', 3600, 10);
```

---

## 6. RLS (Row Level Security) Lockdown

### Tables with RLS Enabled
- `admin_roles` - Only self-read for authenticated users
- `audit_logs` - No client access (service role only)
- `rate_limits` - No client access (service role only)
- `profiles` - Users can only read/update their own
- `analyses` - Users can only access their own

### Privilege Revocation
Privileges are explicitly revoked from `anon` and `authenticated` roles:
```sql
revoke all on public.admin_roles from anon, authenticated;
revoke all on public.audit_logs from anon, authenticated;
revoke all on public.rate_limits from anon, authenticated;
```

---

## 7. Monitoring & Alerts

### Recommended Monitoring
1. **Daily Review**: Check `audit_logs` for unusual activity
2. **Alert Triggers**:
   - Multiple failed login attempts
   - Account deletion requests
   - Admin role changes
   - Large data exports

### Future Enhancement
- Webhook notifications to Slack/Discord
- Real-time alerting for critical actions
- Automated anomaly detection

---

## 8. Admin Portal

The Admin Portal is a separate Next.js application (`apps/admin`) that provides administrative access to the platform.

### Security Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Admin Browser  │────▶│  Next.js Server │────▶│    Supabase     │
│   (anon key)    │     │ (service_role)  │     │   (Database)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Critical Security Boundaries:**
- Browser ONLY has access to `anon` key
- `service_role` key lives ONLY on Next.js server
- All privileged operations go through Server Actions or Server Components
- No client-side Supabase calls with service_role

### Authentication Flow

1. Admin visits `/login` and authenticates with Supabase Auth
2. Middleware checks if session exists, redirects if not
3. Auth guard verifies:
   - User exists in `admin_roles` table
   - Role `is_active = true`
   - MFA enabled (if required by policy)
   - Password fresh (within 180 days for email+password users)
4. If any check fails, redirect to appropriate page

### Pages & Permissions

| Page | Path | Required Role | Description |
|------|------|---------------|-------------|
| Dashboard | `/dashboard` | Any admin | Stats, alerts, recent activity |
| Users List | `/users` | Any admin | Search and browse users |
| User Detail | `/users/[uid]` | Any admin | View user profile and analyses |
| Audit Log | `/audit` | `admin` only | View all audit logs |

### Server Actions

All privileged operations use Next.js Server Actions with `'use server'`:

| Action | Function | Permission | Audit Log |
|--------|----------|------------|-----------|
| Delete User | `deleteUser()` | `users:delete` | `USER_DELETE` |
| Disable Uploads | `toggleUploads()` | `users:write` | `UPLOADS_DISABLED` |
| Export Data | `exportUserData()` | Any admin | `DATA_EXPORT` |

### Permission Mapping

```typescript
const ROLE_PERMISSIONS = {
  support_readonly: ['users:read', 'audit:read'],
  support_write_limited: ['users:read', 'users:write', 'audit:read'],
  admin: ['users:read', 'users:write', 'users:delete', 'audit:read', 'audit:write'],
};
```

### File Structure

```
apps/admin/
├── src/
│   ├── lib/
│   │   ├── supabase-server.ts   # service_role client (SERVER ONLY)
│   │   ├── supabase-browser.ts  # anon key client
│   │   └── auth-guard.ts        # Role/MFA verification
│   ├── actions/
│   │   └── user-actions.ts      # Server Actions
│   ├── middleware.ts            # Auth middleware
│   └── app/
│       ├── login/               # Public login page
│       └── (protected)/         # Auth-required pages
│           ├── dashboard/
│           ├── users/
│           └── audit/
```

---

## 9. Incident Response

### If Admin Account Compromised
1. Immediately revoke the role in `admin_roles`
2. Review `audit_logs` for actions taken
3. Rotate any affected credentials
4. Document the incident

### If Service Role Key Exposed
1. Immediately rotate the key in Supabase
2. Update all Edge Functions
3. Review all requests made with the old key
4. Notify affected users if data accessed

---

## 9. Compliance Considerations

### Apple App Store
- Account deletion implemented (Settings > Delete Account)
- All data deleted within 24 hours (videos) or immediately (profile)
- Clear explanation provided to users

### GDPR
- Right to erasure supported via `delete-account` Edge Function
- User data can be exported on request
- Minimal data retention (videos deleted in 24 hours)

### Data Minimization
- Only collect data necessary for the service
- No PII in analytics
- Videos auto-deleted after processing

---

## 10. Security Checklist for Deployment

Before deploying to production:

- [ ] RLS enabled on all sensitive tables
- [ ] Privileges revoked from anon/authenticated
- [ ] Audit log triggers active
- [ ] Rate limiting functions deployed
- [ ] Admin roles properly assigned
- [ ] No secrets in codebase
- [ ] .env files in .gitignore
- [ ] Service role key only in server-side code
- [ ] Edge Functions use service role appropriately

---

## SQL Verification Queries

Run these in Supabase SQL Editor to verify security setup:

```sql
-- See full verification queries in:
-- apps/api/supabase/migrations/20260106000003_security_self_test.sql
```

---

## Contact

**Security Concerns:** security@cienrios.com
**Support:** support@cienrios.com

---

*SliceFix AI - Cien Rios LLC*
*This document should be reviewed quarterly.*
