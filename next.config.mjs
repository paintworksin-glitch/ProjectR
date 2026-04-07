/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        // Homepage must never be served stale from a CDN edge cache.
        // force-dynamic already disables Vercel's pre-rendering, but this
        // header ensures any upstream proxy/CDN also skips caching.
        source: "/",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
          { key: "Vary", value: "Accept-Encoding" },
        ],
      },
    ];
  },
};

export default nextConfig;
