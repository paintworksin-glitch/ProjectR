"use client";

import { useSearchParams } from "next/navigation";
import { LoginPage } from "@/modules/NorthingApp";
import { useNorthing } from "@/modules/NorthingContext";
import { safeNextPath } from "@/lib/safeNextPath";

export default function SignupRoutePage() {
  const { login, showToast, nav } = useNorthing();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"), "/dashboard");
  return <LoginPage key="signup-route" onLogin={login} showToast={showToast} onNavigate={nav} initialMode="register" forcedMode="register" redirectTo={next} />;
}
