"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function SearchParamsHandler({ onAgentChange }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const agent = searchParams.get("agent");
    onAgentChange?.(agent);
  }, [searchParams, onAgentChange]);

  return null;
}

