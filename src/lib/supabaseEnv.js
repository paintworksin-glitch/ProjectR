/**
 * Shared validation for Supabase URL + anon key (public, safe to expose via NEXT_PUBLIC_*).
 * Avoids hardcoded project credentials in source.
 */
export function getSupabaseUrlAndAnonKey() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them in Vercel Environment Variables or .env.local."
    );
  }
  return { url, key };
}
