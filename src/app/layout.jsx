import { Suspense } from "react";
import NorthingProviders from "@/modules/NorthingProviders.jsx";

const publicSite = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL?.trim();

export const metadata = {
  ...(publicSite ? { metadataBase: new URL(publicSite) } : {}),
  title: "Northing",
  description: "Northing — real estate listings and marketing tools",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#f6f8fb" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0f172a" />
        <link rel="icon" type="image/svg+xml" href="/northing-mark.svg" />
        <link rel="apple-touch-icon" href="/northing-mark.svg" />
      </head>
      <body>
        <Suspense fallback={null}>
          <NorthingProviders>{children}</NorthingProviders>
        </Suspense>
      </body>
    </html>
  );
}
