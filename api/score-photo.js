export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { base64, mediaType } = req.body;

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

  const data = await response.json();
  res.status(200).json(data);
}
