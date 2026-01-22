-- Fix Remaining Supabase Linter Warnings
-- Fixes:
-- 1. Function search_path mutable warnings (6 functions)
-- 2. RLS enabled no policy warnings (2 tables)

-- =====================================================
-- FIX 1: Set secure search_path on functions
-- Using DO block to handle cases where functions may not exist
-- =====================================================

DO $$
BEGIN
  -- Fix set_updated_at function (trigger function)
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at' AND pronamespace = 'public'::regnamespace) THEN
    ALTER FUNCTION public.set_updated_at() SET search_path = public;
  END IF;

  -- Fix block_audit_mutations function (trigger function)
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'block_audit_mutations' AND pronamespace = 'public'::regnamespace) THEN
    ALTER FUNCTION public.block_audit_mutations() SET search_path = public;
  END IF;
END $$;

-- For functions with specific signatures, use DO blocks with exception handling
DO $$
BEGIN
  ALTER FUNCTION public.bump_rate_limit(UUID, TEXT, INT, INT) SET search_path = public;
EXCEPTION WHEN undefined_function THEN
  NULL; -- Function doesn't exist with this signature, skip
END $$;

DO $$
BEGIN
  ALTER FUNCTION public.is_active_admin(UUID) SET search_path = public;
EXCEPTION WHEN undefined_function THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER FUNCTION public.admin_password_is_fresh(UUID, INT) SET search_path = public;
EXCEPTION WHEN undefined_function THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER FUNCTION public.insert_audit_log(UUID, TEXT, TEXT, UUID, JSONB) SET search_path = public;
EXCEPTION WHEN undefined_function THEN
  NULL;
END $$;

-- =====================================================
-- FIX 2: Add RLS policies for tables without them
-- Using DO blocks to handle if policies already exist
-- =====================================================

-- Policy for audit_logs: Only service role can access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'Service role only audit access'
  ) THEN
    CREATE POLICY "Service role only audit access" ON audit_logs
      FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- Policy for rate_limits: Service role only (internal table)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'rate_limits' AND policyname = 'Service role manages rate limits'
  ) THEN
    CREATE POLICY "Service role manages rate limits" ON rate_limits
      FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- =====================================================
-- VERIFICATION QUERIES (run manually if needed)
-- =====================================================
-- Check functions have search_path set:
-- SELECT proname, proconfig FROM pg_proc WHERE proname IN ('set_updated_at', 'block_audit_mutations', 'bump_rate_limit', 'is_active_admin', 'admin_password_is_fresh', 'insert_audit_log');

-- Check RLS policies exist:
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';
