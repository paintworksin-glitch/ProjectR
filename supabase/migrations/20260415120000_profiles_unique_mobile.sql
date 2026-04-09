-- One account per Indian mobile (10-digit national): dedupe legacy rows, then enforce uniqueness.

-- 1) Clear duplicate normalized mobiles — keep oldest row per number (by created_at, then id).
WITH ranked AS (
  SELECT
    p.id,
    right(regexp_replace(COALESCE(p.mobile_number, p.phone, ''), '\D', '', 'g'), 10) AS d10,
    ROW_NUMBER() OVER (
      PARTITION BY right(regexp_replace(COALESCE(p.mobile_number, p.phone, ''), '\D', '', 'g'), 10)
      ORDER BY p.created_at ASC NULLS LAST, p.id ASC
    ) AS rn
  FROM public.profiles p
  WHERE length(regexp_replace(COALESCE(p.mobile_number, p.phone, ''), '\D', '', 'g')) >= 10
)
UPDATE public.profiles p
SET mobile_number = NULL, phone = NULL
FROM ranked r
WHERE p.id = r.id AND r.rn > 1 AND r.d10 ~ '^[0-9]{10}$';

-- 2) RPC: check if a 10-digit number is free (optional exclude = current user for profile edits).
CREATE OR REPLACE FUNCTION public.phone_is_available(p_digits text, p_exclude uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  norm text;
BEGIN
  norm := right(regexp_replace(COALESCE(p_digits, ''), '\D', '', 'g'), 10);
  IF length(norm) <> 10 OR norm !~ '^[0-9]{10}$' THEN
    RETURN true;
  END IF;
  RETURN NOT EXISTS (
    SELECT 1
    FROM public.profiles pr
    WHERE right(regexp_replace(COALESCE(pr.mobile_number, pr.phone, ''), '\D', '', 'g'), 10) = norm
      AND (p_exclude IS NULL OR pr.id <> p_exclude)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.phone_is_available(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.phone_is_available(text, uuid) TO anon, authenticated;

-- 3) Unique index on normalized 10-digit mobile (India).
DROP INDEX IF EXISTS profiles_mobile_norm_10_unique;
CREATE UNIQUE INDEX profiles_mobile_norm_10_unique
ON public.profiles (
  (right(regexp_replace(COALESCE(mobile_number, phone, ''), '\D', '', 'g'), 10))
)
WHERE length(regexp_replace(COALESCE(mobile_number, phone, ''), '\D', '', 'g')) >= 10;

NOTIFY pgrst, 'reload schema';
