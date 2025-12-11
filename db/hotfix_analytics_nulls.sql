-- HOTFIX: Remove internal constraints preventing Analytics
-- The 'visitor_id' column exists in your DB but not in the code, causing inserts to fail.

ALTER TABLE analytics_sessions 
ALTER COLUMN visitor_id DROP NOT NULL;

-- Optional: If you want to drop it entirely (cleaner) but safer to just drop not null first
-- ALTER TABLE analytics_sessions DROP COLUMN visitor_id;

-- Ensure RLS is definitely open for anon (Redundant but safe)
GRANT ALL ON analytics_sessions TO anon, authenticated, service_role;
GRANT ALL ON analytics_page_views TO anon, authenticated, service_role;
GRANT ALL ON analytics_events TO anon, authenticated, service_role;
