"use client";

import { useSearchParams } from "next/navigation";
import { LoginPage } from "@/modules/NorthingApp";
import { useNorthing } from "@/modules/NorthingContext";

export default function SignupRoutePage() {
  const { login, showToast, nav } = useNorthing();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  return <LoginPage key="signup-route" onLogin={login} showToast={showToast} onNavigate={nav} initialMode="register" forcedMode="register" redirectTo={next} />;
}
