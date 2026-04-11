import { NextResponse } from "next/server";
import { runVideoUploadDiagnostics } from "@/lib/videoUploadDiagnostics.js";

export const runtime = "nodejs";

/**
 * GET /api/video/test — Cloudflare Stream API, Supabase service role, watermark URL fetch,
 * and muxDirectUpload: probe direct_upload without watermark, then with Stream watermark (if step 1 ok).
 * Optional: ?agentId=uuid (defaults to all-zero test UUID).
 * If VIDEO_DIAG_SECRET is set, require ?secret=… matching that value.
 */
export async function GET(request) {
  const secret = (process.env.VIDEO_DIAG_SECRET || "").trim();
  if (secret) {
    const q = request.nextUrl.searchParams.get("secret")?.trim() || "";
    if (q !== secret) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  const agentId = request.nextUrl.searchParams.get("agentId")?.trim() || undefined;

  try {
    const { mux, supabase, watermark, muxDirectUpload } = await runVideoUploadDiagnostics({ agentId });
    return NextResponse.json({ mux, supabase, watermark, muxDirectUpload });
  } catch (e) {
    console.error("[video-test]", e);
    return NextResponse.json(
      {
        mux: String(e?.message || e),
        supabase: "skipped (unhandled error)",
        watermark: "skipped (unhandled error)",
        muxDirectUpload: {
          withoutWatermark: { ok: false, error: "skipped" },
          withWatermark: { ok: false, watermarkUrl: null, skipped: "unhandled error" },
        },
      },
      { status: 500 },
    );
  }
}
