import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { hasEnv, requireEnv } from "../setup/e2eEnv";

test.describe("Auth - Signup", () => {
  test("Signup page loads", async ({ request }) => {
    const res = await request.get("/signup");
    expect(res.status()).toBe(200);
  });

  test("Cannot sign up with invalid email", async () => {
    test.skip(
      !hasEnv("NEXT_PUBLIC_SUPABASE_URL") || !hasEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      "Set Supabase envs in .env.test"
    );
    const supabase = createClient(
      requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    );
    const { error } = await supabase.auth.signUp({
      email: "not-an-email",
      password: "password123",
      options: { data: { full_name: "E2E Invalid Email", phone: "9876543210" } },
    });
    expect(error).toBeTruthy();
  });

  test("Cannot sign up with weak password (under 8 chars)", async () => {
    test.skip(
      !hasEnv("NEXT_PUBLIC_SUPABASE_URL") || !hasEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      "Set Supabase envs in .env.test"
    );
    const supabase = createClient(
      requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    );
    const { error } = await supabase.auth.signUp({
      email: `e2e-weak-${Date.now()}@example.com`,
      password: "12345",
      options: { data: { full_name: "E2E Weak", phone: "9876543210" } },
    });
    expect(error).toBeTruthy();
  });

  test("Can sign up with valid email + password", async () => {
    test.skip(
      !hasEnv("NEXT_PUBLIC_SUPABASE_URL") || !hasEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      "Set Supabase envs in .env.test"
    );
    const supabase = createClient(
      requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    );
    const { data, error } = await supabase.auth.signUp({
      email: `e2e-signup-${Date.now()}@example.com`,
      password: "password123",
      options: { data: { full_name: "E2E Signup", phone: "9876543210" } },
    });
    expect(error).toBeNull();
    expect(data.user?.id).toBeTruthy();
  });

  test.skip("Cannot sign up with mismatched passwords", async () => {});
  test.skip("Cannot sign up with duplicate email", async () => {});
  test.skip("Mobile number validation (must be 10 digits)", async () => {});
  test.skip("Role selection required before proceeding", async () => {});
  test.skip("Redirects to onboarding after signup", async () => {});
});
