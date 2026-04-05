"use client";

import { LoginPage } from "@/modules/NorthingApp.jsx";
import { useNorthing } from "@/modules/NorthingContext.jsx";

export default function Login() {
  const { login, showToast, nav } = useNorthing();
  return <LoginPage onLogin={login} showToast={showToast} onNavigate={nav} />;
}
