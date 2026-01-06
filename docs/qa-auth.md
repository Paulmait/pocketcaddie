# SliceFix AI - Authentication QA Checklist

## Overview
This document provides a comprehensive QA checklist for testing the Supabase authentication implementation.

**Last Updated:** 2026-01-06
**Version:** 1.0.0

---

## Pre-Test Setup

### 1. Environment Configuration
Ensure the following environment variables are set in `.env`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Supabase Dashboard Setup
- [ ] Apple provider enabled in Authentication > Providers
- [ ] Email OTP enabled in Authentication > Providers
- [ ] Redirect URL added: `slicefix://login`
- [ ] Email templates configured (optional but recommended)

### 3. Commands to Run Before Testing
```bash
# Navigate to mobile app
cd apps/mobile

# Install dependencies
npm install

# Type check
npm run typecheck

# Lint check
npm run lint

# Start development server
npm start
```

---

## Test Cases

### TC-001: Email OTP Flow (Happy Path)

**Steps:**
1. Launch app and complete onboarding
2. On Auth screen, enter a valid email address
3. Tap "Continue with Email"
4. Check email for verification code
5. Enter the 6-digit code
6. Verify navigation to Home screen

**Expected Results:**
- [ ] OTP email received within 30 seconds
- [ ] Code validation succeeds
- [ ] User appears in Supabase Users table
- [ ] App navigates to Home screen
- [ ] User email displayed in Settings

**Notes:**
- OTP codes expire after 1 hour
- Users can request a new code by going back and re-entering email

---

### TC-002: Email OTP - Invalid Code

**Steps:**
1. Request OTP code
2. Enter incorrect 6-digit code
3. Attempt verification

**Expected Results:**
- [ ] Error message displayed: "Invalid or expired code"
- [ ] User remains on OTP input screen
- [ ] Can try again with correct code

---

### TC-003: Apple Sign In (iOS Only)

**Preconditions:**
- Testing on iOS device or simulator
- Apple ID available for testing

**Steps:**
1. Launch app and complete onboarding
2. On Auth screen, tap "Sign in with Apple"
3. Authenticate with Apple ID
4. Verify navigation to Home screen

**Expected Results:**
- [ ] Apple authentication modal appears
- [ ] After approval, app navigates to Home
- [ ] User appears in Supabase with Apple provider
- [ ] User ID stored in app state

**Platform Notes:**
- Apple Sign In button is hidden on Android
- Nonce is generated for secure token exchange

---

### TC-004: Apple Sign In - Cancelled

**Steps:**
1. Tap "Sign in with Apple"
2. Cancel the Apple authentication modal

**Expected Results:**
- [ ] No error alert shown
- [ ] User remains on Auth screen
- [ ] Can try again

---

### TC-005: Skip Authentication

**Steps:**
1. On Auth screen, tap "Skip for now"

**Expected Results:**
- [ ] App navigates to Home screen
- [ ] Limited functionality available
- [ ] Settings shows "Sign In" option
- [ ] user state is null

---

### TC-006: Session Persistence

**Steps:**
1. Sign in via Email OTP or Apple
2. Close the app completely (not just background)
3. Reopen the app

**Expected Results:**
- [ ] App starts on Home screen (not Auth)
- [ ] User session is restored
- [ ] Settings shows user email
- [ ] No re-authentication required

---

### TC-007: Sign Out

**Steps:**
1. While signed in, go to Settings
2. Tap "Sign Out"
3. Confirm sign out

**Expected Results:**
- [ ] Session cleared from device
- [ ] App navigates to Auth screen
- [ ] Supabase session revoked
- [ ] Reopening app shows Auth screen

---

### TC-008: Deep Link Magic Link

**Preconditions:**
- Email OTP sent (magic link version)

**Steps:**
1. Request magic link email
2. Open magic link from email
3. App should open to LoginCallback screen

**Expected Results:**
- [ ] App opens via deep link
- [ ] "Signing you in..." displayed
- [ ] Session validated
- [ ] Navigates to Home on success
- [ ] Error shown if link expired

**Deep Link Format:**
```
slicefix://login#access_token=xxx&refresh_token=xxx
```

---

### TC-009: Delete Account

