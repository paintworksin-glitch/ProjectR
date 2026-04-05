"use client";

import PrivacyPolicyPage from "@/PrivacyPolicyPage.jsx";
import { useNorthing } from "@/modules/NorthingContext.jsx";

export default function PrivacyPage() {
  const { nav } = useNorthing();
  return <PrivacyPolicyPage onNavigate={nav} />;
}
