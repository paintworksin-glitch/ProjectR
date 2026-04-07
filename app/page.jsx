import { Suspense } from "react";
import HomePageClient from "./HomePageClient";

export const runtime = "nodejs";

export const metadata = {
  title: "Northing — Find, List & Share Properties",
  description:
    "Find, list and share properties with independent brokers across Mumbai, Thane and Navi Mumbai. WhatsApp cards, PDF brochures, and listings built for the Indian market.",
};

const homeSuspenseFallback = (
  <div
    style={{ minHeight: "60vh", width: "100%", background: "var(--cream)" }}
    aria-hidden
  />
);

export default function Page() {
  return (
    <Suspense fallback={homeSuspenseFallback}>
      <HomePageClient />
    </Suspense>
  );
}
