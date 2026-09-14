import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { datasetItems, datasets } from "@/lib/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { uploadDatasetItemsAction } from "@/lib/evals/actions";

export default async function DatasetDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; datasetId: string }>;
}) {
  const { projectId, datasetId } = await params;
  const ds = await db.query.datasets.findFirst({
    where: and(eq(datasets.id, datasetId), eq(datasets.projectId, projectId)),
  });
  if (!ds) notFound();

  const items = await db
    .select()
    .from(datasetItems)
    .where(eq(datasetItems.datasetId, datasetId))
    .orderBy(desc(datasetItems.createdAt))
    .limit(200);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{ds.name}</h1>
        <div className="text-sm text-[color:var(--color-text-dim)]">
          {ds.itemCount} cases
        </div>
      </div>

      <details className="card p-5" open={items.length === 0}>
        <summary className="cursor-pointer font-medium">Upload JSONL</summary>
        <form action={uploadDatasetItemsAction} className="mt-4 space-y-3">
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="datasetId" value={datasetId} />
          <div className="text-xs text-[color:var(--color-text-dim)]">
            One JSON object per line. Recognized fields: <code>input</code>, <code>expected_output</code>, <code>metadata</code>.
          </div>
          <textarea
            name="jsonl"
            rows={10}
            placeholder={`{"input":"refund my order #1234","expected_output":"Initiate refund and confirm to customer."}
{"input":"is bitcoin a security?","expected_output":"Politely decline; out of scope."}`}
            className="w-full bg-[color:var(--color-surface-2)] border border-[color:var(--color-border)] rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
            required
          />
          <button type="submit" className="btn btn-brand text-sm">
            Replace dataset items
          </button>
        </form>
      </details>

      <div className="card overflow-hidden">
        {items.length === 0 ? (
          <div className="p-10 text-center text-sm text-[color:var(--color-text-dim)]">
            No items yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-[color:var(--color-text-faint)] border-b border-[color:var(--color-border)]">
              <tr>
                <th className="text-left px-4 py-3 w-1/2">Input</th>
                <th className="text-left px-4 py-3 w-1/2">Expected output</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr
                  key={it.id}
                  className="border-b border-[color:var(--color-border)] align-top"
                >
                  <td className="px-4 py-3 font-mono text-xs whitespace-pre-wrap break-words">
                    {typeof it.input === "string" ? it.input : JSON.stringify(it.input, null, 2)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs whitespace-pre-wrap break-words">
                    {it.expectedOutput === null
                      ? "—"
                      : typeof it.expectedOutput === "string"
                        ? it.expectedOutput
                        : JSON.stringify(it.expectedOutput, null, 2)}
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
