"use client";

import TermsOfServicePage from "@/TermsOfServicePage.jsx";
import { useNorthing } from "@/modules/NorthingContext.jsx";

export default function TermsPage() {
  const { nav } = useNorthing();
  return <TermsOfServicePage onNavigate={nav} />;
}
