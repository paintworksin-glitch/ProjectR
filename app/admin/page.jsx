"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MasterDash } from "@/modules/NorthingApp";
import { useNorthing } from "@/modules/NorthingContext";

export default function AdminPage() {
  const { showToast, user, authLoading } = useNorthing();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login?next=/admin");
      return;
    }
    if (user.role !== "master") {
      router.replace("/dashboard");
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

  if (user.role !== "master") {
    return null;
  }

  return <MasterDash showToast={showToast} />;
}
