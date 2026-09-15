import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { datasets } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { createDatasetAction } from "@/lib/projects";
import { formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Datasets" };

export default async function DatasetsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const rows = await db
    .select()
    .from(datasets)
    .where(eq(datasets.projectId, projectId))
    .orderBy(desc(datasets.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Datasets</h1>
        <div className="text-sm text-[color:var(--color-text-dim)]">
          Test cases your evals will run against. Each row is an <code>{`{input, expected_output}`}</code> pair.
        </div>
      </div>

      <div className="card p-5">
        <form action={createDatasetAction} className="flex gap-3">
          <input type="hidden" name="projectId" value={projectId} />
          <input
            name="name"
            placeholder="Dataset name (e.g. customer-support-v1)"
            className="flex-1 bg-[color:var(--color-surface-2)] border border-[color:var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none"
            required
          />
          <button type="submit" className="btn btn-brand">
            Create dataset
          </button>
        </form>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {rows.map((d) => (
          <Link
            key={d.id}
            href={`/app/${projectId}/datasets/${d.id}`}
            className="card p-5 hover:border-[color:var(--color-brand)] transition-colors"
          >
            <div className="font-medium">{d.name}</div>
            <div className="text-xs text-[color:var(--color-text-faint)] mt-1">
              {d.itemCount} cases · created {formatRelative(d.createdAt)}
            </div>
          </Link>
        ))}
        {rows.length === 0 && (
          <div className="card p-8 text-sm text-[color:var(--color-text-dim)] text-center col-span-2">
            No datasets yet. Create one above.
          </div>
        )}
      </div>
    </div>
  );
}
