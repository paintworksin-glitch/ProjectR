import { Suspense } from "react";
import NorthingProviders from "@/modules/NorthingProviders";
import SearchParamsHandler from "@/modules/SearchParamsHandler";

export const runtime = "nodejs";

export const metadata = {
  title: "Northing",
  description: "Northing App",
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
          <NorthingProviders>
            <Suspense fallback={null}>
              <SearchParamsHandler />
            </Suspense>
            {children}
          </NorthingProviders>
        </Suspense>
      </body>
    </html>
  );
}
