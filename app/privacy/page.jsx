"use client";

import PrivacyPolicyPage from "@/PrivacyPolicyPage";
import { useNorthing } from "@/modules/NorthingContext";

export default function PrivacyRoutePage() {
  const { nav } = useNorthing();
  return <PrivacyPolicyPage onNavigate={nav} />;
}
