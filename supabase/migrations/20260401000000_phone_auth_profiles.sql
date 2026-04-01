-- Phone-first login: optional email; allow users to INSERT their own profiles row after SMS OTP.
--
-- How to run (pick one):
-- • Supabase Dashboard → SQL Editor: paste THIS ENTIRE FILE’s contents (from the next line down).
--   Do NOT paste the filepath "supabase/migrations/..." — that is not SQL and will error.
-- • Or locally: supabase db push

-- 1) Email optional (phone-only users)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'email'
  ) THEN
    ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;
  END IF;
END $$;

-- 2) Empty string → NULL (avoids duplicate '' if email is UNIQUE)
UPDATE public.profiles SET email = NULL WHERE email = '';

-- 3) RLS: insert own profile only (id must match JWT sub)
--    Does not change existing SELECT policies (e.g. public agent pages stay as you configured).
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
