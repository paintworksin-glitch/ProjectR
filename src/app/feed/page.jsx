"use client";

import { Feed } from "@/modules/NorthingApp.jsx";
import { useNorthing } from "@/modules/NorthingContext.jsx";

export default function FeedPage() {
  const { user, showToast, nav, openPropertyPage } = useNorthing();
  return <Feed currentUser={user} showToast={showToast} onNavigate={nav} onOpenProperty={openPropertyPage} />;
}
