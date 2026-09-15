import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { traces } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Traces" };


export default async function TracesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const rows = await db
    .select()
    .from(traces)
    .where(eq(traces.projectId, projectId))
    .orderBy(desc(traces.createdAt))
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Traces</h1>
        <div className="text-sm text-[color:var(--color-text-dim)]">
          Production runs of your AI features. Drill in to inspect inputs, outputs, and span timing.
        </div>
      </div>

      <div className="card overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-10 text-center">
            <div className="font-medium">No traces yet</div>
            <div className="text-sm text-[color:var(--color-text-dim)] mt-2">
              Send your first trace with{" "}
              <code className="text-[color:var(--color-brand)]">POST /api/v1/traces</code>. See{" "}
              <Link href={`/app/${projectId}/settings`} className="text-[color:var(--color-brand)]">
                Settings
              </Link>{" "}
              for your API key.
            </div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-[color:var(--color-text-faint)] border-b border-[color:var(--color-border)]">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Env</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Latency</th>
                <th className="text-left px-4 py-3">Tokens</th>
                <th className="text-left px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-[color:var(--color-border)] hover:bg-[color:var(--color-surface-2)]"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/app/${projectId}/traces/${t.id}`}
                      className="font-medium text-[color:var(--color-brand)] hover:underline"
                    >
                      {t.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[color:var(--color-text-dim)]">{t.environment}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${t.status === "ok" ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[color:var(--color-text-dim)]">
                    {t.durationMs ? `${t.durationMs}ms` : "—"}
                  </td>
                  <td className="px-4 py-3 text-[color:var(--color-text-dim)]">
                    {(t.tokensInput ?? 0) + (t.tokensOutput ?? 0) || "—"}
                  </td>
                  <td className="px-4 py-3 text-[color:var(--color-text-faint)]">
                    {formatRelative(t.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
