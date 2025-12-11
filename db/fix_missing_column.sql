-- FIX: Add missing 'ip_address' column
-- The client (or cached version of it) is trying to send 'ip_address', but the table lacks it.

ALTER TABLE analytics_sessions 
ADD COLUMN IF NOT EXISTS ip_address text;

-- Ensure permissions
GRANT ALL ON analytics_sessions TO anon, authenticated, service_role;
