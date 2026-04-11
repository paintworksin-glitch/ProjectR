import { cfStreamApi } from "@/lib/cloudflare.js";
import { getMuxAssetOrigin } from "@/lib/publicSiteUrl.js";
import { createSupabaseAdminClient, adminApiErrorMessage } from "@/lib/supabaseAdmin.js";
import { getEffectiveMuxWatermarkImageUrl, getMuxNorthingStaticPngUrl } from "@/lib/watermarkUrl.js";

const DEFAULT_TEST_AGENT_ID = "00000000-0000-4000-8000-000000000000";

/**
 * @param {{ agentId?: string, watermarkFetchMs?: number }} [opts]
 * @returns {Promise<{
 *   mux: string,
 *   supabase: string,
 *   watermark: string,
 *   muxDirectUpload: {
 *     withoutWatermark: { ok: boolean, muxUploadId?: string, error?: string },
 *     withWatermark: {
 *       ok: boolean,
 *       watermarkUrl: string | null,
 *       muxUploadId?: string,
 *       error?: string,
 *       skipped?: string,
 *     },
 *   },
 * }>}
 */
export async function runVideoUploadDiagnostics(opts = {}) {
  const agentId = (opts.agentId && String(opts.agentId).trim()) || DEFAULT_TEST_AGENT_ID;
  const timeoutMs = typeof opts.watermarkFetchMs === "number" ? opts.watermarkFetchMs : 15000;

  const mux = await checkCloudflareStream();
  const supabase = await checkSupabase();
  const watermark = await checkWatermark(agentId, timeoutMs);
  const muxDirectUpload = await probeStreamDirectUploadCreates();

  return { mux, supabase, watermark, muxDirectUpload };
}

/**
 * 1) Create Cloudflare direct upload with no watermark. 2) If (1) ok, create again with watermark profile (if uid set).
 */
async function probeStreamDirectUploadCreates() {
  /** @type {{ ok: boolean, muxUploadId?: string, error?: string }} */
  const withoutWatermark = { ok: false };
  /** @type {{ ok: boolean, watermarkUrl: string | null, muxUploadId?: string, error?: string, skipped?: string }} */
  const withWatermark = { ok: false, watermarkUrl: null };

  const accountId = (process.env.CLOUDFLARE_ACCOUNT_ID || "").trim();
  const token = (process.env.CLOUDFLARE_STREAM_API_TOKEN || "").trim();
  if (!accountId || !token) {
    withoutWatermark.error = "CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_STREAM_API_TOKEN is not set";
    withWatermark.skipped = "Cloudflare credentials missing";
    return { withoutWatermark, withWatermark };
  }

  try {
    const baseBody = {
      maxDurationSeconds: 60,
      meta: { name: `diagnostics-${Date.now()}` },
    };
    try {
      const up = await cfStreamApi("direct_upload", { method: "POST", body: baseBody });
      const uid = up.uid;
      const uploadURL = up.uploadURL || up.uploadUrl;
      if (!uid || !uploadURL) {
        withoutWatermark.error = "direct_upload missing uid or uploadURL";
      } else {
        withoutWatermark.ok = true;
        withoutWatermark.muxUploadId = uid;
      }
    } catch (e) {
      withoutWatermark.error = String(e?.message || e);
    }

    if (!withoutWatermark.ok) {
      withWatermark.skipped = "without-watermark direct_upload failed";
      withWatermark.watermarkUrl = getMuxNorthingStaticPngUrl();
      return { withoutWatermark, withWatermark };
    }

    const wmUid = (process.env.CLOUDFLARE_WATERMARK_UID || "").trim();
    withWatermark.watermarkUrl = wmUid || null;
    if (!wmUid) {
      withWatermark.skipped = "CLOUDFLARE_WATERMARK_UID not set";
      return { withoutWatermark, withWatermark };
    }

    try {
      const up2 = await cfStreamApi("direct_upload", {
        method: "POST",
        body: {
          ...baseBody,
          meta: { name: `diagnostics-wm-${Date.now()}` },
          watermark: {
            uid: wmUid,
            position: "bottom-left",
            opacity: 0.8,
            scale: 0.1,
          },
        },
      });
      const uid2 = up2.uid;
      if (!uid2) {
        withWatermark.error = "direct_upload (with watermark) missing uid";
      } else {
        withWatermark.ok = true;
        withWatermark.muxUploadId = uid2;
      }
    } catch (e) {
      withWatermark.error = String(e?.message || e);
    }
    return { withoutWatermark, withWatermark };
  } catch (e) {
    withoutWatermark.error = withoutWatermark.error || String(e?.message || e);
    withWatermark.skipped = "probe error";
    return { withoutWatermark, withWatermark };
  }
}

async function checkCloudflareStream() {
  const accountId = (process.env.CLOUDFLARE_ACCOUNT_ID || "").trim();
  const token = (process.env.CLOUDFLARE_STREAM_API_TOKEN || "").trim();
  if (!accountId || !token) {
    return "CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_STREAM_API_TOKEN is not set";
  }
  try {
    await cfStreamApi("?per_page=1");
    return "ok";
  } catch (e) {
    return String(e?.message || e);
  }
}

async function checkSupabase() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "").trim();
  if (!url || !key) {
    return "NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set";
  }
  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("profiles").select("id").limit(1);
    if (error) return adminApiErrorMessage(error);
    return "ok";
  } catch (e) {
    return adminApiErrorMessage(e);
  }
}

/**
 * @param {string} agentId
 * @param {number} timeoutMs
 */
async function checkWatermark(agentId, timeoutMs) {
  const origin = getMuxAssetOrigin();
  if (!origin) {
    return "No public site origin (set NEXT_PUBLIC_SITE_URL or rely on VERCEL_URL on Vercel)";
  }
  const url = getEffectiveMuxWatermarkImageUrl(agentId);
  if (!url) {
    return "Could not build watermark URL";
  }
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: ac.signal,
      headers: { Accept: "image/*,*/*" },
    });
    if (!r.ok) {
      const short = url.length > 200 ? `${url.slice(0, 200)}…` : url;
      return `GET ${short} → HTTP ${r.status}`;
    }
    const ct = (r.headers.get("content-type") || "").toLowerCase();
    if (!ct.includes("image/png") && !ct.includes("image/")) {
      return `Unexpected Content-Type: ${ct || "(missing)"}`;
    }
    return "ok";
  } catch (e) {
    const name = e?.name === "AbortError" ? "timeout" : String(e?.message || e);
    return `Fetch failed: ${name}`;
  } finally {
    clearTimeout(timer);
  }
}
