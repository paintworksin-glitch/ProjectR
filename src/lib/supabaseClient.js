"use client";

import { createBrowserClient } from "@supabase/ssr";

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://thgnziutmpmnsrkjoext.supabase.co";
const key =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoZ256aXV0bXBtbnNya2pvZXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MTUwOTcsImV4cCI6MjA4ODA5MTA5N30.SYLiGFgGChnibmEP5RQVmJzlfr_nBDpJJCOmTCZgZ9Y";

export const supabase = createBrowserClient(url, key);
