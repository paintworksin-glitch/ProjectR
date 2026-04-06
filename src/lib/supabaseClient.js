"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseUrlAndAnonKey } from "./supabaseEnv";

const { url, key } = getSupabaseUrlAndAnonKey();

export const supabase = createBrowserClient(url, key);
