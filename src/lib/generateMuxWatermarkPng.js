import { readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin.js";

const W = 1920;
const H = 1080;
const STRIP_H = Math.round(H * 0.15);
const STRIP_Y = H - STRIP_H;

function escXml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function fetchLogoDataUri(logoUrl) {
  if (!logoUrl || typeof logoUrl !== "string" || !/^https?:\/\//i.test(logoUrl.trim())) return null;
  const url = logoUrl.trim();
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 8000);
  try {
    const r = await fetch(url, { redirect: "follow", cache: "no-store", signal: ac.signal });
    if (!r.ok) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 32 || buf.length > 4 * 1024 * 1024) return null;
    const ct = (r.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    const mime = /^image\/(png|jpeg|jpg|webp|gif)$/.test(ct) ? ct : "image/png";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function brandLabelFromEnv() {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || "").trim();
  if (!raw) return "Northing";
  try {
    const withProto = raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`;
    const host = new URL(withProto).hostname.replace(/^www\./i, "");
    return host || "Northing";
  } catch {
    return "Northing";
  }
}

/**
 * Full-frame PNG (transparent except bottom ~15% strip) for Mux overlay; width 100% + bottom align.
 */
export async function generateMuxWatermarkPng(agentId) {
  const admin = createSupabaseAdminClient();
  const { data: p, error } = await admin
    .from("profiles")
    .select("name, phone, agency_name, logo_url")
    .eq("id", agentId)
    .maybeSingle();

  if (error || !p) {
    throw new Error("profile_not_found");
  }

  const agentName = ((p.name || "").trim() || (p.agency_name || "").trim()).trim();
  const agentPhone = (p.phone || "").trim();
  const logoHref = await fetchLogoDataUri(p.logo_url);
  const brandText = brandLabelFromEnv();

  const pad = 40;
  const logoR = 44;
  const cxStrip = STRIP_Y + STRIP_H / 2;
  const nameSize = 38;
  const phoneSize = 28;
  const brandSize = 26;

  let logoEl = "";
  let textStartX = pad;
  if (logoHref) {
    const lcx = pad + logoR;
    textStartX = pad + logoR * 2 + 28;
    const safeLogoHref = logoHref.replace(/&/g, "&amp;");
    logoEl = `
      <defs>
        <clipPath id="wmLogoClip"><circle cx="${lcx}" cy="${cxStrip}" r="${logoR}"/></clipPath>
      </defs>
      <image clip-path="url(#wmLogoClip)" href="${safeLogoHref}" x="${lcx - logoR}" y="${cxStrip - logoR}" width="${logoR * 2}" height="${logoR * 2}" preserveAspectRatio="xMidYMid slice"/>
    `;
  }

  let leftText = "";
  if (agentName && agentPhone) {
    leftText = `
      <text x="${textStartX}" y="${cxStrip - 16}" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="${nameSize}" font-weight="700" dominant-baseline="middle">${escXml(agentName)}</text>
      <text x="${textStartX}" y="${cxStrip + 22}" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="${phoneSize}" font-weight="500" dominant-baseline="middle">${escXml(agentPhone)}</text>
    `;
  } else if (agentName) {
    leftText = `<text x="${textStartX}" y="${cxStrip}" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="${nameSize}" font-weight="700" dominant-baseline="middle">${escXml(agentName)}</text>`;
  } else if (agentPhone) {
    leftText = `<text x="${textStartX}" y="${cxStrip}" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="${phoneSize}" font-weight="500" dominant-baseline="middle">${escXml(agentPhone)}</text>`;
  }

  const rightText = `<text x="${W - pad}" y="${cxStrip}" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="${brandSize}" font-weight="600" text-anchor="end" dominant-baseline="middle">${escXml(brandText)}</text>`;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <rect width="${W}" height="${H}" fill="none"/>
  <rect x="0" y="${STRIP_Y}" width="${W}" height="${STRIP_H}" fill="#000000" fill-opacity="0.6"/>
  ${logoEl}
  ${leftText}
  ${rightText}
</svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

export async function getFallbackWatermarkPngBuffer() {
  const filePath = path.join(process.cwd(), "public", "mux-watermark", "northing-in.png");
  return readFile(filePath);
}
