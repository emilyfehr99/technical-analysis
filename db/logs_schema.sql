-- Create a robust logging table for all AI Analysis events
-- Run this in your Supabase SQL Editor

create table if not exists analysis_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  
  -- User Context
  user_id uuid references auth.users(id), -- Nullable (for anonymous users)
  ip_address text,
  user_agent text, -- Captures Browser/Device info
  
  -- Analysis Context
  symbol text, -- The ticker searched (e.g. "BTC", "AAPL")
  input_type text check (input_type in ('TEXT', 'IMAGE', 'HYBRID')),
  
  -- Outcome
  status text check (status in ('SUCCESS', 'FAILED')),
  error_message text, -- Capture failure reason if any
  
  -- Performance
  duration_ms int -- How long the AI took
);

-- Enable RLS (Security)
alter table analysis_logs enable row level security;

-- 1. Allow Service Role (Backend) to Insert Logs
create policy "Service Role can insert logs" on analysis_logs
  for insert with check (true);

-- 2. Allow Admins to View Logs (Optional, if you build an admin dashboard later)
-- create policy "Admins can view logs" on analysis_logs
--   for select using (auth.uid() in (select id from profiles where tier = 'premium'));
