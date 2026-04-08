export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { checkRateLimit } = await import("../src/lib/rateLimit.js");
  const ip = (req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
  const rate = checkRateLimit(`score-photo:${ip}`, 60_000, 12);
  if (!rate.ok) return res.status(429).json({ error: "Too many requests" });

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  );
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) return res.status(401).json({ error: "Unauthorized" });

  const { base64, mediaType } = req.body;
  if (!base64 || !mediaType) return res.status(400).json({ error: "base64 and mediaType are required" });
  if (String(base64).length > 10_000_000) return res.status(413).json({ error: "Image payload too large" });

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.CLAUDE_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
          { type: "text", text: "You are a real estate photography expert. Score this property photo for use as a listing cover image. Rate each from 1-10 lighting, angle, appeal, clarity. Respond ONLY with valid JSON no markdown {\"lighting\":7,\"angle\":8,\"appeal\":9,\"clarity\":8,\"overall\":8,\"reason\":\"one sentence\"}" }
        ]
      }]
    }),
  });

  if (!response.ok) {
    const msg = await response.text();
    return res.status(response.status).json({ error: "Scoring provider error", detail: msg.slice(0, 300) });
  }

  const data = await response.json();
  res.status(200).json(data);
}
