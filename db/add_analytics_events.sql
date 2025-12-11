-- 3. EVENTS TABLE
-- Tracks specific user interactions (clicks, features, etc)
create table if not exists analytics_events (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references analytics_sessions(id) on delete cascade,
  event_name text not null,
  properties jsonb default '{}'::jsonb,
  occurred_at timestamptz default now()
);

-- RLS
alter table analytics_events enable row level security;
create policy "Public insert events" on analytics_events for insert with check (true);
