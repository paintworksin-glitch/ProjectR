import { expect, test } from "@playwright/test";

test.describe("Navigation", () => {
  test.skip("Home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/$/);
  });

  test.skip("All navbar links go to correct pages", async () => {});
  test.skip("Mobile menu opens and closes", async () => {});
  test.skip("Login state updates navbar correctly", async () => {});
  test.skip("User name shows when logged in", async () => {});
  test.skip("Logout clears session and redirects", async () => {});
});
