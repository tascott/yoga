"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  async function handleSignOut() {
    setIsLoading(true);
    await supabase.auth.signOut();
    setIsLoading(false);
    router.replace("/login");
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isLoading}
      className="inline-flex items-center rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-medium"
    >
      {isLoading ? "Signing out..." : "Sign out"}
    </button>
  );
}
