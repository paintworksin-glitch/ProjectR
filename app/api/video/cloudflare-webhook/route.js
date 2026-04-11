import { handleStreamWebhookPost } from "@/lib/handleStreamWebhook.js";

export const runtime = "nodejs";

/** Cloudflare Stream webhook — same handler as /api/video/mux-webhook */
export async function POST(request) {
  return handleStreamWebhookPost(request);
}
