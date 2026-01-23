-- Fix Supabase Database Warnings
-- Generated: 2026-01-23

-- ============================================
-- 1. ADD MISSING INDEX FOR FOREIGN KEY
-- ============================================
-- The video_cleanup_queue table has a foreign key on user_id without a covering index
-- This can cause slow DELETE operations on the profiles table

CREATE INDEX IF NOT EXISTS idx_video_cleanup_queue_user_id
ON public.video_cleanup_queue(user_id);

-- ============================================
-- 2. CREATE DRILL TRACKING TABLE
-- ============================================
-- Track user drill practice for persistence and analytics

CREATE TABLE IF NOT EXISTS public.drill_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  drill_id TEXT NOT NULL,
  drill_name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for user queries (most common access pattern)
CREATE INDEX IF NOT EXISTS idx_drill_completions_user_id
ON public.drill_completions(user_id);

-- Index for recent completions
CREATE INDEX IF NOT EXISTS idx_drill_completions_completed_at
ON public.drill_completions(completed_at DESC);

-- RLS Policies for drill_completions
ALTER TABLE public.drill_completions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own drill completions
CREATE POLICY drill_completions_select_own ON public.drill_completions
  FOR SELECT USING (user_id = (SELECT auth.uid()));

-- Users can insert their own drill completions
CREATE POLICY drill_completions_insert_own ON public.drill_completions
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

-- Users can update their own drill completions
CREATE POLICY drill_completions_update_own ON public.drill_completions
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

-- Users can delete their own drill completions
CREATE POLICY drill_completions_delete_own ON public.drill_completions
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- ============================================
-- NOTE: UNUSED INDEXES
-- ============================================
-- The following indexes show as "unused" in the linter because
-- the app is new and hasn't had production traffic yet.
-- These are reasonable indexes that may be useful:
--
-- - idx_video_cleanup_delete_after (cleanup scheduling)
-- - idx_analytics_events_* (analytics queries)
-- - admin_roles_role_idx (admin lookup)
-- - audit_logs_* (audit queries)
-- - rate_limits_window_idx (rate limiting)
-- - idx_profiles_uploads_disabled (admin queries)
-- - idx_analyses_* (analysis queries)
--
-- Keep these indexes as they support expected query patterns.
-- Monitor usage after production launch and remove if unused.
