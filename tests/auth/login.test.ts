import { expect, test } from "@playwright/test";

test.describe("Auth - Login", () => {
  test.skip("Login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/\/login/);
  });

  test.skip("Can login with correct credentials", async () => {});
  test.skip("Cannot login with wrong password", async () => {});
  test.skip("Cannot login with unregistered email", async () => {});
  test.skip("Redirects to dashboard after login", async () => {});
  test.skip("Redirects to return URL after login if present", async () => {});
  test.skip("Rate limiting blocks after 5 failed attempts", async () => {});
});
