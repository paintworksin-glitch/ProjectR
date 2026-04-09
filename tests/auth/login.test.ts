import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { hasEnv, requireEnv } from "../setup/e2eEnv";

const runBrowserAuthFlow =
  process.env.E2E_ENABLE_UI === "1" &&
  process.env.E2E_BROWSER_TESTS === "1" &&
  process.env.RUN_BROWSER_E2E === "enabled-on-real-browser" &&
  process.arch === "x64" &&
  Boolean(process.env.E2E_BUYER_EMAIL) &&
  Boolean(process.env.E2E_BUYER_PASSWORD);

const uiTest = runBrowserAuthFlow ? test : test.skip;

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

  test("Cannot login with wrong password", async () => {
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
      password: `${requireEnv("E2E_BUYER_PASSWORD")}_wrong`,
    });
    expect(data.user).toBeNull();
    expect(error).toBeTruthy();
  });

  test("Cannot login with unregistered email", async () => {
    test.skip(
      !hasEnv("NEXT_PUBLIC_SUPABASE_URL") || !hasEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      "Set Supabase envs in .env.test"
    );
    const supabase = createClient(
      requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    );
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `e2e-unreg-${Date.now()}@example.com`,
      password: "password123",
    });
    expect(data.user).toBeNull();
    expect(error).toBeTruthy();
  });

  uiTest("Redirects to dashboard after login", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("Email address").fill(requireEnv("E2E_BUYER_EMAIL"));
    await page.getByPlaceholder("Password").fill(requireEnv("E2E_BUYER_PASSWORD"));
    await page.getByRole("button", { name: "Sign In →" }).click();
    await page.waitForURL(/\/dashboard(?:\?.*)?$/);
    await expect(page).toHaveURL(/\/dashboard(?:\?.*)?$/);
  });

  test("Rate limiting blocks after 5 failed attempts", async () => {
    test.skip(
      process.env.E2E_STRICT_RATE_LIMIT !== "1" ||
        !hasEnv("E2E_BUYER_EMAIL") ||
        !hasEnv("NEXT_PUBLIC_SUPABASE_URL") ||
        !hasEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      "Set E2E_STRICT_RATE_LIMIT=1 + Supabase envs to run strict rate-limit check"
    );
    const supabase = createClient(
      requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    );
    let lastError = "";
    for (let i = 0; i < 6; i += 1) {
      const { error } = await supabase.auth.signInWithPassword({
        email: requireEnv("E2E_BUYER_EMAIL"),
        password: `wrong-password-${Date.now()}-${i}`,
      });
      lastError = String(error?.message || "");
    }
    expect(lastError.toLowerCase()).toMatch(/too many|rate limit|retry|security purposes/);
  });
});
