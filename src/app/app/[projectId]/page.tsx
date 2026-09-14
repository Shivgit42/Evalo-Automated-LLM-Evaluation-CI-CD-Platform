import { db } from "@/lib/db";
import { traces, evalRuns, datasets } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { formatRelative } from "@/lib/utils";
import Link from "next/link";

export default async function OverviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ newKey?: string }>;
}) {
  const { projectId } = await params;
  const { newKey } = await searchParams;

  const [tracesCountRow] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(traces)
    .where(eq(traces.projectId, projectId));

  const [datasetCountRow] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(datasets)
    .where(eq(datasets.projectId, projectId));

  const recentRuns = await db
    .select()
    .from(evalRuns)
    .where(eq(evalRuns.projectId, projectId))
    .orderBy(desc(evalRuns.createdAt))
    .limit(5);

  const recentTraces = await db
    .select()
    .from(traces)
    .where(eq(traces.projectId, projectId))
    .orderBy(desc(traces.createdAt))
    .limit(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <div className="text-sm text-[color:var(--color-text-dim)]">
          Recent activity for this project.
        </div>
      </div>

      {newKey && (
        <div className="card p-5 border-emerald-500/30 bg-emerald-500/5">
          <div className="font-medium text-emerald-300">Save this API key now</div>
          <div className="text-xs text-[color:var(--color-text-dim)] mt-1">
            You won&apos;t be able to see it again. Store it as <code>EVALO_API_KEY</code>.
          </div>
          <pre className="mt-3 text-sm select-all">{newKey}</pre>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <Stat label="Traces ingested" value={tracesCountRow?.c ?? 0} />
        <Stat label="Datasets" value={datasetCountRow?.c ?? 0} />
        <Stat label="Eval runs" value={recentRuns.length === 0 ? 0 : "—"} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium">Recent traces</h2>
            <Link href={`/app/${projectId}/traces`} className="text-xs text-[color:var(--color-brand)]">
              View all →
            </Link>
          </div>
          <div className="card divide-y divide-[color:var(--color-border)]">
            {recentTraces.length === 0 ? (
              <div className="p-6 text-sm text-[color:var(--color-text-dim)] text-center">
                No traces yet. <Link href={`/app/${projectId}/settings`} className="text-[color:var(--color-brand)]">Grab your API key →</Link>
              </div>
            ) : (
              recentTraces.map((t) => (
                <Link
                  key={t.id}
                  href={`/app/${projectId}/traces/${t.id}`}
                  className="flex items-center justify-between p-3 hover:bg-[color:var(--color-surface-2)]"
                >
                  <div className="text-sm">
                    <div className="font-medium">{t.name}</div>
                    <div className="text-xs text-[color:var(--color-text-faint)]">
                      {formatRelative(t.createdAt)} · {t.durationMs ?? "—"}ms
                    </div>
                  </div>
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${t.status === "ok" ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}
                  >
                    {t.status}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium">Recent eval runs</h2>
            <Link href={`/app/${projectId}/evals`} className="text-xs text-[color:var(--color-brand)]">
              View all →
            </Link>
          </div>
          <div className="card divide-y divide-[color:var(--color-border)]">
            {recentRuns.length === 0 ? (
              <div className="p-6 text-sm text-[color:var(--color-text-dim)] text-center">
                No eval runs yet.
              </div>
            ) : (
              recentRuns.map((r) => (
                <Link
                  key={r.id}
                  href={`/app/${projectId}/evals/${r.id}`}
                  className="flex items-center justify-between p-3 hover:bg-[color:var(--color-surface-2)]"
                >
                  <div className="text-sm">
                    <div className="font-medium">Run · {Math.round(r.passRate * 100)}% pass</div>
                    <div className="text-xs text-[color:var(--color-text-faint)]">
                      {formatRelative(r.createdAt)} · {r.total} cases
                    </div>
                  </div>
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
                      r.status === "succeeded"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : r.status === "failed"
                          ? "bg-red-500/15 text-red-300"
                          : "bg-amber-500/15 text-amber-300"
                    }`}
                  >
                    {r.status}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card p-5">
      <div className="text-xs uppercase tracking-wider text-[color:var(--color-text-faint)]">{label}</div>
      <div className="text-3xl font-semibold mt-2">{value}</div>
    </div>
  );
}
