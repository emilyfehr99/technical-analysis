-- FIX: RLS Policy for Analytics Events
-- Error 42501 confirms the policy is blocking anon inserts.

-- 1. Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Enable insert for analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Enable read for analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Public access to events" ON analytics_events;

-- 2. Create PERMISSIVE policy for inserts
CREATE POLICY "Enable public usage of events"
ON analytics_events
FOR ALL
USING (true)
WITH CHECK (true);

-- 3. Ensure Grants
GRANT ALL ON analytics_events TO anon, authenticated, service_role;
