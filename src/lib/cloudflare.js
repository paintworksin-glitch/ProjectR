/**
 * Cloudflare Stream API (server-only). Do not import from client components.
 */
import crypto from "crypto";
import { normalizeCloudflareStreamCustomerCode } from "./cloudflareStreamCustomerCode.js";

export function getCloudflareStreamConfig() {
  const accountId = (process.env.CLOUDFLARE_ACCOUNT_ID || "").trim();
  const token = (process.env.CLOUDFLARE_STREAM_API_TOKEN || "").trim();
  if (!accountId || !token) {
    throw new Error("Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_STREAM_API_TOKEN");
  }
  const apiBase = `https://api.cloudflare.com/client/v4/accounts/${accountId}`;
  const streamBase = `${apiBase}/stream`;
  return { accountId, token, apiBase, streamBase };
}

/**
 * @param {string} path path after /stream e.g. "direct_upload" or "{uid}"
 * @param {{ method?: string, body?: object | FormData }} [opts]
 */
export async function cfStreamApi(path, opts = {}) {
  const { streamBase, token } = getCloudflareStreamConfig();
  const p = String(path || "").replace(/^\//, "");
  const url = p.startsWith("?") ? `${streamBase}${p}` : `${streamBase}/${p}`;
  const method = opts.method || "GET";
  const isForm = typeof FormData !== "undefined" && opts.body instanceof FormData;
  /** @type {Record<string, string>} */
  const headers = { Authorization: `Bearer ${token}` };
  if (opts.body != null && !isForm) {
    headers["Content-Type"] = "application/json";
  }
  const r = await fetch(url, {
    method,
    headers,
    body: opts.body == null ? undefined : isForm ? opts.body : JSON.stringify(opts.body),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.success === false) {
    const msg = Array.isArray(j.errors) ? j.errors.map((e) => e.message).join("; ") : r.statusText;
    throw new Error(msg || "Cloudflare Stream API error");
  }
  return j.result;
}

export function getCloudflareCustomerCode() {
  const raw = (
    process.env.CLOUDFLARE_STREAM_CUSTOMER_CODE ||
    process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE ||
    ""
  ).trim();
  return normalizeCloudflareStreamCustomerCode(raw);
}

export function cloudflareStreamHlsUrl(videoUid) {
  const code = getCloudflareCustomerCode();
  if (!code || !videoUid) return "";
  return `https://customer-${code}.cloudflarestream.com/${encodeURIComponent(videoUid)}/manifest/video.m3u8`;
}

export function cloudflareStreamThumbnailUrl(videoUid, timeSec = 1) {
  const code = getCloudflareCustomerCode();
  if (!code || !videoUid) return "";
  const u = new URL(
    `https://customer-${code}.cloudflarestream.com/${encodeURIComponent(videoUid)}/thumbnails/thumbnail.jpg`,
  );
  u.searchParams.set("time", `${Number(timeSec) || 0}s`);
  return u.toString();
}

/**
 * @param {string} rawBody
 * @param {string | null} webhookSignatureHeader Webhook-Signature
 * @param {string} secret from PUT /stream/webhook response
 */
export function verifyStreamWebhookSignature(rawBody, webhookSignatureHeader, secret) {
  const s = (secret || "").trim();
  if (!s) return true;
  if (!webhookSignatureHeader) return false;
  /** @type {Record<string, string>} */
  const parts = {};
  for (const seg of webhookSignatureHeader.split(",")) {
    const eq = seg.indexOf("=");
    if (eq === -1) continue;
    parts[seg.slice(0, eq).trim()] = seg.slice(eq + 1).trim();
  }
  const time = parts.time;
  const sig1 = parts.sig1;
  if (!time || !sig1) return false;
  const source = `${time}.${rawBody}`;
  const expected = crypto.createHmac("sha256", s).update(source).digest("hex");
  if (expected.length !== sig1.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(sig1, "utf8"));
  } catch {
    return false;
  }
}
