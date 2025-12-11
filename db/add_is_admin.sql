-- Add is_admin column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Policy to allow users to read their own is_admin status
-- (Assuming standard RLS exists, if not we might need to add it, but usually profiles is readable by owner)
-- existing policies usually cover "select * from profiles where id = auth.uid()"
