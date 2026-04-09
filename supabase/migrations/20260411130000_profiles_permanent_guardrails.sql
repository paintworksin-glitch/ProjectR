-- Permanent guardrails for profiles across environments:
-- - Required columns used by app logic
-- - RLS policies for self read/insert/update
-- - Auto-create profile row for new auth users
-- - Backfill missing profile rows for existing auth users

-- 1) Schema compatibility (safe, idempotent)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mobile_number text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS agent_verified boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free';

UPDATE public.profiles
SET mobile_number = COALESCE(NULLIF(TRIM(mobile_number), ''), phone)
WHERE mobile_number IS NULL OR mobile_number = '';

-- 2) RLS policies needed by app flows
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3) Keep profile row creation automatic for all future users
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, name, email, role, agent_verified, phone, mobile_number, plan
  )
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'name', ''),
      split_part(COALESCE(NEW.email, ''), '@', 1),
      'User'
    ),
    NULLIF(NEW.email, ''),
    'user',
    false,
    NULL,
    NULL,
    'free'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_profile();

-- 4) Backfill any existing users who somehow missed profile creation
INSERT INTO public.profiles (id, name, email, role, agent_verified, plan)
SELECT
  u.id,
  COALESCE(
    NULLIF(u.raw_user_meta_data->>'full_name', ''),
    NULLIF(u.raw_user_meta_data->>'name', ''),
    split_part(COALESCE(u.email, ''), '@', 1),
    'User'
  ),
  NULLIF(u.email, ''),
  'user',
  false,
  'free'
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- Optional: ask PostgREST to refresh schema cache after DDL.
NOTIFY pgrst, 'reload schema';
