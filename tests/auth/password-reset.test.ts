import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { hasEnv, requireEnv } from "../setup/e2eEnv";

test.describe("Auth - Password Reset", () => {
  test("Forgot password flow endpoint is reachable", async ({ request }) => {
    const res = await request.get("/login");
    expect(res.status()).toBe(200);
  });

  test("Reset password page loads", async ({ request }) => {
    const res = await request.get("/reset-password");
    expect(res.status()).toBe(200);
  });

  test("Reset email not sent for invalid email", async () => {
    test.skip(
      !hasEnv("NEXT_PUBLIC_SUPABASE_URL") || !hasEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      "Set Supabase envs in .env.test"
    );
    const supabase = createClient(
      requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    );
    const { error } = await supabase.auth.resetPasswordForEmail("not-an-email");
    expect(error).toBeTruthy();
  });

  test("Reset email sent for valid email", async () => {
    test.skip(
      !hasEnv("NEXT_PUBLIC_SUPABASE_URL") || !hasEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      "Set Supabase envs in .env.test"
    );
    const supabase = createClient(
      requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    );
    const email = process.env.E2E_BUYER_EMAIL || `e2e-reset-${Date.now()}@example.com`;
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    // Supabase may return success even for non-existing users to avoid enumeration.
    expect(error).toBeNull();
  });

  test.skip("Cannot set password under 8 chars", async () => {});
  test.skip("Reset password page accepts new password", async () => {});
  test.skip("Cannot set mismatched passwords", async () => {});
  test.skip("Redirects to login after successful reset", async () => {});
});
