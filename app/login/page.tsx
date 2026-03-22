"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const nextPath = searchParams.get("next") || "/edit";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message || "Unable to sign in.");
      return;
    }

    // First successful login can bootstrap the initial admin profile.
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (user) {
      const { data: existingProfile } = await supabase
        .from("admin_profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!existingProfile) {
        await supabase.from("admin_profiles").insert({
          id: user.id,
          role: "admin",
        });
      }
    }

    router.replace(nextPath);
  }

  return (
    <main className="mx-auto w-full max-w-xl px-6 py-20">
      <h1 className="text-3xl font-semibold">Admin Login</h1>
      <p className="mt-4 text-foreground/80">Sign in with your Supabase admin account to access edit mode.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/30"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/30"
          />
        </div>

        {errorMessage ? <p className="text-sm text-red-700">{errorMessage}</p> : null}

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-60"
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-foreground/70">
        Need to view the public site? <Link href="/" className="underline">Return home</Link>
      </p>
    </main>
  );
}
