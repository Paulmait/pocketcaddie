-- 20260106000004_admin_portal_support.sql
-- Pocket Caddie AI — Admin Portal Support Columns
-- Effective: 2026-01-06
--
-- Adds columns needed for admin portal user management

-- =========================
-- 1) Profile Extensions
-- =========================
-- Add uploads_disabled flag for admin moderation
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS uploads_disabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT,
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

-- Index for finding disabled users
CREATE INDEX IF NOT EXISTS idx_profiles_uploads_disabled
  ON public.profiles(uploads_disabled)
  WHERE uploads_disabled = TRUE;

-- =========================
-- 2) Analysis Extensions
-- =========================
-- Add fields for analysis summary in admin portal
ALTER TABLE public.analyses
  ADD COLUMN IF NOT EXISTS confidence_score FLOAT,
  ADD COLUMN IF NOT EXISTS primary_issue TEXT;

-- Index for analysis summaries
CREATE INDEX IF NOT EXISTS idx_analyses_confidence
  ON public.analyses(confidence_score DESC);

-- =========================
-- 3) Admin Portal Specific Policies
-- =========================
-- These policies allow the admin portal (via service role) to function
-- while keeping the mobile app restricted

-- Service role bypasses RLS, so no additional policies needed for admin operations
-- The admin portal uses createAdminClient() which uses service_role key

-- =========================
-- 4) Comments for documentation
-- =========================
COMMENT ON COLUMN public.profiles.uploads_disabled IS 'Admin flag to prevent user from uploading new videos';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Current subscription status: free, trial, active, expired, cancelled';
COMMENT ON COLUMN public.profiles.subscription_tier IS 'Subscription tier: monthly, annual';
COMMENT ON COLUMN public.profiles.subscription_expires_at IS 'When current subscription period ends';
COMMENT ON COLUMN public.analyses.confidence_score IS 'AI confidence in analysis (0-1)';
COMMENT ON COLUMN public.analyses.primary_issue IS 'Main swing issue identified (e.g., "Over-the-top", "Early extension")';
