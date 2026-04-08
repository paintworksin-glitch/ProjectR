import { Suspense } from "react";
import NorthingProviders from "@/modules/NorthingProviders";

export const runtime = "nodejs";

const siteBase =
  process.env.NEXT_PUBLIC_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

export const metadata = {
  title: "Northing",
  description: "Northing App",
  ...(siteBase ? { metadataBase: new URL(siteBase) } : {}),
  alternates: {
    canonical: "/",
  },
};

const rootSuspenseFallback = (
  <div
    style={{ minHeight: "100vh", width: "100%", background: "var(--cream)" }}
    aria-hidden
  />
);

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Suspense fallback={rootSuspenseFallback}>
          <NorthingProviders>{children}</NorthingProviders>
        </Suspense>
      </body>
    </html>
  );
}
