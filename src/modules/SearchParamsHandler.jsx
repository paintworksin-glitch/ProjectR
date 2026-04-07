"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useNorthing } from "./NorthingContext.jsx";

export default function SearchParamsHandler() {
  const searchParams = useSearchParams();
  const { setAgentParam } = useNorthing();

  useEffect(() => {
    const agent = searchParams.get("agent");
    setAgentParam?.(agent);
  }, [searchParams, setAgentParam]);

  return null;
}

