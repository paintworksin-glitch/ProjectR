import { redirect } from "next/navigation";
import ResetPasswordClient from "./ResetPasswordClient";

export const dynamic = "force-dynamic";

/**
 * If `code` is present, redirect on the server before the client bundle runs.
 * Otherwise @supabase/ssr's createBrowserClient runs detectSessionInUrl and tries
 * PKCE exchange without the verifier → "PKCE code verifier not found in storage".
 */
export default function ResetPasswordPage({ searchParams }) {
  const code = searchParams?.code;
  if (code) {
    redirect(`/auth/confirm?code=${encodeURIComponent(code)}&next=${encodeURIComponent("/reset-password")}`);
  }
  return <ResetPasswordClient />;
}
