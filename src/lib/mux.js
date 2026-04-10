/**
 * Server-only Mux API client. Do not import from client components.
 */
import Mux from "@mux/mux-node";

export function createMuxClient() {
  const tokenId = (process.env.MUX_TOKEN_ID || "").trim();
  const tokenSecret = (process.env.MUX_TOKEN_SECRET || "").trim();
  if (!tokenId || !tokenSecret) {
    throw new Error("Missing MUX_TOKEN_ID or MUX_TOKEN_SECRET");
  }
  return new Mux({
    tokenId,
    tokenSecret,
    webhookSecret: (process.env.MUX_WEBHOOK_SECRET || "").trim() || undefined,
  });
}
