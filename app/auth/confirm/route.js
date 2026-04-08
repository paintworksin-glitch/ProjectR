import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseUrlAndAnonKey } from "@/lib/supabaseEnv";

function safeNextPath(next) {
  if (!next || typeof next !== "string") return "/reset-password";
  if (!next.startsWith("/") || next.startsWith("//")) return "/reset-password";
  return next;
}

/**
 * Server-side PKCE code exchange for password recovery emails.
 * Client-side exchangeCodeForSession fails with "PKCE code verifier not found" when
 * storage does not match (e.g. different device). Exchanging here sets session cookies.
 */
export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = safeNextPath(requestUrl.searchParams.get("next"));

  const failRedirect = () => {
    const u = new URL("/login", requestUrl.origin);
    u.searchParams.set("error", "reset_link");
    return NextResponse.redirect(u);
  };

  if (!code) {
    return failRedirect();
  }

  const redirectUrl = new URL(nextPath, requestUrl.origin);
  let response = NextResponse.redirect(redirectUrl);

  const { url, key } = getSupabaseUrlAndAnonKey();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return failRedirect();
  }

  return response;
}
