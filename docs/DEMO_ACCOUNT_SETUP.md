# Demo Account Setup for App Store Review

This guide explains how to create and configure the demo account for Apple App Store review.

## Demo Account Credentials

| Field | Value |
|-------|-------|
| **Email** | `appstore-review@cienrios.com` |
| **Password** | `SliceFix2026!Review` |
| **Access Level** | Premium (Annual subscription) |

## Step 1: Create the User in Supabase

### Option A: Using Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Users**
4. Click **Add User** → **Create New User**
5. Fill in:
   - Email: `appstore-review@cienrios.com`
   - Password: `SliceFix2026!Review`
   - Check "Auto Confirm User" (important!)
6. Click **Create User**

### Option B: Using SQL (in Supabase SQL Editor)

```sql
-- Create demo user with password
-- Run this in Supabase Dashboard > SQL Editor

-- Note: This requires the service_role or admin access
-- The password will be hashed automatically by Supabase

INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  'appstore-review@cienrios.com',
  crypt('SliceFix2026!Review', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "App Store Reviewer"}',
  false,
  'authenticated'
);

-- Create profile for the demo user
INSERT INTO public.profiles (id, email, full_name)
SELECT id, email, 'App Store Reviewer'
FROM auth.users
WHERE email = 'appstore-review@cienrios.com';
```

## Step 2: Verify the Account Works

1. Open the app on a device/simulator
2. Tap "Sign In"
3. Enter email: `appstore-review@cienrios.com`
4. Tap "Continue with Email"
5. When prompted for password, enter: `SliceFix2026!Review`
6. You should be logged in with Premium access

## Step 3: Limit to Single Demo Account

The demo account is already limited:
- Only `appstore-review@cienrios.com` receives automatic premium access
- Other users must go through normal subscription flow
- The hardcoded password only works for this specific email

## Security Measures

1. **Single Account**: Only one demo account email is recognized
2. **Premium Auto-Grant**: Only demo account gets free premium
3. **Rate Limited**: Standard rate limits apply
4. **Can Disable**: Set `DEMO_CONFIG.ENABLED = false` in `src/config/security.ts` to disable

## For App Store Submission

Add this to **App Review Information** in App Store Connect:

```
Demo Account Credentials:

Email: appstore-review@cienrios.com
Password: SliceFix2026!Review

Instructions:
1. Launch app and complete onboarding
2. Tap "Sign In"
3. Enter the email above
4. Tap "Continue with Email"
5. Enter the password above
6. You now have full Premium access to test all features

Note: This account has automatic premium access for review purposes.
```

## Troubleshooting

### "Invalid email or password" error
- Verify the user exists in Supabase Dashboard → Authentication → Users
- Check that email confirmation is complete (email_confirmed_at is set)
- Try resetting the password in Supabase Dashboard

### User exists but can't log in
- The user may need to be confirmed. In Supabase Dashboard:
  1. Find the user in Authentication → Users
  2. Click the user
  3. Click "Confirm Email" if not confirmed

### Premium access not working
- Verify the email matches exactly: `appstore-review@cienrios.com`
- Check `DEMO_CONFIG.ENABLED` is `true` in security.ts
