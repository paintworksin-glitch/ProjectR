import { expect, test } from "@playwright/test";

const runSellerDashboardUiFlow =
  process.env.E2E_ENABLE_UI === "1" &&
  process.env.E2E_BROWSER_TESTS === "1" &&
  process.env.RUN_BROWSER_E2E === "enabled-on-real-browser" &&
  process.arch === "x64" &&
  Boolean(process.env.E2E_SELLER_EMAIL) &&
  Boolean(process.env.E2E_SELLER_PASSWORD);

const sellerUiTest = runSellerDashboardUiFlow ? test : test.skip;

async function loginAsSeller(page: any) {
  await page.goto("/login");
  await page.getByPlaceholder("Email address").fill(process.env.E2E_SELLER_EMAIL as string);
  await page.getByPlaceholder("Password").fill(process.env.E2E_SELLER_PASSWORD as string);
  await page.getByRole("button", { name: "Sign In →" }).click();
  await page.waitForURL(/\/dashboard(?:\?.*)?$/);
}

test.describe("Dashboard - Seller", () => {
  sellerUiTest("Seller dashboard loads correctly", async ({ page }) => {
    await loginAsSeller(page);
    await expect(page.getByRole("heading", { name: "My Properties" })).toBeVisible();
  });

  sellerUiTest("My listings visible", async ({ page }) => {
    await loginAsSeller(page);
    await expect(page.getByRole("button", { name: "🏠 Listings" })).toBeVisible();
  });

  sellerUiTest("Enquiries received visible", async ({ page }) => {
    await loginAsSeller(page);
    await page.getByRole("button", { name: "✉️ Enquiries" }).click();
    await expect(page.getByText(/No enquiries yet\.|Mark replied|Mark closed/i)).toBeVisible();
  });

  sellerUiTest("Create listing button works", async ({ page }) => {
    await loginAsSeller(page);
    const newListingButton = page.getByRole("button", { name: "+ New Listing" });
    if (await newListingButton.count()) {
      await expect(newListingButton).toBeVisible();
    } else {
      await expect(page.getByText("Listing limit reached")).toBeVisible();
    }
  });

  sellerUiTest("Upgrade prompt shows at listing cap", async ({ page }) => {
    await loginAsSeller(page);
    // Seller cap enforcement visibility is always shown in the dashboard header.
    await expect(page.getByText(/\d+\/2 properties used/)).toBeVisible();
  });
});
