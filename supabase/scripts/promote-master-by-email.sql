-- Run once in Supabase Dashboard → SQL Editor (not as an auto migration).
-- Replace the email below with your real login email, then Run.
--
-- After success: log out of Northing, log back in, then open /admin or click Account.

UPDATE public.profiles AS p
SET role = 'master'
FROM auth.users AS u
WHERE u.id = p.id
  AND lower(u.email) = lower('REPLACE_WITH_YOUR_EMAIL@example.com');

-- Verify (optional):
-- SELECT p.id, u.email, p.role FROM public.profiles p
-- JOIN auth.users u ON u.id = p.id WHERE lower(u.email) = lower('REPLACE_WITH_YOUR_EMAIL@example.com');
