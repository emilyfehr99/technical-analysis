-- 1. Fix Security Definer Views (Error: 0010)
-- "These views enforce permissions of the creator... rather than the querying user"
-- Fix: Make them "Security Invoker" so they respect the underlying RLS of the person asking.

-- Note: This requires Postgres 15+ (standard on Supabase now).
ALTER VIEW public.view_visit_hours SET (security_invoker = true);
ALTER VIEW public.view_session_durations SET (security_invoker = true);
ALTER VIEW public.view_daily_visits SET (security_invoker = true);

-- 2. Fix Function Search Path (Warning: 0011)
-- "Detects functions where the search_path parameter is not set."
-- Fix: Explicitly set search_path to 'public' to prevent hijacking.

create or replace function get_waitlist_count()
returns integer
language sql
security definer
set search_path = public -- FIX ADDED HERE
as $$
  select count(*)::integer from waitlist;
$$;

-- I don't have the definition for 'handle_new_user' handy, but I can patch it safely via ALTER:
ALTER FUNCTION public.handle_new_user() SET search_path = public;
