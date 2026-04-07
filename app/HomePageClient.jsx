"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Home, AgentPage } from "@/modules/NorthingApp";
import { useNorthing } from "@/modules/NorthingContext";

function HomePageClientInner() {
  const searchParams = useSearchParams();
  const { user, nav, openPropertyPage } = useNorthing();
  const agentId = searchParams.get("agent");

  if (agentId) {
    return <AgentPage agentId={agentId} onNavigate={nav} currentUser={user} />;
  }

  return (
    <Home currentUser={user} onNavigate={nav} onOpenProperty={openPropertyPage} />
  );
}

export default function HomePageClient() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
      <HomePageClientInner />
    </Suspense>
  );
}
