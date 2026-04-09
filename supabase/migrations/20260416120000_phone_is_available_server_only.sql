-- phone_is_available: callable only with service role (use /api/check-phone from the app).

REVOKE EXECUTE ON FUNCTION public.phone_is_available(text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.phone_is_available(text, uuid) TO service_role;

NOTIFY pgrst, 'reload schema';
