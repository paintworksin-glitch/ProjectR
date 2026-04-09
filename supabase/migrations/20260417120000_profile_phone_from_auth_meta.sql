-- 1) New auth users: copy 10-digit phone from raw_user_meta_data into profiles at insert time (admin table reads profiles only).
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone text;
BEGIN
  v_phone := right(regexp_replace(COALESCE(NEW.raw_user_meta_data->>'phone', ''), '\D', '', 'g'), 10);
  IF v_phone !~ '^\d{10}$' THEN
    v_phone := NULL;
  END IF;

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
    v_phone,
    v_phone,
    'free'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 2) One-time backfill: copy phone from auth.users metadata into empty profile rows (skip if number already taken).
UPDATE public.profiles p
SET
  phone = src.d10,
  mobile_number = src.d10
FROM (
  SELECT
    u.id,
    right(regexp_replace(COALESCE(u.raw_user_meta_data->>'phone', ''), '\D', '', 'g'), 10) AS d10
  FROM auth.users u
) AS src
WHERE p.id = src.id
  AND src.d10 ~ '^\d{10}$'
  AND (p.phone IS NULL OR btrim(COALESCE(p.phone::text, '')) = '')
  AND (p.mobile_number IS NULL OR btrim(COALESCE(p.mobile_number::text, '')) = '')
  AND NOT EXISTS (
    SELECT 1
    FROM public.profiles o
    WHERE o.id <> p.id
      AND right(regexp_replace(COALESCE(o.mobile_number, o.phone, ''), '\D', '', 'g'), 10) = src.d10
  );

NOTIFY pgrst, 'reload schema';
