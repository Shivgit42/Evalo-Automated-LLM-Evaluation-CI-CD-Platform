import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { datasets, evalDefinitions, evalRuns } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  createEvalDefinitionAction,
  triggerEvalRunAction,
} from "@/lib/evals/actions";
import { formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Eval Runs" };

export default async function EvalsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const [defs, dss, runs] = await Promise.all([
    db
      .select()
      .from(evalDefinitions)
      .where(eq(evalDefinitions.projectId, projectId))
      .orderBy(desc(evalDefinitions.createdAt)),
    db
      .select()
      .from(datasets)
      .where(eq(datasets.projectId, projectId))
      .orderBy(desc(datasets.createdAt)),
    db
      .select()
      .from(evalRuns)
      .where(eq(evalRuns.projectId, projectId))
      .orderBy(desc(evalRuns.createdAt))
      .limit(50),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Eval runs</h1>
        <div className="text-sm text-[color:var(--color-text-dim)]">
          Run an eval definition against a dataset. Triggers run synchronously and stream results
          to the run detail page.
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="card p-5">
          <div className="font-medium mb-3">Trigger a run</div>
          {defs.length === 0 || dss.length === 0 ? (
            <div className="text-sm text-[color:var(--color-text-dim)]">
              {defs.length === 0 && <>You need an eval definition first.</>}
              {dss.length === 0 && <> You need a dataset first.</>}
            </div>
          ) : (
            <form action={triggerEvalRunAction} className="space-y-3 text-sm">
              <input type="hidden" name="projectId" value={projectId} />
              <Field label="Dataset">
                <select
                  name="datasetId"
                  className="w-full bg-[color:var(--color-surface-2)] border border-[color:var(--color-border)] rounded-lg px-3 py-2 text-sm"
                  required
                >
                  {dss.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.itemCount})
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Eval definition">
                <select
                  name="evalDefinitionId"
                  className="w-full bg-[color:var(--color-surface-2)] border border-[color:var(--color-border)] rounded-lg px-3 py-2 text-sm"
                  required
                >
                  {defs.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.kind})
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Model under test">
                <select
                  name="model"
                  className="w-full bg-[color:var(--color-surface-2)] border border-[color:var(--color-border)] rounded-lg px-3 py-2 text-sm"
                >
                  <option value="gpt-4o-mini">gpt-4o-mini</option>
                  <option value="gpt-4o">gpt-4o</option>
                  <option value="gpt-4.1-mini">gpt-4.1-mini</option>
                </select>
              </Field>
              <Field label="System prompt (optional)">
                <textarea
                  name="systemPrompt"
                  rows={3}
                  placeholder="You are a helpful customer support agent…"
                  className="w-full bg-[color:var(--color-surface-2)] border border-[color:var(--color-border)] rounded-lg px-3 py-2 text-xs font-mono"
                />
              </Field>
              <button type="submit" className="btn btn-brand text-sm">
                Run evals
              </button>
            </form>
          )}
        </section>

        <section className="card p-5">
          <div className="font-medium mb-3">New eval definition</div>
          <form action={createEvalDefinitionAction} className="space-y-3 text-sm">
            <input type="hidden" name="projectId" value={projectId} />
            <Field label="Name">
              <input
                name="name"
                required
                className="w-full bg-[color:var(--color-surface-2)] border border-[color:var(--color-border)] rounded-lg px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Kind">
              <select
                name="kind"
                className="w-full bg-[color:var(--color-surface-2)] border border-[color:var(--color-border)] rounded-lg px-3 py-2 text-sm"
              >
                <option value="llm_judge">LLM-as-judge</option>
                <option value="exact_match">Exact match</option>
                <option value="contains">Contains</option>
                <option value="json_match">JSON match</option>
              </select>
            </Field>
            <Field label="Rubric (for LLM-judge)">
              <textarea
                name="rubric"
                rows={4}
                placeholder="Score 1 if the response is helpful, factual, and on-policy. Otherwise 0."
                className="w-full bg-[color:var(--color-surface-2)] border border-[color:var(--color-border)] rounded-lg px-3 py-2 text-xs font-mono"
              />
            </Field>
            <button type="submit" className="btn btn-secondary text-sm">
              Add definition
            </button>
          </form>
        </section>
      </div>

      <section>
        <h2 className="font-medium mb-3">Recent runs</h2>
        <div className="card overflow-hidden">
          {runs.length === 0 ? (
            <div className="p-8 text-sm text-[color:var(--color-text-dim)] text-center">
              No runs yet.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-[color:var(--color-text-faint)] border-b border-[color:var(--color-border)]">
                <tr>
                  <th className="text-left px-4 py-3">When</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Pass rate</th>
                  <th className="text-left px-4 py-3">Cases</th>
                  <th className="text-left px-4 py-3">PR</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.id} className="border-b border-[color:var(--color-border)] hover:bg-[color:var(--color-surface-2)]">
                    <td className="px-4 py-3">
                      <Link
                        href={`/app/${projectId}/evals/${r.id}`}
                        className="text-[color:var(--color-brand)] hover:underline"
                      >
                        {formatRelative(r.createdAt)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
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
                    </td>
                    <td className="px-4 py-3">{Math.round(r.passRate * 100)}%</td>
                    <td className="px-4 py-3 text-[color:var(--color-text-dim)]">{r.total}</td>
                    <td className="px-4 py-3 text-[color:var(--color-text-dim)]">
                      {r.prNumber ? `#${r.prNumber}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs text-[color:var(--color-text-dim)] mb-1">{label}</div>
      {children}
    </label>
  );
}
