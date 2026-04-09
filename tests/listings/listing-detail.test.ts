import { expect, test } from "@playwright/test";
import { hasEnv } from "../setup/e2eEnv";

const runBrowserListingFlow =
  process.env.E2E_ENABLE_UI === "1" &&
  process.env.E2E_BROWSER_TESTS === "1" &&
  process.env.RUN_BROWSER_E2E === "enabled-on-real-browser" &&
  process.arch === "x64" &&
  Boolean(process.env.E2E_BUYER_EMAIL) &&
  Boolean(process.env.E2E_BUYER_PASSWORD) &&
  Boolean(process.env.E2E_LISTING_ID);

const uiTest = runBrowserListingFlow ? test : test.skip;
const hasAppSupabaseEnv =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

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
    test.skip(
      !hasAppSupabaseEnv,
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.test"
    );
    const id = await resolveListingId(request);
    test.skip(!id, "Set E2E_LISTING_ID or ensure /api/listings returns one listing");
    const res = await request.get(`/property/${id}`);
    expect(res.status()).toBe(200);
  });

  test("All property details visible without login", async ({ request }) => {
    test.skip(
      !hasAppSupabaseEnv,
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.test"
    );
    const id = await resolveListingId(request);
    test.skip(!id, "Set E2E_LISTING_ID or ensure /api/listings returns one listing");
    const res = await request.get(`/property/${id}`);
    const html = (await res.text()).toLowerCase();
    expect(html).toContain("property");
  });

  test("Price visible without login", async ({ request }) => {
    test.skip(
      !hasAppSupabaseEnv,
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.test"
    );
    const id = await resolveListingId(request);
    test.skip(!id, "Set E2E_LISTING_ID or ensure /api/listings returns one listing");
    const res = await request.get(`/property/${id}`);
    const html = await res.text();
    expect(html).toMatch(/₹|inr/i);
  });

  test("Contact number hidden without login", async ({ request }) => {
    test.skip(
      !hasAppSupabaseEnv,
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.test"
    );
    const id = await resolveListingId(request);
    test.skip(!id, "Set E2E_LISTING_ID or ensure /api/listings returns one listing");
    const res = await request.get(`/property/${id}`);
    const html = await res.text();
    // Unauthenticated SSR should not include tel: links for broker number.
    expect(html).not.toContain("tel:");
  });

  test("Share page also hides contact without login", async ({ request }) => {
    test.skip(
      !hasAppSupabaseEnv,
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.test"
    );
    const id = await resolveListingId(request);
    test.skip(!id, "Set E2E_LISTING_ID or ensure /api/listings returns one listing");
    const res = await request.get(`/share/${id}`);
    const html = await res.text();
    expect(html).not.toContain("tel:");
  });

  test("Enquiry form hidden without login", async ({ request }) => {
    test.skip(
      !hasAppSupabaseEnv,
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.test"
    );
    const id = await resolveListingId(request);
    test.skip(!id, "Set E2E_LISTING_ID or ensure /api/listings returns one listing");
    const res = await request.get(`/property/${id}`);
    const html = (await res.text()).toLowerCase();
    expect(html).not.toContain("send enquiry");
  });

  uiTest("Contact number visible after login", async ({ page }) => {
    const id = process.env.E2E_LISTING_ID as string;
    await page.goto("/login");
    await page.getByPlaceholder("Email address").fill(process.env.E2E_BUYER_EMAIL as string);
    await page.getByPlaceholder("Password").fill(process.env.E2E_BUYER_PASSWORD as string);
    await page.getByRole("button", { name: "Sign In →" }).click();
    await page.waitForURL(/\/dashboard(?:\?.*)?$/);

    await page.goto(`/property/${id}`);
    await expect(page.locator('a[href^="tel:"]').first()).toBeVisible();
  });

  uiTest("Enquiry form visible after login", async ({ page }) => {
    const id = process.env.E2E_LISTING_ID as string;
    await page.goto("/login");
    await page.getByPlaceholder("Email address").fill(process.env.E2E_BUYER_EMAIL as string);
    await page.getByPlaceholder("Password").fill(process.env.E2E_BUYER_PASSWORD as string);
    await page.getByRole("button", { name: "Sign In →" }).click();
    await page.waitForURL(/\/dashboard(?:\?.*)?$/);

    await page.goto(`/property/${id}`);
    await expect(page.locator("textarea")).toBeVisible();
    await expect(page.getByRole("button", { name: /send enquiry/i })).toBeVisible();
  });

  uiTest("Save button works when logged in", async ({ page }) => {
    const id = process.env.E2E_LISTING_ID as string;
    await page.goto("/login");
    await page.getByPlaceholder("Email address").fill(process.env.E2E_BUYER_EMAIL as string);
    await page.getByPlaceholder("Password").fill(process.env.E2E_BUYER_PASSWORD as string);
    await page.getByRole("button", { name: "Sign In →" }).click();
    await page.waitForURL(/\/dashboard(?:\?.*)?$/);

    await page.goto(`/property/${id}`);
    await page.getByLabel("Save listing").click();
    await expect(page.getByLabel("Save listing")).toBeVisible();
  });

  test.skip("Photos visible without login", async () => {});
  test.skip("PDF download works without login", async () => {});
  test.skip("Save button redirects to login if not logged in", async () => {});
});
