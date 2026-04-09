import { expect, test } from "@playwright/test";

const baseUiFlagsOk =
  process.env.E2E_ENABLE_UI === "1" &&
  process.env.E2E_BROWSER_TESTS === "1" &&
  process.env.RUN_BROWSER_E2E === "enabled-on-real-browser" &&
  process.arch === "x64";

const runUnverifiedAgentUiFlow =
  baseUiFlagsOk &&
  Boolean(process.env.E2E_AGENT_UNVERIFIED_EMAIL) &&
  Boolean(process.env.E2E_AGENT_UNVERIFIED_PASSWORD);

const runVerifiedAgentUiFlow =
  baseUiFlagsOk &&
  Boolean(process.env.E2E_AGENT_VERIFIED_EMAIL) &&
  Boolean(process.env.E2E_AGENT_VERIFIED_PASSWORD);

const unverifiedAgentUiTest = runUnverifiedAgentUiFlow ? test : test.skip;
const verifiedAgentUiTest = runVerifiedAgentUiFlow ? test : test.skip;

async function loginAsAgent(page: any, email: string, password: string) {
  await page.goto("/login");
  await page.getByPlaceholder("Email address").fill(email);
  await page.getByPlaceholder("Password").fill(password);
  await page.getByRole("button", { name: "Sign In →" }).click();
  await page.waitForURL(/\/dashboard(?:\?.*)?$/);
}

test.describe("Dashboard - Agent", () => {
  unverifiedAgentUiTest("Agent dashboard loads correctly", async ({ page }) => {
    await loginAsAgent(
      page,
      process.env.E2E_AGENT_UNVERIFIED_EMAIL as string,
      process.env.E2E_AGENT_UNVERIFIED_PASSWORD as string
    );
    await expect(page.getByRole("heading", { name: "My Listings" })).toBeVisible();
  });

  unverifiedAgentUiTest("Pending banner shows if unverified", async ({ page }) => {
    await loginAsAgent(
      page,
      process.env.E2E_AGENT_UNVERIFIED_EMAIL as string,
      process.env.E2E_AGENT_UNVERIFIED_PASSWORD as string
    );
    await expect(page.getByText("Your agent account is pending activation.")).toBeVisible();
  });

  unverifiedAgentUiTest("Features locked if unverified", async ({ page }) => {
    await loginAsAgent(
      page,
      process.env.E2E_AGENT_UNVERIFIED_EMAIL as string,
      process.env.E2E_AGENT_UNVERIFIED_PASSWORD as string
    );
    await expect(page.getByRole("button", { name: "+ New Listing" })).toHaveCount(0);
    await expect(page.getByText(/Your agent account must be approved before you can add listings\./i)).toBeVisible();
  });

  verifiedAgentUiTest("Features unlocked if verified + paid", async ({ page }) => {
    await loginAsAgent(
      page,
      process.env.E2E_AGENT_VERIFIED_EMAIL as string,
      process.env.E2E_AGENT_VERIFIED_PASSWORD as string
    );
    await expect(page.getByText("Your agent account is pending activation.")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "+ New Listing" })).toBeVisible();
  });

  test.skip("PDF generation works", async () => {});
  test.skip("WhatsApp card generation works", async () => {});
});
