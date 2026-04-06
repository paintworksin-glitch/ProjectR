"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AgentDash, UserDash, MasterDash } from "@/modules/NorthingApp";
import { useNorthing } from "@/modules/NorthingContext";

export default function DashboardRoutePage() {
  const { user, authLoading, showToast, refreshSessionUser } = useNorthing();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--muted)",
        }}
      >
        Loading…
      </div>
    );
  }

  if (user.role === "master") {
    return <MasterDash showToast={showToast} />;
  }

  if (user.role === "user") {
    return (
      <UserDash
        currentUser={user}
        showToast={showToast}
        onPhoneLinked={refreshSessionUser}
      />
    );
  }

  if (user.role === "agent" || user.role === "seller") {
    return (
      <AgentDash
        currentUser={user}
        showToast={showToast}
        onPhoneLinked={refreshSessionUser}
      />
    );
  }

  return (
    <UserDash
      currentUser={user}
      showToast={showToast}
      onPhoneLinked={refreshSessionUser}
    />
  );
}
