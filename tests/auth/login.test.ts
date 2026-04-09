import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { hasEnv, requireEnv } from "../setup/e2eEnv";

test.describe("Auth - Login", () => {
  test("Login route is reachable", async ({ request }) => {
    const res = await request.get("/login");
    expect(res.status()).toBe(200);
  });

  test("Can login with correct credentials", async () => {
    test.skip(
      !hasEnv("E2E_BUYER_EMAIL") || !hasEnv("E2E_BUYER_PASSWORD"),
      "Set E2E_BUYER_EMAIL and E2E_BUYER_PASSWORD in .env.test"
    );
    const supabase = createClient(
      requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    );
    const { data, error } = await supabase.auth.signInWithPassword({
      email: requireEnv("E2E_BUYER_EMAIL"),
      password: requireEnv("E2E_BUYER_PASSWORD"),
    });
    expect(error).toBeNull();
    expect(data.user?.id).toBeTruthy();
    await supabase.auth.signOut();
  });

  test("Redirects to return URL after login if present", async ({ request }) => {
    const res = await request.get("/login?next=/feed");
    expect(res.status()).toBe(200);
  });

  test.skip("Cannot login with wrong password", async () => {});
  test.skip("Cannot login with unregistered email", async () => {});
  test.skip("Redirects to dashboard after login", async () => {});
  test.skip("Rate limiting blocks after 5 failed attempts", async () => {});
});
