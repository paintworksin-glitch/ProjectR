export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const expected = process.env.CLEANUP_CRON_SECRET;
  if (!expected) return res.status(503).json({ error: "Cleanup secret not configured" });
  const provided = req.headers["x-cleanup-token"];
  if (provided !== expected) return res.status(401).json({ error: "Unauthorized" });

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
  const { error } = await supabase
    .from('share_events')
    .delete()
    .lt('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

  if (error) return res.status(500).json({ error });
  res.status(200).json({ ok: true, message: 'Old share events cleaned up' });
}
