-- BUSINESS INTELLIGENCE VIEWS
-- Run this to get "Sign Ups" and "Pricing Dropoff" insights in Supabase

-- 1. Daily Signups View
-- Counts new rows in 'profiles' by day.
-- Requires that you have a 'profiles' table with 'created_at'.
create or replace view view_bi_daily_signups as
select 
    date_trunc('day', created_at) as day,
    count(*) as new_signups
from profiles
group by 1
order by 1 desc;

-- 2. Pricing Funnel / Dropoff View
-- Shows how many people Viewed Pricing vs Started Checkout vs Paid
create or replace view view_bi_pricing_funnel as
with funnel_events as (
    select 
        session_id,
        max(case when event_name = 'click_pricing_header' then 1 else 0 end) as viewed_pricing,
        max(case when event_name = 'checkout_start' then 1 else 0 end) as started_checkout,
        max(case when event_name = 'checkout_success' then 1 else 0 end) as paid
    from analytics_events
    -- Look at last 30 days
    where occurred_at > (now() - interval '30 days')
    group by session_id
)
select 
    count(*) as total_pricing_visitors,
    sum(viewed_pricing) as step_1_viewed,
    sum(started_checkout) as step_2_clicked_buy,
    sum(paid) as step_3_paid,
    -- Dropoff Rates
    round(100.0 * sum(started_checkout) / nullif(sum(viewed_pricing), 0), 1) as conversion_to_click_pct,
    round(100.0 * sum(paid) / nullif(sum(started_checkout), 0), 1) as conversion_click_to_paid_pct
from funnel_events;

-- 3. Top Dropoff Pages (Where do they go instead?)
-- This is harder in SQL without complex path analysis, but we can verify 
-- if they viewed pricing and then viewed nothing else.
