-- Agents/sellers must be able to SELECT their own profile row for client checks (listing eligibility, etc.).
-- If RLS is on but no SELECT policy allows auth.uid() = id, PostgREST errors and the app shows
-- "Could not verify your profile."
-- Requires Row Level Security already enabled on public.profiles (default in Supabase).

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
