import { expect, test } from "@playwright/test";
import { hasEnv } from "../setup/e2eEnv";

test.describe("Enquiry", () => {
  test("Logged out user cannot send enquiry", async ({ request }) => {
    test.skip(
      !hasEnv("NEXT_PUBLIC_SUPABASE_URL") || !hasEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      "Set Supabase envs in .env.test to assert API auth behavior"
    );
    const res = await request.post("/api/enquiry", {
      data: { listing_id: "00000000-0000-0000-0000-000000000000", message: "Interested" },
    });
    expect([401, 404]).toContain(res.status());
  });

  test.skip("Logged in buyer can send enquiry", async () => {});
  test.skip("Enquiry stored in Supabase", async () => {});
  test.skip("Seller receives email notification", async () => {});
  test.skip("Enquiry appears in seller dashboard", async () => {});
  test.skip("Enquiry status can be updated by seller", async () => {});
  test.skip("Buyer notified on status update", async () => {});
  test.skip("Cannot send duplicate enquiry on same listing", async () => {});
});
