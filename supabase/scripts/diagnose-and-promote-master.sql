-- =============================================================================
-- Northing: diagnose why "promote to master" fails, then fix it
-- Supabase Dashboard → SQL Editor
-- =============================================================================
--
-- METHOD A — No SQL join (most reliable)
-- 1) Dashboard → Authentication → Users → click your user → copy "User UID"
-- 2) Run ONLY the block in section (C) below, paste your UUID in place of ... 
--
-- METHOD B — Table Editor (no SQL)
-- 1) Table Editor → public.profiles → find row where id = your User UID
-- 2) Edit column "role" → type: master → Save
--    (If no row exists, sign in to Northing once, then refresh Table Editor.)
--
-- =============================================================================

-- (A) LIST USERS (see emails + ids — helps if email in auth differs from profiles)
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 30;

-- (B) LIST PROFILES (compare id to auth.users above)
SELECT id, email, role, name
FROM public.profiles
ORDER BY id
LIMIT 50;

-- (C) PROMOTE BY USER ID — replace the UUID with your User UID from Authentication
UPDATE public.profiles
SET role = 'master'
WHERE id = '00000000-0000-0000-0000-000000000000'::uuid;

-- (D) If (C) says UPDATE 0: you have no profiles row for that user.
--     Log in to Northing once, then run (B) again. If still missing, the app
--     may not be creating profiles — fix app signup first.

-- (E) Optional: promote by email on profiles only (if profiles.email is set)
-- UPDATE public.profiles
-- SET role = 'master'
-- WHERE lower(trim(email)) = lower(trim('your@email.com'));
