import Link from "next/link";
import { Logo } from "./Nav";

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--color-border)] py-12 mt-24">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="flex items-center gap-2 font-semibold mb-3">
            <Logo /> Evalo
          </div>
          <div className="text-[color:var(--color-text-faint)] text-xs">
            GitHub-native evals for AI features. Catch regressions before you merge.
          </div>
        </div>
        <FooterCol
          title="Product"
          links={[
            ["Pricing", "/pricing"],
            ["Docs", "/docs"],
            ["Changelog", "/changelog"],
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            ["About", "/about"],
            ["Blog", "/blog"],
            ["Careers", "/careers"],
          ]}
        />
        <FooterCol
          title="Legal"
          links={[
            ["Privacy", "/privacy"],
            ["Terms", "/terms"],
            ["Security", "/security"],
          ]}
        />
      </div>
      <div className="max-w-6xl mx-auto px-6 mt-12 text-xs text-[color:var(--color-text-faint)]">
        © {new Date().getFullYear()} Evalo, Inc.
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div className="font-medium mb-3">{title}</div>
      <div className="space-y-2 text-[color:var(--color-text-dim)]">
        {links.map(([label, href]) => (
          <div key={href}>
            <Link href={href} className="hover:text-white">
              {label}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
