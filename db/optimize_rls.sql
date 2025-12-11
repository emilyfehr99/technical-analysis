-- Optimize RLS Policies
-- Issue: "re-evaluates current_setting() or auth.uid() for each row"
-- Fix: Wrap in (select auth.uid()) to cache the result per statement.

-- 1. Profiles: "Users can view own profile"
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles 
FOR SELECT USING ( id = (select auth.uid()) );

-- 2. Profiles: "Users can update own profile"
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles 
FOR UPDATE USING ( id = (select auth.uid()) );

-- 3. Waitlist: Service Interaction (Optional, usually service role bypasses RLS anyway, but good for completeness)
DROP POLICY IF EXISTS "Service interaction" ON public.waitlist;
CREATE POLICY "Service interaction" ON public.waitlist 
FOR SELECT USING ( (select auth.role()) = 'service_role' );

-- NOTE regarding "Permissive Policies":
-- The warnings about "Public insert" on `analysis_logs`, `analytics_*`, and `waitlist` are EXPECTED.
-- Your app explicitly allows anonymous users to run analysis and join the waitlist.
-- We are keeping those policies as is to ensure functionality.
