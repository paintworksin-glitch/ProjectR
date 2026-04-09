import { expect, test } from "@playwright/test";
import { canCreateListing } from "../../src/lib/listingEligibility.js";

type MockProfile = { role: "user" | "seller" | "agent"; agent_verified?: boolean; plan?: string };

function makeEligibilitySupabase(profile: MockProfile, sellerActiveCount = 0) {
  return {
    auth: {
      getUser: async () => ({ data: { user: { id: "user-1" } }, error: null }),
    },
    from: (table: string) => {
      if (table === "profiles") {
        return {
          select() {
            return {
              eq() {
                return {
                  maybeSingle: async () => ({ data: profile, error: null }),
                };
              },
            };
          },
        };
      }
      if (table === "listings") {
        return {
          select() {
            return {
              eq() {
                return {
                  eq() {
                    return Promise.resolve({ count: sellerActiveCount, error: null });
                  },
                };
              },
            };
          },
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    },
  } as any;
}

test.describe("Listings - Creation", () => {
  test("Buyer cannot create listing (blocked)", async () => {
    const gate = await canCreateListing(makeEligibilitySupabase({ role: "user" }), "user-1");
    expect(gate.ok).toBe(false);
  });

  test("Agent blocked if unverified", async () => {
    const gate = await canCreateListing(
      makeEligibilitySupabase({ role: "agent", agent_verified: false }),
      "user-1"
    );
    expect(gate.ok).toBe(false);
  });

  test("Agent allowed if verified + paid", async () => {
    const gate = await canCreateListing(
      makeEligibilitySupabase({ role: "agent", agent_verified: true, plan: "paid" }),
      "user-1"
    );
    expect(gate.ok).toBe(true);
  });

  test("Seller blocked at 3rd listing (cap = 2)", async () => {
    const gate = await canCreateListing(makeEligibilitySupabase({ role: "seller" }, 2), "user-1");
    expect(gate.ok).toBe(false);
  });

  test.skip("Seller can create listing", async () => {});
  test.skip("All required fields validated", async () => {});
  test.skip("Photos upload correctly", async () => {});
  test.skip("Listing appears on feed after creation", async () => {});
});
