import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Logo } from "@/components/landing/Nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
        <div className="px-6 h-12 flex items-center justify-between">
          <Link href="/app" className="flex items-center gap-2 font-semibold">
            <Logo />
            <span>Evalo</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/docs" className="text-sm text-[color:var(--color-text-dim)] hover:text-white">
              Docs
            </Link>
            <div className="text-sm text-[color:var(--color-text-dim)]">
              {session.user.email}
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button className="text-sm text-[color:var(--color-text-dim)] hover:text-white" type="submit">
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
