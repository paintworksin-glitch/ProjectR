-- Run in Supabase → SQL Editor (paste the whole file).
-- Fixes: "Could not find the 'agent_verified' column of 'profiles' in the schema cache"
-- Safe to run more than once (IF NOT EXISTS).

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS agent_verified boolean NOT NULL DEFAULT false;

-- Optional: if other Northing profile columns are missing, uncomment:
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mobile_number text;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free';
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rera_number text;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city text;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
