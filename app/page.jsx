import { Suspense } from "react";
import HomePageClient from "./HomePageClient";

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
