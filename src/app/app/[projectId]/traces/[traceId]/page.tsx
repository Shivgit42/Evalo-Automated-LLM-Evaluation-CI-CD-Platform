import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { traces, spans } from "@/lib/db/schema";
import { and, eq, asc } from "drizzle-orm";

export default async function TraceDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; traceId: string }>;
}) {
  const { projectId, traceId } = await params;
  const trace = await db.query.traces.findFirst({
    where: and(eq(traces.id, traceId), eq(traces.projectId, projectId)),
  });
  if (!trace) notFound();

  const traceSpans = await db
    .select()
    .from(spans)
    .where(eq(spans.traceId, traceId))
    .orderBy(asc(spans.startedAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{trace.name}</h1>
        <div className="text-sm text-[color:var(--color-text-dim)] mt-1">
          {trace.environment} ·{" "}
          <span className={trace.status === "ok" ? "text-emerald-400" : "text-red-400"}>
            {trace.status}
          </span>{" "}
          · {trace.durationMs ?? "—"}ms ·{" "}
          {(trace.tokensInput ?? 0) + (trace.tokensOutput ?? 0)} tokens
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <JsonCard title="Input" data={trace.input} />
        <JsonCard title="Output" data={trace.output} />
      </div>

      {trace.error && (
        <div className="card p-4 border-red-500/30 bg-red-500/5">
          <div className="font-medium text-red-300 mb-1">Error</div>
          <pre className="text-xs">{trace.error}</pre>
        </div>
      )}

      <div>
        <h2 className="font-medium mb-3">Spans ({traceSpans.length})</h2>
        <div className="card divide-y divide-[color:var(--color-border)]">
          {traceSpans.length === 0 ? (
            <div className="p-6 text-sm text-[color:var(--color-text-dim)] text-center">
              No spans recorded.
            </div>
          ) : (
            traceSpans.map((s) => (
              <details key={s.id} className="p-4">
                <summary className="cursor-pointer flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <KindBadge kind={s.kind} />
                    <span className="font-medium">{s.name}</span>
                    {s.model && (
                      <span className="text-xs text-[color:var(--color-text-faint)]">
                        {s.model}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[color:var(--color-text-faint)]">
                    {s.latencyMs ?? "—"}ms ·{" "}
                    {(s.tokensInput ?? 0) + (s.tokensOutput ?? 0) || "—"} tok
                  </div>
                </summary>
                <div className="mt-3 grid md:grid-cols-2 gap-3">
                  <JsonCard title="Input" data={s.input} dense />
                  <JsonCard title="Output" data={s.output} dense />
                </div>
              </details>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function KindBadge({ kind }: { kind: string }) {
  const colors: Record<string, string> = {
    llm: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    tool: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    retrieval: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    span: "bg-[color:var(--color-surface-2)] text-[color:var(--color-text-dim)]",
  };
  return (
    <span
      className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${colors[kind] ?? colors.span}`}
    >
      {kind}
    </span>
  );
}

function JsonCard({ title, data, dense }: { title: string; data: unknown; dense?: boolean }) {
  return (
    <div className="card overflow-hidden">
      <div className="text-[10px] uppercase tracking-wider text-[color:var(--color-text-faint)] px-3 py-2 border-b border-[color:var(--color-border)]">
        {title}
      </div>
      <pre className={`text-xs ${dense ? "max-h-48 overflow-auto" : "max-h-80 overflow-auto"}`}>
        {data === null || data === undefined ? "—" : JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
