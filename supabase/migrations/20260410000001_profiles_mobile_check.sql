-- Enforce mobile_number is NULL or exactly 10 digits (Indian national, digits only).

UPDATE public.profiles
SET mobile_number = NULL
WHERE mobile_number IS NOT NULL AND mobile_number !~ '^\d{10}$';

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS mobile_number_length;

ALTER TABLE public.profiles
  ADD CONSTRAINT mobile_number_length
  CHECK (mobile_number IS NULL OR mobile_number ~ '^\d{10}$');

NOTIFY pgrst, 'reload schema';
