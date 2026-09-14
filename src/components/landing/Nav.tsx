import Link from "next/link";

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[color:var(--color-bg)]/70 border-b border-[color:var(--color-border)]">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Logo />
          <span>Evalo</span>
        </Link>
        <div className="hidden md:flex items-center gap-7 text-sm text-[color:var(--color-text-dim)]">
          <Link href="/#how" className="hover:text-white">How it works</Link>
          <Link href="/#features" className="hover:text-white">Features</Link>
          <Link href="/pricing" className="hover:text-white">Pricing</Link>
          <Link href="/docs" className="hover:text-white">Docs</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/signin" className="text-sm text-[color:var(--color-text-dim)] hover:text-white">
            Sign in
          </Link>
          <Link href="/signin" className="btn btn-primary text-sm">
            Start free
          </Link>
        </div>
      </div>
    </nav>
  );
}

export function Logo() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
      <rect x="2" y="2" width="28" height="28" rx="7" fill="url(#g)" />
      <path
        d="M10 16 L14 20 L22 12"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0" stopColor="#a78bfa" />
          <stop offset="1" stopColor="#6d28d9" />
        </linearGradient>
      </defs>
    </svg>
  );
}
