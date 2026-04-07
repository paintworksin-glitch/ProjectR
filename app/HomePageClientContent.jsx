"use client";

import { useSearchParams } from "next/navigation";
import { Home, AgentPage } from "@/modules/NorthingApp";
import { useNorthing } from "@/modules/NorthingContext";

export default function HomePageClientContent() {
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
