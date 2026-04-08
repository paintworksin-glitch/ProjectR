-- Allow users with role = 'master' to UPDATE other users' profiles (agent approval, disable user, etc.).
-- Without this, RLS blocks updates where auth.uid() <> profiles.id.

CREATE OR REPLACE FUNCTION public.is_master()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'master'
  );
$$;

REVOKE ALL ON FUNCTION public.is_master() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_master() TO authenticated;

DROP POLICY IF EXISTS "Masters can update any profile" ON public.profiles;
CREATE POLICY "Masters can update any profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_master())
  WITH CHECK (public.is_master());
