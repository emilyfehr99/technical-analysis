-- Waitlist Table
create table if not exists waitlist (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  plan text, -- 'monthly' or 'annual'
  created_at timestamptz default now(),
  constraint email_unique unique (email)
);

-- RLS
alter table waitlist enable row level security;

-- Allow public inserts (anyone can join waitlist)
create policy "Public insert waitlist" on waitlist for insert with check (true);

-- Only service role can read (for privacy)
create policy "Service interaction" on waitlist for select using (auth.role() = 'service_role');

-- Securely get count without exposing emails
create or replace function get_waitlist_count()
returns integer
language sql
security definer
as $$
  select count(*)::integer from waitlist;
$$;
