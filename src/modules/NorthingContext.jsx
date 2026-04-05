"use client";

import { createContext, useContext } from "react";

export const NorthingContext = createContext(null);

export function useNorthing() {
  const ctx = useContext(NorthingContext);
  if (!ctx) throw new Error("useNorthing must be used within NorthingProviders");
  return ctx;
}
