"use client";

import AboutPage from "@/AboutPage.jsx";
import { useNorthing } from "@/modules/NorthingContext.jsx";

export default function About() {
  const { nav } = useNorthing();
  return <AboutPage onNavigate={nav} />;
}
