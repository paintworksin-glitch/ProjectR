"use client";

import TermsOfServicePage from "@/TermsOfServicePage";
import { useNorthing } from "@/modules/NorthingContext";

export default function TermsRoutePage() {
  const { nav } = useNorthing();
  return <TermsOfServicePage onNavigate={nav} />;
}
