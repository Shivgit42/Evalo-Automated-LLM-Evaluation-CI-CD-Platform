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

  const firstName = session.user.name?.split(" ")[0] ?? "there";

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10 animate-fade-up">
        <h1 className="text-2xl font-semibold">
          Good {getTimeOfDay()},{" "}
          <span className="gradient-text">{firstName}</span> 👋
        </h1>
        <p className="text-sm text-[color:var(--color-text-dim)] mt-1">
          {rows.length === 0
            ? "Create your first project to start ingesting traces and running evals."
            : `You have ${rows.length} project${rows.length === 1 ? "" : "s"}. Select one to explore traces, datasets, and eval runs.`}
        </p>
      </div>

      {/* Create project */}
      <div className="card p-5 mb-8 animate-fade-up delay-100">
        <div className="text-xs text-[color:var(--color-text-faint)] uppercase tracking-wider mb-3">New project</div>
        <form action={createProjectAction} className="flex flex-col sm:flex-row gap-3">
          <input
            name="name"
            placeholder="e.g. customer-support-agent"
            className="flex-1 bg-[color:var(--color-surface-2)] border border-[color:var(--color-border-2)] rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--color-brand)] focus:border-[color:var(--color-brand)] transition-all placeholder:text-[color:var(--color-text-faint)]"
            required
          />
          <button type="submit" className="btn btn-brand px-5 shrink-0">
            + Create project
          </button>
        </form>
      </div>

      {/* Projects grid */}
      {rows.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid md:grid-cols-2 gap-4 animate-fade-up delay-200">
          {rows.map((p, i) => (
            <Link
              key={p.id}
              href={`/app/${p.id}`}
              className={`card card-hover p-5 flex flex-col gap-4 delay-${Math.min(i * 100, 500)}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-[color:var(--color-text-faint)] mt-0.5 font-mono">
                    {p.slug}
                  </div>
                </div>
                <span className={`badge shrink-0 ${p.plan === "pro" ? "badge-purple" : p.plan === "team" ? "badge-green" : "badge-amber"}`}>
                  {p.plan}
                </span>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-[color:var(--color-surface-2)] border border-[color:var(--color-border)] px-3 py-2.5">
                  <div className="text-lg font-semibold">{p.traceCount.toLocaleString()}</div>
                  <div className="text-[11px] text-[color:var(--color-text-faint)] mt-0.5">traces this period</div>
                </div>
                <div className="rounded-lg bg-[color:var(--color-surface-2)] border border-[color:var(--color-border)] px-3 py-2.5">
                  <div className="text-lg font-semibold text-[color:var(--color-text-dim)]">—</div>
                  <div className="text-[11px] text-[color:var(--color-text-faint)] mt-0.5">last eval run</div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <span className="text-[11px] text-[color:var(--color-text-faint)]">
                  Created {formatRelative(p.createdAt)}
                </span>
                <span className="text-[11px] text-[color:var(--color-brand)] opacity-0 group-hover:opacity-100 transition-opacity">
                  Open →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card p-14 text-center animate-fade-up delay-200 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#6d28d9]/10 blur-[60px] pointer-events-none" />
      <div className="relative">
        <div className="text-5xl mb-5 animate-float">🚀</div>
        <div className="text-lg font-semibold">No projects yet</div>
        <div className="text-sm text-[color:var(--color-text-dim)] mt-2 max-w-sm mx-auto">
          Create your first project above to get an API key and start ingesting traces.
        </div>
        <div className="mt-8 grid sm:grid-cols-3 gap-4 text-left max-w-xl mx-auto">
          {[
            { icon: "🔑", title: "Get an API key", desc: "One key per project, scoped to your team." },
            { icon: "📡", title: "Ingest traces", desc: "Wrap your LLM calls with our SDK." },
            { icon: "⚡", title: "Run evals on PRs", desc: "Install the GitHub App and you're done." },
          ].map((step) => (
            <div key={step.title} className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-4">
              <div className="text-xl mb-2">{step.icon}</div>
              <div className="font-medium text-sm">{step.title}</div>
              <div className="text-xs text-[color:var(--color-text-faint)] mt-1">{step.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getTimeOfDay() {
  // Server component — use UTC hour as approximation
  const h = new Date().getUTCHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}
