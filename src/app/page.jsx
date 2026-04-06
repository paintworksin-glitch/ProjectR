import { Suspense } from "react";
import HomeLandingShell from "./HomeLandingShell.jsx";
import HomePageClient from "./HomePageClient.jsx";

export const metadata = {
  title: "Northing — Find your dream home",
  description:
    "Browse curated property listings, or list with brochures and WhatsApp-ready marketing cards.",
};

/**
 * Server Component root for `/`.
 * Shell + links render on the server; interactive home hydrates via HomePageClient.
 */
export default function Page() {
  return (
    <Suspense fallback={<HomeLandingShell />}>
      <HomePageClient />
    </Suspense>
  );
}
