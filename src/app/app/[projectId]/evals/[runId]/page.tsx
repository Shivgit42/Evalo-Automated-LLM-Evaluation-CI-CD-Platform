import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { evalRuns, evalResults, datasetItems } from "@/lib/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { formatRelative } from "@/lib/utils";

export default async function EvalRunPage({
  params,
}: {
  params: Promise<{ projectId: string; runId: string }>;
}) {
  const { projectId, runId } = await params;
  const run = await db.query.evalRuns.findFirst({
    where: and(eq(evalRuns.id, runId), eq(evalRuns.projectId, projectId)),
  });
  if (!run) notFound();

  const results = await db
    .select({
      r: evalResults,
      item: datasetItems,
    })
    .from(evalResults)
    .leftJoin(datasetItems, eq(datasetItems.id, evalResults.datasetItemId))
    .where(eq(evalResults.evalRunId, runId))
    .orderBy(desc(evalResults.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Eval run</h1>
        <div className="text-sm text-[color:var(--color-text-dim)]">
          {formatRelative(run.createdAt)} · model <code>{run.model}</code>
          {run.prNumber && <> · PR #{run.prNumber}</>}
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Stat label="Pass rate" value={`${Math.round(run.passRate * 100)}%`} />
        <Stat label="Passed" value={run.passed} accent="emerald" />
        <Stat label="Failed" value={run.failed} accent="red" />
        <Stat label="Total" value={run.total} />
      </div>

      {run.errorMessage && (
        <div className="card p-4 border-red-500/30 bg-red-500/5 text-sm">
          <div className="font-medium text-red-300 mb-1">Run error</div>
          <pre className="text-xs">{run.errorMessage}</pre>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-[color:var(--color-text-faint)] border-b border-[color:var(--color-border)]">
            <tr>
              <th className="text-left px-4 py-3 w-12">#</th>
              <th className="text-left px-4 py-3 w-24">Result</th>
              <th className="text-left px-4 py-3">Input</th>
              <th className="text-left px-4 py-3">Output</th>
              <th className="text-left px-4 py-3 w-1/4">Reason</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row, i) => (
              <tr
                key={row.r.id}
                className="border-b border-[color:var(--color-border)] align-top"
              >
                <td className="px-4 py-3 text-[color:var(--color-text-faint)]">{i + 1}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${row.r.passed ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}
                  >
                    {row.r.passed ? "pass" : "fail"}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs whitespace-pre-wrap break-words max-w-xs">
                  {row.item?.input
                    ? typeof row.item.input === "string"
                      ? row.item.input
                      : JSON.stringify(row.item.input)
                    : "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs whitespace-pre-wrap break-words max-w-xs">
                  {row.r.output === null
                    ? "—"
                    : typeof row.r.output === "string"
                      ? row.r.output
                      : JSON.stringify(row.r.output)}
                </td>
                <td className="px-4 py-3 text-xs text-[color:var(--color-text-dim)]">
                  {row.r.reason ?? "—"}
                </td>
              </tr>
            ))}
            {results.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[color:var(--color-text-dim)]">
                  No results.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: "emerald" | "red";
}) {
  const color = accent === "emerald" ? "text-emerald-300" : accent === "red" ? "text-red-300" : "";
  return (
    <div className="card p-5">
      <div className="text-xs uppercase tracking-wider text-[color:var(--color-text-faint)]">{label}</div>
      <div className={`text-3xl font-semibold mt-2 ${color}`}>{value}</div>
    </div>
  );
}
