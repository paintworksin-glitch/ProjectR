"use client";

import ProfilePageClient from "@/modules/ProfilePageClient";
import { useNorthing } from "@/modules/NorthingContext";

export default function ProfileRoutePage() {
  const { user, showToast, refreshSessionUser } = useNorthing();
  return <ProfilePageClient currentUser={user} showToast={showToast} onRefresh={refreshSessionUser} />;
}
