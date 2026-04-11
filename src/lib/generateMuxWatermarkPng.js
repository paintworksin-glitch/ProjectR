import { readFileSync } from "fs";
import { readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin.js";

const W = 1920;
const H = 1080;
const STRIP_H = Math.round(H * 0.15);
const STRIP_Y = H - STRIP_H;

const WM_FONT_FAMILY = "NotoSansWM";

/** Embedded Noto Sans (latin + latin-ext + devanagari) for Sharp SVG→PNG on serverless (no system fonts). */
function watermarkFontFaceCss() {
  const dir = path.join(process.cwd(), "public", "fonts");
  const b64 = (name) =>
    readFileSync(path.join(dir, name), { encoding: "base64" });
  const src = (filename) => `url('data:font/woff2;base64,${b64(filename)}') format('woff2')`;

  return `
@font-face{font-family:'${WM_FONT_FAMILY}';font-style:normal;font-weight:400;font-display:block;src:${src("noto-sans-wm-latin-400.woff2")};unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;}
@font-face{font-family:'${WM_FONT_FAMILY}';font-style:normal;font-weight:400;font-display:block;src:${src("noto-sans-wm-latin-ext-400.woff2")};unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF;}
@font-face{font-family:'${WM_FONT_FAMILY}';font-style:normal;font-weight:400;font-display:block;src:${src("noto-sans-wm-devanagari-400.woff2")};unicode-range:U+0900-097F,U+1CD0-1CF9,U+200C-200D,U+20A8,U+20B9,U+20F0,U+25CC,U+A830-A839,U+A8E0-A8FF,U+11B00-11B09;}
@font-face{font-family:'${WM_FONT_FAMILY}';font-style:normal;font-weight:700;font-display:block;src:${src("noto-sans-wm-latin-700.woff2")};unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;}
@font-face{font-family:'${WM_FONT_FAMILY}';font-style:normal;font-weight:700;font-display:block;src:${src("noto-sans-wm-latin-ext-700.woff2")};unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF;}
@font-face{font-family:'${WM_FONT_FAMILY}';font-style:normal;font-weight:700;font-display:block;src:${src("noto-sans-wm-devanagari-700.woff2")};unicode-range:U+0900-097F,U+1CD0-1CF9,U+200C-200D,U+20A8,U+20B9,U+20F0,U+25CC,U+A830-A839,U+A8E0-A8FF,U+11B00-11B09;}
`.trim();
}

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

  let logoImageEl = "";
  let textStartX = pad;
  let logoClipDef = "";
  if (logoHref) {
    const lcx = pad + logoR;
    textStartX = pad + logoR * 2 + 28;
    const safeLogoHref = logoHref.replace(/&/g, "&amp;");
    logoClipDef = `<clipPath id="wmLogoClip"><circle cx="${lcx}" cy="${cxStrip}" r="${logoR}"/></clipPath>`;
    logoImageEl = `
      <image clip-path="url(#wmLogoClip)" href="${safeLogoHref}" x="${lcx - logoR}" y="${cxStrip - logoR}" width="${logoR * 2}" height="${logoR * 2}" preserveAspectRatio="xMidYMid slice"/>
    `;
  }

  const fontFaces = watermarkFontFaceCss();
  const defsBlock = `<defs><style type="text/css"><![CDATA[${fontFaces}]]></style>${logoClipDef}</defs>`;

  let leftText = "";
  if (agentName && agentPhone) {
    leftText = `
      <text x="${textStartX}" y="${cxStrip - 16}" fill="#ffffff" font-family="${WM_FONT_FAMILY}, sans-serif" font-size="${nameSize}" font-weight="700" dominant-baseline="middle">${escXml(agentName)}</text>
      <text x="${textStartX}" y="${cxStrip + 22}" fill="#ffffff" font-family="${WM_FONT_FAMILY}, sans-serif" font-size="${phoneSize}" font-weight="400" dominant-baseline="middle">${escXml(agentPhone)}</text>
    `;
  } else if (agentName) {
    leftText = `<text x="${textStartX}" y="${cxStrip}" fill="#ffffff" font-family="${WM_FONT_FAMILY}, sans-serif" font-size="${nameSize}" font-weight="700" dominant-baseline="middle">${escXml(agentName)}</text>`;
  } else if (agentPhone) {
    leftText = `<text x="${textStartX}" y="${cxStrip}" fill="#ffffff" font-family="${WM_FONT_FAMILY}, sans-serif" font-size="${phoneSize}" font-weight="400" dominant-baseline="middle">${escXml(agentPhone)}</text>`;
  }

  const rightText = `<text x="${W - pad}" y="${cxStrip}" fill="#ffffff" font-family="${WM_FONT_FAMILY}, sans-serif" font-size="${brandSize}" font-weight="400" text-anchor="end" dominant-baseline="middle">${escXml(brandText)}</text>`;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <rect width="${W}" height="${H}" fill="none"/>
  <rect x="0" y="${STRIP_Y}" width="${W}" height="${STRIP_H}" fill="#000000" fill-opacity="0.6"/>
  ${defsBlock}
  ${logoImageEl}
  ${leftText}
  ${rightText}
</svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

export async function getFallbackWatermarkPngBuffer() {
  const filePath = path.join(process.cwd(), "public", "mux-watermark", "northing-in.png");
  return readFile(filePath);
}
