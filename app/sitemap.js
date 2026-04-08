import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function sitemap() {
  const base = "https://www.northing.in";
  const now = new Date().toISOString();

  const staticUrls = [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/feed`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  try {
    const supabase = await createSupabaseServerClient();
    const [{ data: listings }, { data: brokers }] = await Promise.all([
      supabase.from("listings").select("id,created_at").eq("status", "Active").order("created_at", { ascending: false }).limit(500),
      supabase.from("profiles").select("name,updated_at").in("role", ["agent", "seller"]).not("name", "is", null).limit(300),
    ]);

    const listingUrls = (listings || []).flatMap((row) => {
      const lastModified = row.created_at || now;
      return [
        { url: `${base}/property/${row.id}`, lastModified, changeFrequency: "daily", priority: 0.8 },
        { url: `${base}/share/${row.id}`, lastModified, changeFrequency: "weekly", priority: 0.6 },
      ];
    });

    const seen = new Set();
    const brokerUrls = (brokers || [])
      .map((b) => {
        const slug = String(b.name || "")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-");
        if (!slug || seen.has(slug)) return null;
        seen.add(slug);
        return {
          url: `${base}/broker/${encodeURIComponent(slug)}`,
          lastModified: b.updated_at || now,
          changeFrequency: "weekly",
          priority: 0.5,
        };
      })
      .filter(Boolean);

    return [...staticUrls, ...listingUrls, ...brokerUrls];
  } catch {
    return staticUrls;
  }
}
