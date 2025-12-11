-- Consolidated Analytics Schema (Fix All)

-- 1. Enable RLS on all tables (Idempotent)
create table if not exists analytics_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  ip_address text,
  user_agent text,
  started_at timestamptz default now(),
  last_seen_at timestamptz default now()
);

create table if not exists analytics_page_views (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references analytics_sessions(id) on delete cascade,
  path text not null,
  viewed_at timestamptz default now()
);

create table if not exists analytics_events (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references analytics_sessions(id) on delete cascade,
  event_name text not null,
  properties jsonb default '{}'::jsonb,
  occurred_at timestamptz default now()
);

alter table analytics_sessions enable row level security;
alter table analytics_page_views enable row level security;
alter table analytics_events enable row level security;

-- 2. Create Policies (Drop first to avoid conflicts if they exist with different definitions)
drop policy if exists "Public insert sessions" on analytics_sessions;
create policy "Public insert sessions" on analytics_sessions for insert with check (true);

drop policy if exists "Public update sessions" on analytics_sessions;
create policy "Public update sessions" on analytics_sessions for update using (true);

drop policy if exists "Public insert pageviews" on analytics_page_views;
create policy "Public insert pageviews" on analytics_page_views for insert with check (true);

drop policy if exists "Public insert events" on analytics_events;
create policy "Public insert events" on analytics_events for insert with check (true);

-- 3. Grant Permissions to Anon/Authenticated
grant all on analytics_sessions to anon, authenticated, service_role;
grant all on analytics_page_views to anon, authenticated, service_role;
grant all on analytics_events to anon, authenticated, service_role;
