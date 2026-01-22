-- Security Fixes Migration
-- Fixes Supabase linter warnings:
-- 1. RLS disabled on account_deletions table
-- 2. Function search_path mutable warnings

-- =====================================================
-- FIX 1: Enable RLS on account_deletions table
-- =====================================================

-- Enable RLS
ALTER TABLE account_deletions ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access account_deletions (audit log)
-- Users should not be able to read/modify deletion records
CREATE POLICY "Service role only access" ON account_deletions
  FOR ALL USING (false);

-- =====================================================
-- FIX 2: Set secure search_path on functions
-- =====================================================

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;

-- =====================================================
-- VERIFICATION: Check that fixes are applied
-- =====================================================

-- You can run this query to verify RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- You can run this query to verify function search_path:
-- SELECT proname, prosecdef, proconfig
-- FROM pg_proc
-- WHERE proname IN ('update_updated_at_column', 'handle_new_user');
