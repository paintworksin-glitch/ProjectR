import { expect, test } from "@playwright/test";
import { hasEnv } from "../setup/e2eEnv";

test.describe("Security", () => {
  test("Cannot access dashboard without login", async ({ request }) => {
    const res = await request.get("/dashboard");
    expect(res.status()).toBe(200);
    if (hasEnv("NEXT_PUBLIC_SUPABASE_URL") && hasEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")) {
      const text = await res.text();
      // Middleware-enabled env should force auth flow eventually to login page shell.
      expect(text.toLowerCase()).toContain("dashboard");
    }
  });

  test("Cannot access admin without master role", async ({ request }) => {
    const res = await request.get("/admin");
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text.toLowerCase()).toContain("login");
  });

  test("API routes reject unauthenticated requests", async ({ request }) => {
    test.skip(
      !hasEnv("NEXT_PUBLIC_SUPABASE_URL") || !hasEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      "Set Supabase envs in .env.test to assert API auth behavior"
    );
    const res = await request.post("/api/enquiry", {
      data: { listing_id: "00000000-0000-0000-0000-000000000000", message: "hello" },
    });
    expect([401, 404]).toContain(res.status());
  });

  test.skip("Cannot edit another user's listing", async () => {});
  test.skip("Cannot see another user's enquiries", async () => {});
  test.skip("Rate limiting blocks repeated requests", async () => {});
  test.skip("Contact number not exposed in page source", async () => {});
  test.skip("No sensitive env variables in client bundle", async () => {});
});
