"use client";

import AboutPage from "@/AboutPage";
import { useNorthing } from "@/modules/NorthingContext";

export default function AboutRoutePage() {
  const { nav } = useNorthing();
  return <AboutPage onNavigate={nav} />;
}
