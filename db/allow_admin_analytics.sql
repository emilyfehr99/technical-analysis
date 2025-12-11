-- Allow Admins to View Analytics Data
-- These policies grant SELECT access to 'is_admin' users on analytics tables.

-- 1. Analytics Sessions
-- Drop existing policy if it conflicts (optional, but safer to just add new one with unique name)
DROP POLICY IF EXISTS "Admins can view all sessions" ON analytics_sessions;
CREATE POLICY "Admins can view all sessions"
ON analytics_sessions
FOR SELECT
TO authenticated
USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);

-- 2. Analytics Events
DROP POLICY IF EXISTS "Admins can view all events" ON analytics_events;
CREATE POLICY "Admins can view all events"
ON analytics_events
FOR SELECT
TO authenticated
USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);

-- 3. Waitlist (if not already public/readable)
DROP POLICY IF EXISTS "Admins can view waitlist" ON waitlist;
CREATE POLICY "Admins can view waitlist"
ON waitlist
FOR SELECT
TO authenticated
USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);

-- 4. Analysis Logs
DROP POLICY IF EXISTS "Admins can view all analysis logs" ON analysis_logs;
CREATE POLICY "Admins can view all analysis logs"
ON analysis_logs
FOR SELECT
TO authenticated
USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);
