/**
 * Replaced by Cloudflare Stream — see `src/lib/cloudflare.js` and `src/lib/videoProvider.js`.
 *
 * Legacy Mux (optional, unused when using Stream):
 * ```
 * import Mux from "@mux/mux-node";
 * export function createMuxClient() {
 *   const tokenId = (process.env.MUX_TOKEN_ID || "").trim();
 *   const tokenSecret = (process.env.MUX_TOKEN_SECRET || "").trim();
 *   if (!tokenId || !tokenSecret) {
 *     throw new Error("Missing MUX_TOKEN_ID or MUX_TOKEN_SECRET");
 *   }
 *   return new Mux({
 *     tokenId,
 *     tokenSecret,
 *     webhookSecret: (process.env.MUX_WEBHOOK_SECRET || "").trim() || undefined,
 *   });
 * }
 * ```
 */

/** @deprecated Use Cloudflare Stream; kept so imports do not break during migration. */
export function createMuxClient() {
  throw new Error("Mux is disabled. Video uses Cloudflare Stream (CLOUDFLARE_* env vars).");
}
