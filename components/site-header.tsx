"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const onApplications = pathname === "/applications";

  return (
    <header className="bg-secondary">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg font-semibold">
          <span className="grid size-9 place-items-center rounded-full bg-primary text-sm text-primary-foreground">F</span>
          Fitline
        </Link>
        <nav className="flex min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium">
          <Link
            href="/applications"
            aria-current={onApplications ? "page" : undefined}
            className={cn(onApplications && "text-primary")}
          >
            Applications
          </Link>
        </nav>
      </div>
    </header>
  );
}
