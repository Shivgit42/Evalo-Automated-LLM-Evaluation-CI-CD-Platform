"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";

const links = [
  { href: "", label: "Overview" },
  { href: "/traces", label: "Traces" },
  { href: "/datasets", label: "Datasets" },
  { href: "/evals", label: "Eval runs" },
  { href: "/settings", label: "Settings" },
];

export function ProjectNav({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const handleClick = (href: string) => {
    if (pathname === href) return;
    setPendingHref(href);
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <nav className="p-2 text-sm">
      {links.map((l) => {
        const href = `/app/${projectId}${l.href}`;
        const isActive =
          l.href === ""
            ? pathname === href
            : pathname === href || pathname.startsWith(href + "/");

        // Show active style optimistically if we just clicked this link
        const showActive = isActive || (isPending && pendingHref === href);
        const showPending = isPending && pendingHref === href && !isActive;

        return (
          <button
            key={l.href}
            onClick={() => handleClick(href)}
            className={cn(
              "w-full text-left flex items-center justify-between px-3 py-1.5 rounded-md transition-colors",
              showActive
                ? "bg-[color:var(--color-surface-2)] text-white"
                : "text-[color:var(--color-text-dim)] hover:bg-[color:var(--color-surface-2)] hover:text-white",
            )}
          >
            <span>{l.label}</span>
            {showPending && (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin opacity-60" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
