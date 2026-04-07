"use client";

import { useEffect, useState } from "react";
import { Home, AgentPage } from "@/modules/NorthingApp";
import { useNorthing } from "@/modules/NorthingContext";

// SSR renders <Home> so crawlers and AI see real content.
// After hydration we check window.location.search for ?agent= client-only —
// no useSearchParams call during SSR means zero BAILOUT_TO_CLIENT_SIDE_RENDERING.
export default function HomePageClient() {
  const { user, nav, openPropertyPage } = useNorthing();
  const [agentId, setAgentId] = useState(null);

  useEffect(() => {
    const agent = new URLSearchParams(window.location.search).get("agent");
    setAgentId(agent || null);
  }, []);

  if (agentId) {
    return <AgentPage agentId={agentId} onNavigate={nav} currentUser={user} />;
  }

  return (
    <Home currentUser={user} onNavigate={nav} onOpenProperty={openPropertyPage} />
  );
}
