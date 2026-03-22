import Link from "next/link";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default function EditDashboardPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-20">
      <h1 className="text-3xl font-semibold">Edit Dashboard</h1>
      <p className="mt-4 text-foreground/80">
        Visual edit mode is scaffolded. Content wiring and auth guard are added in the next steps.
      </p>

      <div className="mt-8">
        <Link
          href="/edit/home"
          className="inline-flex items-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Edit Home Page
        </Link>
      </div>

      <div className="mt-4">
        <SignOutButton />
      </div>
    </main>
  );
}
