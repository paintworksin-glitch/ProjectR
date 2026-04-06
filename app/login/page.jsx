"use client";

import { LoginPage } from "@/modules/NorthingApp";
import { useNorthing } from "@/modules/NorthingContext";

export default function LoginRoutePage() {
  const { login, showToast, nav } = useNorthing();
  return <LoginPage onLogin={login} showToast={showToast} onNavigate={nav} />;
}
