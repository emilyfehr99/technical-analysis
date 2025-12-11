-- SAFE FIX V2 (Run this one)

-- 1. Safely Rename 'role' to 'plan' (Only if 'role' exists)
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'waitlist' AND column_name = 'role') THEN
      ALTER TABLE public.waitlist RENAME COLUMN role TO plan;
  END IF;
END $$;

-- 2. Rename 'plan' to 'role' IF you prefer that (Inverse check, uncomment if needed)
-- DO $$
-- BEGIN
--   IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'waitlist' AND column_name = 'plan') THEN
--       -- Do nothing, we want 'plan' to match code.
--   END IF;
-- END $$;

-- 3. Enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_logs ENABLE ROW LEVEL SECURITY;

-- 4. DROP Policies first (Fixes the "Policy already exists" error)
DROP POLICY IF EXISTS "Public insert waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Service interaction" ON public.waitlist;
DROP POLICY IF EXISTS "Public insert logs" ON public.analysis_logs;

-- 5. Create Policies
CREATE POLICY "Public insert waitlist" ON public.waitlist FOR INSERT WITH CHECK (true);
CREATE POLICY "Service interaction" ON public.waitlist FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "Public insert logs" ON public.analysis_logs FOR INSERT WITH CHECK (true);

-- 6. Secure Count Function (Idempotent)
create or replace function get_waitlist_count()
returns integer
language sql
security definer
as $$
  select count(*)::integer from waitlist;
$$;
