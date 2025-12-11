-- 1. Fix Waitlist Mismatch
-- The application code sends 'plan' (monthly/annual), but schema has 'role'.
-- We rename 'role' to 'plan' to match the business logic.
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'waitlist' AND column_name = 'role') THEN
      ALTER TABLE public.waitlist RENAME COLUMN role TO plan;
  END IF;
END $$;

-- 2. Relax Constraint (if needed)
-- 'plan' might have been NOT NULL in 'role', but let's ensure it's nullable or handled if plans aren't always sent.
-- But usually it is sent. Let's keep it simple.

-- 3. Ensure RLS is Enabled (Critical for Security)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Re-apply Waitlist Policies (Idempotent-ish check)
DROP POLICY IF EXISTS "Public insert waitlist" ON public.waitlist;
CREATE POLICY "Public insert waitlist" ON public.waitlist FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service interaction" ON public.waitlist;
CREATE POLICY "Service interaction" ON public.waitlist FOR SELECT USING (auth.role() = 'service_role');

-- 5. Analysis Logs Policies (Allow users to insert their own logs? No, mostly service role or backend)
-- Actually, the backend (api/analyze.js) runs as Service Role usually? 
-- No, api/analyze.js uses `createClient(url, key)`. 
-- If using Service Role Key (SUPABASE_SERVICE_ROLE_KEY), it bypasses RLS.
-- If using Anon Key, we need Insert policy.
-- The code checks `process.env.SUPABASE_SERVICE_ROLE_KEY`. If set, it bypasses RLS.
-- If only ANON is available, we need:
CREATE POLICY "Public insert logs" ON public.analysis_logs FOR INSERT WITH CHECK (true);

-- 6. Ensure get_waitlist_count exists
create or replace function get_waitlist_count()
returns integer
language sql
security definer
as $$
  select count(*)::integer from waitlist;
$$;
