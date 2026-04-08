"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginPage } from "@/modules/NorthingApp";
import { useNorthing } from "@/modules/NorthingContext";

export default function LoginRoutePage() {
  const { login, showToast, nav } = useNorthing();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const resetLinkToastShown = useRef(false);

  useEffect(() => {
    if (searchParams.get("error") !== "reset_link" || resetLinkToastShown.current) return;
    resetLinkToastShown.current = true;
    showToast("That reset link is invalid or expired. Use Forgot password on this page to send a new email.", "error");
    const p = new URLSearchParams(searchParams.toString());
    p.delete("error");
    const qs = p.toString();
    router.replace(qs ? `/login?${qs}` : "/login", { scroll: false });
  }, [searchParams, showToast, router]);

  return <LoginPage key="login-route" onLogin={login} showToast={showToast} onNavigate={nav} forcedMode="login" redirectTo={next} />;
}
