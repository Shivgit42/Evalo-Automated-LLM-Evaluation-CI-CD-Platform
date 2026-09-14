import { db } from "@/lib/db";
import { apiKeys } from "@/lib/db/schema";
import { eq, desc, and, isNull } from "drizzle-orm";
import { createApiKeyAction, revokeApiKeyAction } from "@/lib/projects";
import { formatRelative } from "@/lib/utils";

export default async function SettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ newKey?: string }>;
}) {
  const { projectId } = await params;
  const { newKey } = await searchParams;

  const keys = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.projectId, projectId), isNull(apiKeys.revokedAt)))
    .orderBy(desc(apiKeys.createdAt));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <div className="text-sm text-[color:var(--color-text-dim)]">
          Manage API keys and integrations.
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">API keys</h2>
          <form action={createApiKeyAction} className="flex gap-2">
            <input type="hidden" name="projectId" value={projectId} />
            <input
              name="name"
              placeholder="Key name"
              defaultValue="New key"
              className="bg-[color:var(--color-surface-2)] border border-[color:var(--color-border)] rounded-lg px-3 py-1.5 text-sm focus:outline-none"
            />
            <button type="submit" className="btn btn-brand text-sm">
              Generate key
            </button>
          </form>
        </div>

        {newKey && (
          <div className="card p-5 border-emerald-500/30 bg-emerald-500/5">
            <div className="font-medium text-emerald-300">New API key — copy now</div>
            <div className="text-xs text-[color:var(--color-text-dim)] mt-1">
              This is shown once. Store as <code>EVALO_API_KEY</code>.
            </div>
            <pre className="mt-3 text-sm select-all">{newKey}</pre>
          </div>
        )}

        <div className="card divide-y divide-[color:var(--color-border)]">
          {keys.length === 0 ? (
            <div className="p-6 text-sm text-[color:var(--color-text-dim)] text-center">
              No active keys.
            </div>
          ) : (
            keys.map((k) => (
              <div key={k.id} className="flex items-center justify-between p-4 text-sm">
                <div>
                  <div className="font-medium">{k.name}</div>
                  <div className="text-xs text-[color:var(--color-text-faint)] font-mono">
                    {k.prefix}…
                  </div>
                  <div className="text-xs text-[color:var(--color-text-faint)] mt-1">
                    Created {formatRelative(k.createdAt)}
                    {k.lastUsedAt ? ` · last used ${formatRelative(k.lastUsedAt)}` : " · never used"}
                  </div>
                </div>
                <form action={revokeApiKeyAction}>
                  <input type="hidden" name="keyId" value={k.id} />
                  <input type="hidden" name="projectId" value={projectId} />
                  <button
                    type="submit"
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Revoke
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">GitHub integration</h2>
        <div className="card p-5 flex items-center justify-between">
          <div>
            <div className="font-medium">Install Evalo GitHub App</div>
            <div className="text-sm text-[color:var(--color-text-dim)] mt-1">
              Auto-run evals on every PR that touches your prompts.
            </div>
          </div>
          <a
            href={process.env.NEXT_PUBLIC_GITHUB_APP_URL ?? "#"}
            className="btn btn-secondary text-sm"
          >
            Install →
          </a>
        </div>
      </section>
    </div>
  );
}
