/**
 * One-off: upload public/mux-watermark/northing-in.png to Cloudflare Stream watermarks.
 * Requires CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_STREAM_API_TOKEN in .env.local (loaded via dotenv).
 * Prints the watermark uid — set CLOUDFLARE_WATERMARK_UID to that value.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
dotenv.config({ path: path.join(root, ".env.local") });
dotenv.config({ path: path.join(root, ".env") });

const accountId = (process.env.CLOUDFLARE_ACCOUNT_ID || "").trim();
const token = (process.env.CLOUDFLARE_STREAM_API_TOKEN || "").trim();
const pngPath = path.join(root, "public", "mux-watermark", "northing-in.png");

if (!accountId || !token) {
  console.error("Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_STREAM_API_TOKEN");
  process.exit(1);
}
if (!fs.existsSync(pngPath)) {
  console.error("Missing", pngPath);
  process.exit(1);
}

const buf = fs.readFileSync(pngPath);
const fd = new FormData();
fd.append("file", new Blob([buf], { type: "image/png" }), "northing-in.png");

const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/watermarks`;
const r = await fetch(url, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: fd,
});
const j = await r.json().catch(() => ({}));
if (!r.ok || j.success === false) {
  const msg = Array.isArray(j.errors) ? j.errors.map((e) => e.message).join("; ") : r.statusText;
  console.error("Failed:", msg || r.status);
  process.exit(1);
}
const uid = j.result?.uid;
console.log("CLOUDFLARE_WATERMARK_UID=", uid || "(see result below)");
console.log(JSON.stringify(j.result, null, 2));
