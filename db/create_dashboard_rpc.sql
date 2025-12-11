-- Create a Security Definer function to fetch Admin Stats
-- This bypasses RLS on the underlying tables, ensuring the Dashboard always loads
-- provided the user is an admin.

CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
    is_admin_check boolean;
BEGIN
    -- 1. Security Check: Ensure caller is Admin
    SELECT is_admin INTO is_admin_check
    FROM profiles
    WHERE id = auth.uid();

    IF is_admin_check IS NOT TRUE THEN
        RAISE EXCEPTION 'Access Denied: User is not an admin';
    END IF;

    -- 2. Aggregations
    SELECT json_build_object(
        'sessions', (
            SELECT coalesce(json_agg(t), '[]'::json)
            FROM (
                SELECT started_at, duration, user_agent, last_seen_at
                FROM analytics_sessions
                WHERE started_at > (now() - interval '30 days')
                ORDER BY started_at ASC
            ) t
        ),
        'signups', (
             SELECT coalesce(json_agg(t), '[]'::json)
             FROM (
                 SELECT created_at
                 FROM waitlist
                 WHERE created_at > (now() - interval '30 days')
             ) t
        ),
        'recents', (
             SELECT coalesce(json_agg(t), '[]'::json)
             FROM (
                 SELECT id, event_name, created_at, user_id, metadata
                 FROM analytics_events
                 ORDER BY created_at DESC
                 LIMIT 50
             ) t
        ),
        'profiles_counts', (
             SELECT json_build_object(
                'premium', (SELECT count(*) FROM profiles WHERE tier = 'premium'),
                'free', (SELECT count(*) FROM profiles WHERE tier = 'free')
             )
        )
    ) INTO result;

    RETURN result;
END;
$$;
