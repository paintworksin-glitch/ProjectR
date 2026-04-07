"use client";

import { useEffect, useState } from "react";
import HomePageClientContent from "./HomePageClientContent";

// HomePageClientContent uses useSearchParams. By gating it behind a mount
// check, useSearchParams is never called during SSR/static generation,
// which eliminates BAILOUT_TO_CLIENT_SIDE_RENDERING from the page HTML.
export default function HomePageClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{ minHeight: "100vh" }} />;
  return <HomePageClientContent />;
}
