-- Create Demo User for App Store Review
-- Email: appstore-review@cienrios.com
-- Password: SliceFix2026!Review

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Check if user already exists
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'appstore-review@cienrios.com';

  IF v_user_id IS NULL THEN
    -- Generate a new UUID for the user
    v_user_id := gen_random_uuid();

    -- Insert the demo user with pre-hashed password
    -- Password: SliceFix2026!Review
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role,
      aud,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'appstore-review@cienrios.com',
      -- Use extensions schema for crypt/gen_salt
      extensions.crypt('SliceFix2026!Review', extensions.gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"full_name": "App Store Reviewer"}'::jsonb,
      false,
      'authenticated',
      'authenticated',
      '',
      '',
      '',
      ''
    );

    -- Create identity for email login
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      created_at,
      updated_at,
      last_sign_in_at
    ) VALUES (
      gen_random_uuid(),
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', 'appstore-review@cienrios.com'),
      'email',
      v_user_id::text,
      NOW(),
      NOW(),
      NOW()
    );

    -- Create profile for the demo user
    INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
    VALUES (v_user_id, 'appstore-review@cienrios.com', 'App Store Reviewer', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Demo user created with ID: %', v_user_id;
  ELSE
    RAISE NOTICE 'Demo user already exists with ID: %', v_user_id;
  END IF;
END $$;
