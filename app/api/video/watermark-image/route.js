import { NextResponse } from "next/server";
import { generateMuxWatermarkPng, getFallbackWatermarkPngBuffer } from "@/lib/generateMuxWatermarkPng.js";

export const runtime = "nodejs";

function isUuid(id) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(id || "").trim());
}

export async function GET(request) {
  const agentId = request.nextUrl.searchParams.get("agentId")?.trim() || "";
  if (!isUuid(agentId)) {
    return NextResponse.json({ error: "Invalid agentId" }, { status: 400 });
  }

  let buf;
  try {
    buf = await generateMuxWatermarkPng(agentId);
  } catch (e) {
    console.error("watermark-image generate", e);
    buf = null;
  }

  if (!buf) {
    try {
      buf = await getFallbackWatermarkPngBuffer();
    } catch (e2) {
      console.error("watermark-image fallback", e2);
      return NextResponse.json({ error: "Watermark unavailable" }, { status: 502 });
    }
  }

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
