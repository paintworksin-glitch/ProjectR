export default function sitemap() {
  const base = "https://www.northing.in";
  const now = new Date().toISOString();

  return [
    { url: base,              lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${base}/feed`,    lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${base}/about`,   lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/login`,   lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
    { url: `${base}/terms`,   lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
  ];
}
