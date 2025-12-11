-- CLEANUP DUPLICATE POLICIES
-- Issue: Multiple policies doing the same thing (e.g. "Public insert" vs "Enable insert for everyone")
-- Fix: Drop ALL variations and re-create just ONE single policy per action.

-- 1. Table: waitlist (INSERT)
DROP POLICY IF EXISTS "Enable insert for everyone" ON public.waitlist;
DROP POLICY IF EXISTS "Public can insert waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Public insert waitlist" ON public.waitlist;

CREATE POLICY "Public insert waitlist" ON public.waitlist 
FOR INSERT WITH CHECK (true);

-- 2. Table: analysis_logs (INSERT)
DROP POLICY IF EXISTS "Public insert logs" ON public.analysis_logs;
DROP POLICY IF EXISTS "Service Role can insert logs" ON public.analysis_logs;

CREATE POLICY "Public insert logs" ON public.analysis_logs 
FOR INSERT WITH CHECK (true);

-- 3. Table: analytics_page_views (INSERT)
DROP POLICY IF EXISTS "Allow public insert page views" ON public.analytics_page_views;
DROP POLICY IF EXISTS "Public insert pageviews" ON public.analytics_page_views;

CREATE POLICY "Public insert pageviews" ON public.analytics_page_views 
FOR INSERT WITH CHECK (true);

-- 4. Table: analytics_sessions (INSERT & UPDATE)
DROP POLICY IF EXISTS "Allow public insert sessions" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Public insert sessions" ON public.analytics_sessions;

CREATE POLICY "Public insert sessions" ON public.analytics_sessions 
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update sessions" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Public update sessions" ON public.analytics_sessions;

CREATE POLICY "Public update sessions" ON public.analytics_sessions 
FOR UPDATE USING (true);

-- 5. Table: profiles (INSERT - just in case)
-- (Profiles usually managed by Supabase Auth, but if you have a policy, ensure it's unique)
-- No changes needed here based on report, but good to be aware.
