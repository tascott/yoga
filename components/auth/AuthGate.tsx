"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthGateProps = {
  children: React.ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) return;
      if (error || !data.session) {
        setIsAllowed(false);
        setIsLoading(false);
        router.replace(`/login?next=${encodeURIComponent(pathname || "/edit")}`);
        return;
      }

      setIsAllowed(true);
      setIsLoading(false);
    }

    checkSession();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setIsAllowed(false);
        router.replace(`/login?next=${encodeURIComponent(pathname || "/edit")}`);
      } else {
        setIsAllowed(true);
      }
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, [supabase, router, pathname]);

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-20">
        <p className="text-sm text-foreground/70">Checking admin session...</p>
      </main>
    );
  }

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
}
