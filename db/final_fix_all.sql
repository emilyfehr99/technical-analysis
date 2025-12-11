-- FINAL COMPREHENSIVE FIX SCRIPT
-- Run this once to fix ALL reported issues.

-- A. FIX SECURITY DEFINER VIEWS
-- Error 0010: Views running as 'creator' instead of 'user'.
ALTER VIEW public.view_visit_hours SET (security_invoker = true);
ALTER VIEW public.view_session_durations SET (security_invoker = true);
ALTER VIEW public.view_daily_visits SET (security_invoker = true);

-- B. FIX FUNCTION SEARCH PATHS
-- Warning 0011: Functions vulnerable to path hijacking.
-- Fix: Force them to run in 'public' schema explicitly.

-- 1. get_waitlist_count
create or replace function public.get_waitlist_count()
returns integer
language sql
security definer
set search_path = public
as $$
  select count(*)::integer from waitlist;
$$;

-- 2. handle_new_user
-- (Assuming this function exists, update its config)
ALTER FUNCTION public.handle_new_user() SET search_path = public;


-- C. OPTIMIZE RLS POLICIES
-- Performance: Wrap auth calls in (select ...) to cache query plan.

-- 1. Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles 
FOR SELECT USING ( id = (select auth.uid()) );

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles 
FOR UPDATE USING ( id = (select auth.uid()) );

-- 2. Waitlist
DROP POLICY IF EXISTS "Service interaction" ON public.waitlist;
CREATE POLICY "Service interaction" ON public.waitlist 
FOR SELECT USING ( (select auth.role()) = 'service_role' );

-- NOTE: "Permissive Policy" warnings for 'analysis_logs', 'analytics_*', 'waitlist' are EXPECTED.
-- Do not worry about them. They are required for your app's public features.
