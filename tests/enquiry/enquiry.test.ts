import { test } from "@playwright/test";

test.describe("Enquiry", () => {
  test.skip("Logged out user cannot send enquiry", async () => {});
  test.skip("Logged in buyer can send enquiry", async () => {});
  test.skip("Enquiry stored in Supabase", async () => {});
  test.skip("Seller receives email notification", async () => {});
  test.skip("Enquiry appears in seller dashboard", async () => {});
  test.skip("Enquiry status can be updated by seller", async () => {});
  test.skip("Buyer notified on status update", async () => {});
  test.skip("Cannot send duplicate enquiry on same listing", async () => {});
});
