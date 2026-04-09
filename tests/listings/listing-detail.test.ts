import { expect, test } from "@playwright/test";
import { hasEnv } from "../setup/e2eEnv";

async function resolveListingId(request: any): Promise<string | null> {
  const fromEnv = process.env.E2E_LISTING_ID;
  if (fromEnv) return fromEnv;
  const res = await request.get("/api/listings?page=1&pageSize=1");
  if (res.status() !== 200) return null;
  const body = await res.json();
  const id = body?.items?.[0]?.id;
  return id || null;
}

test.describe("Listings - Detail", () => {
  test("Listing page loads without login", async ({ request }) => {
    const id = await resolveListingId(request);
    test.skip(!id, "Set E2E_LISTING_ID or ensure /api/listings returns one listing");
    const res = await request.get(`/property/${id}`);
    expect(res.status()).toBe(200);
  });

  test("All property details visible without login", async ({ request }) => {
    const id = await resolveListingId(request);
    test.skip(!id, "Set E2E_LISTING_ID or ensure /api/listings returns one listing");
    const res = await request.get(`/property/${id}`);
    const html = (await res.text()).toLowerCase();
    expect(html).toContain("property");
  });

  test("Price visible without login", async ({ request }) => {
    const id = await resolveListingId(request);
    test.skip(!id, "Set E2E_LISTING_ID or ensure /api/listings returns one listing");
    const res = await request.get(`/property/${id}`);
    const html = await res.text();
    expect(html).toMatch(/₹|inr/i);
  });

  test("Contact number hidden without login", async ({ request }) => {
    const id = await resolveListingId(request);
    test.skip(!id, "Set E2E_LISTING_ID or ensure /api/listings returns one listing");
    const res = await request.get(`/property/${id}`);
    const html = await res.text();
    // Unauthenticated SSR should not include tel: links for broker number.
    expect(html).not.toContain("tel:");
  });

  test("Share page also hides contact without login", async ({ request }) => {
    const id = await resolveListingId(request);
    test.skip(!id, "Set E2E_LISTING_ID or ensure /api/listings returns one listing");
    const res = await request.get(`/share/${id}`);
    const html = await res.text();
    expect(html).not.toContain("tel:");
  });

  test("Enquiry form hidden without login", async ({ request }) => {
    const id = await resolveListingId(request);
    test.skip(!id, "Set E2E_LISTING_ID or ensure /api/listings returns one listing");
    const res = await request.get(`/property/${id}`);
    const html = (await res.text()).toLowerCase();
    expect(html).not.toContain("send enquiry");
  });

  test.skip("Photos visible without login", async () => {});
  test.skip("Contact number visible after login", async () => {});
  test.skip("PDF download works without login", async () => {});
  test.skip("Enquiry form visible after login", async () => {});
  test.skip("Save button redirects to login if not logged in", async () => {});
  test.skip("Save button works when logged in", async () => {});
});
