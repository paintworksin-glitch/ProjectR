"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Home, AgentPage } from "@/modules/NorthingApp.jsx";
import { useNorthing } from "@/modules/NorthingContext.jsx";

function HomeOrAgent() {
  const { user, nav, openPropertyPage } = useNorthing();
  const searchParams = useSearchParams();
  const agent = searchParams.get("agent");
  if (agent) {
    return <AgentPage agentId={agent} onNavigate={nav} currentUser={user} />;
  }
  return <Home currentUser={user} onNavigate={nav} onOpenProperty={openPropertyPage} />;
}

export default function HomePageClient() {
  return (
    <Suspense fallback={null}>
      <HomeOrAgent />
    </Suspense>
  );
}
