import { Suspense } from "react";
import NorthingProviders from "@/modules/NorthingProviders";

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
    <html lang="en">
      <body>
        <Suspense fallback={rootSuspenseFallback}>
          <NorthingProviders>{children}</NorthingProviders>
        </Suspense>
      </body>
    </html>
  );
}
