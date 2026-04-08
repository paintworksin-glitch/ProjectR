-- =============================================================================
-- Northing: grant master (admin) to the account that uses this email
-- Run in: Supabase Dashboard → SQL Editor → paste → Run
-- =============================================================================
--
-- BEFORE: Replace YOUR_EMAIL below (both places) with your real login email.
-- AFTER:  Sign out of Northing, sign in again, then open /admin
--
-- If UPDATE returns 0 rows, run the VERIFY query at the bottom and fix email.
-- =============================================================================

-- (1) PROMOTE TO MASTER — run this (edit email first)
UPDATE public.profiles AS p
SET role = 'master'
FROM auth.users AS u
WHERE u.id = p.id
  AND lower(trim(u.email)) = lower(trim('YOUR_EMAIL@example.com'));

-- (2) VERIFY — optional; run after (1) to confirm
-- SELECT u.email, p.role, p.id
-- FROM public.profiles p
-- INNER JOIN auth.users u ON u.id = p.id
-- WHERE lower(trim(u.email)) = lower(trim('YOUR_EMAIL@example.com'));
