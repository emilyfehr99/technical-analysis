-- Run this in Supabase SQL Editor to enable Advanced Analytics

-- 1. SESSIONS TABLE
-- Tracks the start and end of a user's visit
create table if not exists analytics_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  ip_address text,
  user_agent text,
  started_at timestamptz default now(),
  last_seen_at timestamptz default now() -- Updated via heartbeat
);

-- 2. PAGE VIEWS TABLE
-- Tracks every page/screen the user sees
create table if not exists analytics_page_views (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references analytics_sessions(id) on delete cascade,
  path text not null,
  viewed_at timestamptz default now() -- Time of view
);

-- Security Policies (RLS)
alter table analytics_sessions enable row level security;
alter table analytics_page_views enable row level security;

-- Allow anyone (anon + auth) to insert metrics
create policy "Public insert sessions" on analytics_sessions for insert with check (true);
create policy "Public update sessions" on analytics_sessions for update using (true); 
-- Note: In a stricter app, you'd verify the user owns the session. For analytics, this is acceptable.

create policy "Public insert pageviews" on analytics_page_views for insert with check (true);

-- ANALYTICS VIEWS (Reporting) -----------------------

-- Q1: "How many minutes a user's session lasted?"
create or replace view view_session_durations as
select 
    id as session_id,
    user_id,
    started_at,
    last_seen_at,
    extract(epoch from (last_seen_at - started_at)) / 60 as duration_minutes
from analytics_sessions;

-- Q2: "How many times a day a user has visited?"
create or replace view view_daily_visits as
select 
    user_id,
    date_trunc('day', started_at) as visit_date,
    count(*) as visit_count
from analytics_sessions
where user_id is not null
group by 1, 2;

-- Q3: "Time of day per user visit"
create or replace view view_visit_hours as
select 
    extract(hour from started_at) as hour_of_day,
    count(*) as total_visits
from analytics_sessions
group by 1
order by 1;
