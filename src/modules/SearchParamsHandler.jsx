"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useNorthing } from "./NorthingContext.jsx";

// Only rendered client-side (after mount) so useSearchParams is never called
// during SSR/static generation — eliminates BAILOUT_TO_CLIENT_SIDE_RENDERING
function SearchParamsHandlerInner() {
  const searchParams = useSearchParams();
  const { setAgentParam } = useNorthing();

  useEffect(() => {
    setAgentParam?.(searchParams.get("agent"));
  }, [searchParams, setAgentParam]);

  return null;
}

export default function SearchParamsHandler() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return <SearchParamsHandlerInner />;
}
