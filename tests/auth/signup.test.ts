import { test } from "@playwright/test";

test.describe("Auth - Signup", () => {
  test.skip("Can sign up with valid email + password", async () => {});
  test.skip("Cannot sign up with invalid email", async () => {});
  test.skip("Cannot sign up with weak password (under 8 chars)", async () => {});
  test.skip("Cannot sign up with mismatched passwords", async () => {});
  test.skip("Cannot sign up with duplicate email", async () => {});
  test.skip("Mobile number validation (must be 10 digits)", async () => {});
  test.skip("Role selection required before proceeding", async () => {});
  test.skip("Redirects to onboarding after signup", async () => {});
});
