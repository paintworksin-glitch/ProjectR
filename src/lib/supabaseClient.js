"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseUrlAndAnonKey } from "./supabaseEnv";

let _browserClient = null;

function getBrowserClient() {
  if (!_browserClient) {
    const { url, key } = getSupabaseUrlAndAnonKey();
    _browserClient = createBrowserClient(url, key);
  }
  return _browserClient;
}

/**
 * Lazy singleton so `next build` can prerender routes when env is only present at deploy time.
 * Missing env throws on first use (browser), not at module load.
 */
export const supabase = new Proxy(
  {},
  {
    get(_, prop) {
      return getBrowserClient()[prop];
    },
  }
);
