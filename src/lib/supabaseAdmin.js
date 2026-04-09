import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client with elevated privileges.
 * Must use the **service_role** secret from Supabase Dashboard → Settings → API (not the anon key).
 */
export function createSupabaseAdminClient() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const serviceRoleKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    ""
  ).trim();
  if (!url || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/** Map Supabase errors to a safe hint when the service role key is wrong. */
export function adminApiErrorMessage(err) {
  const m = String(err?.message ?? err ?? "");
  if (/invalid api key|jwt|malformed/i.test(m)) {
    return (
      "Server key error: use SUPABASE_SERVICE_ROLE_KEY from Supabase Dashboard → Settings → API → " +
      'service_role (secret), not the anon/public key. It must match the same project as NEXT_PUBLIC_SUPABASE_URL. ' +
      "Restart `npm run dev` after editing `.env.local`."
    );
  }
  return m;
}
