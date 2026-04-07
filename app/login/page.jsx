"use client";

import { useSearchParams } from "next/navigation";
import { LoginPage } from "@/modules/NorthingApp";
import { useNorthing } from "@/modules/NorthingContext";

export default function LoginRoutePage() {
  const { login, showToast, nav } = useNorthing();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  return <LoginPage onLogin={login} showToast={showToast} onNavigate={nav} redirectTo={next} />;
}
