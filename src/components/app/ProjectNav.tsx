"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  return (
    <nav className="p-2 text-sm">
      {links.map((l) => {
        const href = `/app/${projectId}${l.href}`;
        const active =
          l.href === ""
            ? pathname === href
            : pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={l.href}
            href={href}
            className={cn(
              "block px-3 py-1.5 rounded-md transition-colors",
              active
                ? "bg-[color:var(--color-surface-2)] text-white"
                : "text-[color:var(--color-text-dim)] hover:bg-[color:var(--color-surface-2)] hover:text-white",
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
