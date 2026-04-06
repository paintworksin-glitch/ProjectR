"use client";

import { Feed } from "@/modules/NorthingApp";
import { useNorthing } from "@/modules/NorthingContext";

export default function FeedRoutePage() {
  const { user, showToast, nav, openPropertyPage } = useNorthing();
  return (
    <Feed
      currentUser={user}
      showToast={showToast}
      onNavigate={nav}
      onOpenProperty={openPropertyPage}
    />
  );
}
