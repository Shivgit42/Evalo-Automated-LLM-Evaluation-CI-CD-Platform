import type { Metadata } from "next";
import { db } from "@/lib/db";
import { apiKeys, projects, githubInstallations } from "@/lib/db/schema";
import { eq, desc, and, isNull } from "drizzle-orm";
import { createApiKeyAction, revokeApiKeyAction } from "@/lib/projects";
import { formatRelative } from "@/lib/utils";
import { BillingSection } from "@/components/app/BillingSection";
import { stripe, PRICE_TO_PLAN } from "@/lib/stripe";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ newKey?: string; billing?: string; gh?: string }>;
}) {
  const { projectId } = await params;
  const { newKey, billing, gh } = await searchParams;

  const keys = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.projectId, projectId), isNull(apiKeys.revokedAt)))
    .orderBy(desc(apiKeys.createdAt));

  const installations = await db
    .select()
    .from(githubInstallations)
    .where(eq(githubInstallations.projectId, projectId));

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  // Sync subscription from Stripe if returning from checkout or if plan is free but active on Stripe
  if (project?.stripeCustomerId && (billing === "success" || project.plan === "free")) {
    try {
      const subs = await stripe.subscriptions.list({
        customer: project.stripeCustomerId,
        status: "active",
        limit: 1,
      });
      if (subs.data.length > 0) {
        const sub = subs.data[0];
        const priceId = sub.items.data[0]?.price.id;
        const plan = priceId ? PRICE_TO_PLAN[priceId] ?? "pro" : "pro";
        if (project.plan !== plan || project.stripeSubscriptionId !== sub.id) {
          await db
            .update(projects)
            .set({
              stripeSubscriptionId: sub.id,
              plan,
            })
            .where(eq(projects.id, projectId));
          project.plan = plan;
          project.stripeSubscriptionId = sub.id;
        }
      }
    } catch (e) {
      console.error("[evalo] Failed to sync Stripe subscription:", e);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <div className="text-sm text-[color:var(--color-text-dim)]">
          Manage API keys, subscription billing, and integrations.
        </div>
      </div>

      {billing === "success" && (
        <div className="card p-4 border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-medium">
          🎉 Congratulations! Your subscription to the Pro plan is now active.
        </div>
      )}

      <BillingSection
        projectId={projectId}
        plan={project?.plan ?? "free"}
        traceCount={project?.traceCount ?? 0}
      />

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

        {gh === "connected" && (
          <div className="card p-4 border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm font-medium">
            ✓ Evalo GitHub App installed successfully! Your repository is now linked.
          </div>
        )}

        {installations.length === 0 ? (
          <div className="card p-5 flex items-center justify-between">
            <div>
              <div className="font-medium">Install Evalo GitHub App</div>
              <div className="text-sm text-[color:var(--color-text-dim)] mt-1">
                Auto-run evals on every PR that touches your prompts.
              </div>
            </div>
            <a
              href={`https://github.com/apps/${process.env.NEXT_PUBLIC_GITHUB_APP_SLUG || "evalo-ai"}/installations/new?state=${projectId}`}
              className="btn btn-brand text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              Install →
            </a>
          </div>
        ) : (
          <div className="card divide-y divide-[color:var(--color-border)]">
            {installations.map((inst) => (
              <div key={inst.id} className="p-5 flex items-center justify-between">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    <span className="text-emerald-400">●</span>
                    <span className="font-mono text-sm">{inst.repoFullName}</span>
                  </div>
                  <div className="text-xs text-[color:var(--color-text-dim)] mt-1">
                    PR checks active. Every PR opened on this repo will trigger an eval run.
                  </div>
                </div>
                <a
                  href={`https://github.com/apps/${process.env.NEXT_PUBLIC_GITHUB_APP_SLUG || "evalo-ai"}/installations/new?state=${projectId}`}
                  className="btn btn-secondary text-xs"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Configure on GitHub →
                </a>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
