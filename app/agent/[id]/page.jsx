"use client";

import { AgentPage } from "@/modules/NorthingApp";
import { useNorthing } from "@/modules/NorthingContext";

export default function AgentByIdRoutePage({ params }) {
  const { user, nav } = useNorthing();
  return <AgentPage agentId={params.id} onNavigate={nav} currentUser={user} />;
}
