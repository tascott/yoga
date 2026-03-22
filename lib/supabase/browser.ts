"use client";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

let browserClient: ReturnType<typeof createClient<Database>> | null = null;

export function createSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  browserClient = createClient<Database>(url, anonKey);
  return browserClient;
}
