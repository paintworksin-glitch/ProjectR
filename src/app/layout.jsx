import { Suspense } from "react";
import NorthingProviders from "@/modules/NorthingProviders.jsx";

const publicSite = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL?.trim();

export const metadata = {
  ...(publicSite ? { metadataBase: new URL(publicSite) } : {}),
  title: "Northing",
  description: "Northing — real estate listings and marketing tools",
};

/** Neutral paint while client providers resolve `useSearchParams` (must not be `null` or the shell flashes blank). */
function ProvidersFallback() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#f6f8fb",
      }}
    />
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#f6f8fb" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0f172a" />
        <link rel="icon" type="image/svg+xml" href="/northing-mark.svg" />
        <link rel="apple-touch-icon" href="/northing-mark.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,800;1,700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Suspense fallback={<ProvidersFallback />}>
          <NorthingProviders>{children}</NorthingProviders>
        </Suspense>
      </body>
    </html>
  );
}
