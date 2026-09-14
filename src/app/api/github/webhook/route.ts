import { NextRequest, NextResponse, after } from "next/server";
import { db } from "@/lib/db";
import { evalRuns, githubInstallations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyWebhookSignature, postCheckRun, commentOnPr } from "@/lib/github";
import { runEval } from "@/lib/evals/runner";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

interface PrWebhookPayload {
  action: string;
  installation?: { id: number };
  repository: { full_name: string };
  pull_request: {
    number: number;
    head: { sha: string };
    base: { ref: string };
  };
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get("x-hub-signature-256");
  const secret = process.env.GITHUB_APP_WEBHOOK_SECRET ?? "";
  if (!secret || !verifyWebhookSignature(raw, sig, secret)) {
    return NextResponse.json({ error: "bad_signature" }, { status: 401 });
  }
  const event = req.headers.get("x-github-event");

  if (event !== "pull_request") return NextResponse.json({ ok: true, skipped: event });

  const payload = JSON.parse(raw) as PrWebhookPayload;
  if (!["opened", "synchronize", "reopened"].includes(payload.action)) {
    return NextResponse.json({ ok: true, skipped: payload.action });
  }

  const installationId = payload.installation?.id;
  const repoFullName = payload.repository.full_name;
  if (!installationId) return NextResponse.json({ ok: true });

  const install = await db.query.githubInstallations.findFirst({
    where: eq(githubInstallations.installationId, installationId),
  });
  if (
    !install ||
    install.repoFullName !== repoFullName ||
    !install.datasetId ||
    !install.evalDefinitionId
  ) {
    return NextResponse.json({ ok: true, skipped: "no_config" });
  }

  const headSha = payload.pull_request.head.sha;
  const prNumber = payload.pull_request.number;
  const targetBranch = payload.pull_request.base.ref;
  const projectId = install.projectId;
  const datasetId = install.datasetId;
  const evalDefinitionId = install.evalDefinitionId;
  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";

  // Execute in background using Next.js after() to prevent Vercel container termination
  after(async () => {
    try {
      const runId = await runEval({
        projectId,
        datasetId,
        evalDefinitionId,
        commitSha: headSha,
        prNumber,
        repoFullName,
        targetBranch,
      });
      const run = await db.query.evalRuns.findFirst({ where: eq(evalRuns.id, runId) });
      if (!run) return;
      const pct = Math.round(run.passRate * 100);
      const conclusion: "success" | "neutral" | "failure" =
        pct >= 90 ? "success" : pct >= 70 ? "neutral" : "failure";
      const detailsUrl = `${baseUrl}/app/${projectId}/evals/${runId}`;

      await postCheckRun({
        installationId,
        repoFullName,
        headSha,
        conclusion,
        title: `${pct}% pass · ${run.passed}/${run.total} cases`,
        summary: `Eval run complete on **${repoFullName}@${headSha.slice(0, 7)}**.\n\n**Pass rate:** ${pct}% (${run.passed}/${run.total})\n\n[View full run →](${detailsUrl})`,
        detailsUrl,
      });

      const emoji = conclusion === "success" ? "✅" : conclusion === "neutral" ? "⚠️" : "❌";
      await commentOnPr({
        installationId,
        repoFullName,
        prNumber,
        body: `${emoji} **Evalo quality check:** ${pct}% pass (${run.passed}/${run.total})\n\n[View run details →](${detailsUrl})`,
      });
    } catch (e) {
      console.error("[evalo] eval run failed", e);
    }
  });

  return NextResponse.json({ ok: true });
}
