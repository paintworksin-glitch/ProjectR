import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseUrlAndAnonKey } from "./supabaseEnv";

export async function createSupabaseServerClient() {
  const cookieStore = cookies();
  const { url, key } = getSupabaseUrlAndAnonKey();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          /* ignore when called from Server Component */
        }
      },
    },
  });
}
