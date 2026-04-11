import { createMuxClient } from "@/lib/mux.js";
import { muxErrorForClient } from "@/lib/muxClientError.js";
import { getMuxAssetOrigin } from "@/lib/publicSiteUrl.js";
import { createSupabaseAdminClient, adminApiErrorMessage } from "@/lib/supabaseAdmin.js";
import { getEffectiveMuxWatermarkImageUrl } from "@/lib/watermarkUrl.js";

const DEFAULT_TEST_AGENT_ID = "00000000-0000-4000-8000-000000000000";

/**
 * @param {{ agentId?: string, watermarkFetchMs?: number }} [opts]
 * @returns {Promise<{ mux: string, supabase: string, watermark: string }>}
 */
export async function runVideoUploadDiagnostics(opts = {}) {
  const agentId = (opts.agentId && String(opts.agentId).trim()) || DEFAULT_TEST_AGENT_ID;
  const timeoutMs = typeof opts.watermarkFetchMs === "number" ? opts.watermarkFetchMs : 15000;

  const mux = await checkMux();
  const supabase = await checkSupabase();
  const watermark = await checkWatermark(agentId, timeoutMs);

  return { mux, supabase, watermark };
}

async function checkMux() {
  const id = (process.env.MUX_TOKEN_ID || "").trim();
  const sec = (process.env.MUX_TOKEN_SECRET || "").trim();
  if (!id || !sec) {
    return "MUX_TOKEN_ID or MUX_TOKEN_SECRET is not set";
  }
  try {
    const mux = createMuxClient();
    for await (const _ of mux.video.assets.list({ limit: 1 })) {
      break;
    }
    return "ok";
  } catch (e) {
    return muxErrorForClient(e);
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
