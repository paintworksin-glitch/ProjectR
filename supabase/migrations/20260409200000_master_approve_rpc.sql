-- Approve / disable via RPC avoids PostgREST "schema cache" issues on PATCH to profiles
-- when a new column exists in Postgres but the API cache has not refreshed yet.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS agent_verified boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.master_approve_agent(target_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'master'
  ) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  UPDATE public.profiles
  SET agent_verified = true
  WHERE id = target_id AND role = 'agent';
END;
$$;

CREATE OR REPLACE FUNCTION public.master_disable_user(target_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'master'
  ) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  IF target_id = auth.uid() THEN
    RAISE EXCEPTION 'cannot disable self' USING ERRCODE = '42501';
  END IF;
  UPDATE public.profiles
  SET role = 'disabled'
  WHERE id = target_id;
END;
$$;

REVOKE ALL ON FUNCTION public.master_approve_agent(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.master_disable_user(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.master_approve_agent(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.master_disable_user(uuid) TO authenticated;

-- Ask PostgREST to reload schema (helps REST/PATCH after DDL)
NOTIFY pgrst, 'reload schema';