**Steps:**
1. Sign in to the app
2. Go to Settings
3. Tap "Delete Account"
4. Review deletion warnings
5. Tap "Delete My Account"
6. Type "DELETE" to confirm
7. Confirm deletion

**Expected Results:**
- [ ] Warning about permanent deletion shown
- [ ] Subscription warning if applicable
- [ ] Confirmation modal requires typing DELETE
- [ ] Account deleted from Supabase
- [ ] Local data cleared
- [ ] App navigates to Onboarding

---

### TC-010: Delete Account - Cancelled

**Steps:**
1. Go to Delete Account screen
2. Tap "Cancel" at any step

**Expected Results:**
- [ ] Returns to Settings
- [ ] Account not deleted
- [ ] Session preserved

---

### TC-011: Legal Links Accessible Without Login

**Steps:**
1. On Auth screen, verify footer links
2. Tap Terms of Service link
3. Tap Privacy Policy link

**Expected Results:**
- [ ] Links are visible on Auth screen
- [ ] Tapping opens external browser/webview
- [ ] Legal pages load correctly
- [ ] No authentication required to view

---

### TC-012: Auth State Sync

**Steps:**
1. Sign in on the app
2. In Supabase dashboard, delete the user
3. Return to app and trigger a network request

**Expected Results:**
- [ ] App detects invalid session
- [ ] User signed out automatically
- [ ] Navigates to Auth screen

---

## Security Verification

### SEC-001: No Secrets in Code
```bash
# Search for potential secrets
grep -r "service_role" apps/mobile/src/
grep -r "sk_live" apps/mobile/src/
grep -r "eyJ" apps/mobile/src/  # JWT tokens
```

**Expected:** No matches found

### SEC-002: .env Not Committed
```bash
# Check .gitignore
cat .gitignore | grep -E "\.env"
```

**Expected:** .env patterns present in .gitignore

### SEC-003: Only Anon Key Used
Review `apps/mobile/src/services/supabase.ts`:
- [ ] Only `SUPABASE_ANON_KEY` referenced
- [ ] No `service_role` or `SERVICE_ROLE_KEY`

---

## Admin Security SQL Verification

Run in Supabase SQL Editor:

```sql
-- Verify RLS enabled
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('admin_roles', 'audit_logs', 'rate_limits');

-- Verify privileges revoked
select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('admin_roles', 'audit_logs', 'rate_limits')
  and grantee in ('anon', 'authenticated');
```

**Expected:**
- [ ] All tables have `rowsecurity = true`
- [ ] No privileges for anon/authenticated on security tables

---

## Development Commands

```bash
# Run TypeScript check
cd apps/mobile && npm run typecheck

# Run ESLint
cd apps/mobile && npm run lint

# Run security audit
cd apps/mobile && npm audit

# Start Expo development
cd apps/mobile && npm start

# Run on iOS simulator
cd apps/mobile && npm run ios

# Run on Android emulator
cd apps/mobile && npm run android
```

---

## Troubleshooting

### Issue: OTP Email Not Received
1. Check spam folder
2. Verify email provider not blocking
3. Check Supabase dashboard for email logs
4. Verify SMTP settings in Supabase

### Issue: Apple Sign In Fails
1. Ensure `usesAppleSignIn: true` in app.json
2. Verify Apple provider enabled in Supabase
3. Check bundle identifier matches Apple Developer setup
4. Ensure development build (not Expo Go for Apple Auth)

### Issue: Deep Link Not Working
1. Verify scheme in app.json: `"scheme": "pocketcaddie"`
2. Test with: `npx uri-scheme open "slicefix://login" --ios`
3. Check linking config in App.tsx

### Issue: Session Not Persisting
1. Verify SecureStore is working
2. Check for AsyncStorage errors in console
3. Verify `persistSession: true` in Supabase config

---

## Sign-Off

| Test Case | Pass/Fail | Tester | Date |
|-----------|-----------|--------|------|
| TC-001 | | | |
| TC-002 | | | |
| TC-003 | | | |
| TC-004 | | | |
| TC-005 | | | |
| TC-006 | | | |
| TC-007 | | | |
| TC-008 | | | |
| TC-009 | | | |
| TC-010 | | | |
| TC-011 | | | |
| TC-012 | | | |

**QA Approved By:** ___________________
**Date:** ___________________

---

*SliceFix AI - Cien Rios LLC*
