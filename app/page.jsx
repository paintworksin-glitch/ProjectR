import { Suspense } from "react";
import HomePageClient from "./HomePageClient";

export const runtime = "nodejs";

export const metadata = {
  title: "Northing — Find, List & Share Properties",
  description:
    "Find, list and share properties with independent brokers across Mumbai, Thane and Navi Mumbai. WhatsApp cards, PDF brochures, and listings built for the Indian market.",
};

export default function Page() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
      <HomePageClient />
    </Suspense>
  );
}
