"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function EditBackNav() {
  const pathname = usePathname() || "";
  const onDashboard = pathname === "/edit" || pathname === "/edit/";
  if (onDashboard) return null;

  return (
    <div className="sticky top-0 z-40 border-b border-black/10 bg-[#f2f0ec]/95 px-6 py-2 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[95rem] justify-start">
        <Link
          href="/edit"
          className="inline-flex items-center gap-1.5 rounded-lg border border-primary/35 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary shadow-sm transition hover:border-primary hover:bg-primary hover:text-white"
        >
          <span aria-hidden="true" className="text-sm font-normal">
            ←
          </span>
          Back to page selector
        </Link>
      </div>
    </div>
  );
}
