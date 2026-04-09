import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

const baseURL = process.env.E2E_BASE_URL || "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "./tests",
  testIgnore: ["**/unit/**", "**/setup/**"],
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run build && npm run start -- -p 4173",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
