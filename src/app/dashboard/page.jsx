"use client";

import { AgentDash, UserDash, MasterDash } from "@/modules/NorthingApp.jsx";
import { useNorthing } from "@/modules/NorthingContext.jsx";

export default function DashboardPage() {
  const { user, showToast, refreshSessionUser } = useNorthing();
  if (!user) return null;
  if (user.role === "agent" || user.role === "seller") {
    return <AgentDash currentUser={user} showToast={showToast} onPhoneLinked={refreshSessionUser} />;
  }
  if (user.role === "user") {
    return <UserDash currentUser={user} showToast={showToast} onPhoneLinked={refreshSessionUser} />;
  }
  if (user.role === "master") {
    return <MasterDash showToast={showToast} />;
  }
  return null;
}
