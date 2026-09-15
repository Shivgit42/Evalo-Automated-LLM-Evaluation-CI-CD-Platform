import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Logo } from "@/components/landing/Nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const initial = (session.user.name ?? session.user.email ?? "U")[0].toUpperCase();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)]/80 backdrop-blur-md">
        <div className="px-5 h-12 flex items-center justify-between gap-4">
          <Link href="/app" className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity">
            <Logo />
            <span className="text-sm">Evalo</span>
          </Link>

          <div className="flex items-center gap-3 ml-auto">
            <Link
              href="/docs"
              className="text-xs text-[color:var(--color-text-faint)] hover:text-[color:var(--color-text-dim)] transition-colors hidden sm:block"
            >
              Docs
            </Link>
            <div className="w-px h-4 bg-[color:var(--color-border)]" />
            {/* User avatar */}
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-full bg-gradient-to-br from-violet-400 to-violet-700 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                {initial}
              </div>
              <span className="text-xs text-[color:var(--color-text-dim)] hidden sm:block max-w-[160px] truncate">
                {session.user.email}
              </span>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="text-xs text-[color:var(--color-text-faint)] hover:text-[color:var(--color-danger)] transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex-1">{children}</div>
    </div>
  );
}
