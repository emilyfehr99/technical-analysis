-- Security Fixes for Supabase Project (Updated)

-- 1. Fix "security_definer_view" errors
-- We drop the views first to avoid "cannot change name of view column" errors if the schema has changed.

DROP VIEW IF EXISTS view_bi_pricing_funnel;
DROP VIEW IF EXISTS view_bi_daily_signups;

CREATE OR REPLACE VIEW view_bi_daily_signups WITH (security_invoker=true) AS
SELECT 
    date_trunc('day', created_at) as day,
    count(*) as new_signups
FROM profiles
GROUP BY 1
ORDER BY 1 DESC;

CREATE OR REPLACE VIEW view_bi_pricing_funnel WITH (security_invoker=true) AS
WITH funnel_events AS (
    SELECT 
        session_id,
        max(case when event_name = 'click_pricing_header' then 1 else 0 end) as viewed_pricing,
        max(case when event_name = 'checkout_start' then 1 else 0 end) as started_checkout,
        max(case when event_name = 'checkout_success' then 1 else 0 end) as paid
    FROM analytics_events
    -- Look at last 30 days
    WHERE occurred_at > (now() - interval '30 days')
    GROUP BY session_id
)
SELECT 
    count(*) as total_pricing_visitors,
    sum(viewed_pricing) as step_1_viewed,
    sum(started_checkout) as step_2_clicked_buy,
    sum(paid) as step_3_paid,
    -- Dropoff Rates
    round(100.0 * sum(started_checkout) / nullif(sum(viewed_pricing), 0), 1) as conversion_to_click_pct,
    round(100.0 * sum(paid) / nullif(sum(started_checkout), 0), 1) as conversion_click_to_paid_pct
FROM funnel_events;


-- 2. Fix "function_search_path_mutable" error

CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
                -- FIXED: Removed "duration" column that caused crash
                SELECT started_at, user_agent, last_seen_at
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
