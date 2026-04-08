-- Run in Supabase SQL Editor after is_master() exists.
-- Stops verified agents from changing their own role; masters can still update (e.g. disable user).

CREATE OR REPLACE FUNCTION public.enforce_verified_agent_role_lock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.role = 'agent'
       AND COALESCE(OLD.agent_verified, false) = true
       AND NEW.role IS DISTINCT FROM 'agent'
       AND NOT public.is_master()
    THEN
      RAISE EXCEPTION 'Verified agents cannot change account type without admin'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_lock_verified_agent_role ON public.profiles;
CREATE TRIGGER profiles_lock_verified_agent_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_verified_agent_role_lock();
