-- FINAL PERMISSIONS FIX
-- Run this to force the Dashboard to work.

-- 1. Ensure Profiles are Readable (so we can check is_admin)
-- We drop the policy first to avoid conflicts, then recreate it.
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
TO authenticated 
USING ( auth.uid() = id );

-- 2. Grant Admin Access to Analytics Tables
-- We use a simplified check to avoid recursion or lockouts.
-- NOTE: We trust that 'is_admin' is set correctly on the profile.

DROP POLICY IF EXISTS "Admins view sessions" ON analytics_sessions;
CREATE POLICY "Admins view sessions"
ON analytics_sessions FOR SELECT
TO authenticated
USING ( 
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true 
);

DROP POLICY IF EXISTS "Admins view events" ON analytics_events;
CREATE POLICY "Admins view events"
ON analytics_events FOR SELECT
TO authenticated
USING ( 
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true 
);

DROP POLICY IF EXISTS "Admins view waitlist" ON waitlist;
CREATE POLICY "Admins view waitlist"
ON waitlist FOR SELECT
TO authenticated
USING ( 
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true 
);

DROP POLICY IF EXISTS "Admins view analysis" ON analysis_logs;
CREATE POLICY "Admins view analysis"
ON analysis_logs FOR SELECT
TO authenticated
USING ( 
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true 
);

-- 3. Just in case: Allow Anon insert (so tracking works)
DROP POLICY IF EXISTS "Anon insert sessions" ON analytics_sessions;
CREATE POLICY "Anon insert sessions" ON analytics_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Anon insert events" ON analytics_events;
CREATE POLICY "Anon insert events" ON analytics_events FOR INSERT TO anon, authenticated WITH CHECK (true);
