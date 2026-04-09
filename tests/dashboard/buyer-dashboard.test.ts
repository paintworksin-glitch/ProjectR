import { expect, test } from "@playwright/test";

const runBuyerDashboardUiFlow =
  process.env.E2E_ENABLE_UI === "1" &&
  process.env.E2E_BROWSER_TESTS === "1" &&
  process.env.RUN_BROWSER_E2E === "enabled-on-real-browser" &&
  process.arch === "x64" &&
  Boolean(process.env.E2E_BUYER_EMAIL) &&
  Boolean(process.env.E2E_BUYER_PASSWORD);

const buyerUiTest = runBuyerDashboardUiFlow ? test : test.skip;

async function loginAsBuyer(page: any) {
  await page.goto("/login");
  await page.getByPlaceholder("Email address").fill(process.env.E2E_BUYER_EMAIL as string);
  await page.getByPlaceholder("Password").fill(process.env.E2E_BUYER_PASSWORD as string);
  await page.getByRole("button", { name: "Sign In →" }).click();
  await page.waitForURL(/\/dashboard(?:\?.*)?$/);
}

test.describe("Dashboard - Buyer", () => {
  buyerUiTest("Buyer dashboard loads correctly", async ({ page }) => {
    await loginAsBuyer(page);
    await expect(page.getByRole("heading", { name: "My Account" })).toBeVisible();
  });

  buyerUiTest("Saved listings visible", async ({ page }) => {
    await loginAsBuyer(page);
    await expect(page.getByRole("button", { name: "❤️ Saved" })).toBeVisible();
  });

  buyerUiTest("Enquiries sent visible", async ({ page }) => {
    await loginAsBuyer(page);
    await page.getByRole("button", { name: "✉️ Enquiries" }).click();
    await expect(page.getByText(/My Enquiries|No enquiries sent yet\./i)).toBeVisible();
  });

  buyerUiTest("Cannot access seller features", async ({ page }) => {
    await loginAsBuyer(page);
    await expect(page.getByRole("heading", { name: "My Listings" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "My Properties" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "+ New Listing" })).toHaveCount(0);
  });

  buyerUiTest("Cannot access agent features", async ({ page }) => {
    await loginAsBuyer(page);
    await expect(page.getByText("Your agent account is pending activation.")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "🏢 Profile" })).toHaveCount(0);
  });
});
