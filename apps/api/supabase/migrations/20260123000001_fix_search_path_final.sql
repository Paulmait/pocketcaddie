-- Fix Function Search Path Warnings (Final)
-- Corrected function signatures based on actual definitions

-- bump_rate_limit(text, int, int)
ALTER FUNCTION public.bump_rate_limit(text, int, int) SET search_path = public;

-- is_active_admin(uuid, text)
ALTER FUNCTION public.is_active_admin(uuid, text) SET search_path = public;

-- insert_audit_log(uuid, text, text, uuid, jsonb, text, text)
ALTER FUNCTION public.insert_audit_log(uuid, text, text, uuid, jsonb, text, text) SET search_path = public;
