import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { createProjectAction } from "@/lib/projects";
import { formatRelative } from "@/lib/utils";

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.ownerId, session.user.id))
    .orderBy(desc(projects.createdAt));

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <div className="text-sm text-[color:var(--color-text-dim)]">
            Each project has its own API keys, datasets, and eval runs.
          </div>
        </div>
      </div>

      <div className="card p-6 mb-8">
        <form action={createProjectAction} className="flex flex-col md:flex-row gap-3">
          <input
            name="name"
            placeholder="New project name (e.g. customer-support-agent)"
            className="flex-1 bg-[color:var(--color-surface-2)] border border-[color:var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--color-brand)]"
            required
          />
          <button type="submit" className="btn btn-brand">
            Create project
          </button>
        </form>
      </div>

      {rows.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-lg font-medium">No projects yet</div>
          <div className="text-sm text-[color:var(--color-text-dim)] mt-2">
            Create your first project above to get an API key and start ingesting traces.
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {rows.map((p) => (
            <Link
              key={p.id}
              href={`/app/${p.id}`}
              className="card p-5 hover:border-[color:var(--color-brand)] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{p.name}</div>
                <span className="text-[10px] uppercase tracking-wider text-[color:var(--color-text-faint)]">
                  {p.plan}
                </span>
              </div>
              <div className="text-xs text-[color:var(--color-text-faint)] mt-1">
                {p.slug} · created {formatRelative(p.createdAt)}
              </div>
              <div className="mt-4 text-sm text-[color:var(--color-text-dim)]">
                {p.traceCount.toLocaleString()} traces this period
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
