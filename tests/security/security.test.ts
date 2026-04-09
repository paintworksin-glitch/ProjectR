import { test } from "@playwright/test";

test.describe("Security", () => {
  test.skip("Cannot access dashboard without login", async () => {});
  test.skip("Cannot access admin without master role", async () => {});
  test.skip("Cannot edit another user's listing", async () => {});
  test.skip("Cannot see another user's enquiries", async () => {});
  test.skip("API routes reject unauthenticated requests", async () => {});
  test.skip("Rate limiting blocks repeated requests", async () => {});
  test.skip("Contact number not exposed in page source", async () => {});
  test.skip("No sensitive env variables in client bundle", async () => {});
});
