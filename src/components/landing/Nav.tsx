import Link from "next/link";

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[color:var(--color-bg)]/75 border-b border-[color:var(--color-border)]">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5 font-semibold hover:opacity-90 transition-opacity">
          <Logo />
          <span className="text-sm tracking-tight">Evalo</span>
        </Link>

        <div className="hidden md:flex items-center gap-7 text-sm text-[color:var(--color-text-dim)]">
          <Link href="/#how"      className="hover:text-white transition-colors">How it works</Link>
          <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/pricing"   className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/docs"      className="hover:text-white transition-colors">Docs</Link>
        </div>

        <div className="flex items-center gap-3 ml-auto md:ml-0">
          <Link href="/signin" className="text-sm text-[color:var(--color-text-dim)] hover:text-white transition-colors">
            Sign in
          </Link>
          <Link href="/signin" className="btn btn-brand text-sm px-4 py-1.5">
            Start free →
          </Link>
        </div>
      </div>
    </nav>
  );
}

export function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="13" fill="#0d0d10" />
      <defs>
        <linearGradient id="logo-g" x1="10" y1="16" x2="54" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      {/* Top bar — full */}
      <rect x="13" y="16" width="38" height="7" rx="2" fill="url(#logo-g)" />
      {/* Middle bar — shorter */}
      <rect x="13" y="28.5" width="26" height="7" rx="2" fill="url(#logo-g)" />
      {/* Bottom bar — full */}
      <rect x="13" y="41" width="38" height="7" rx="2" fill="url(#logo-g)" />
    </svg>
  );
}
