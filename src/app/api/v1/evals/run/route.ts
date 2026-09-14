import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyApiKey } from "@/lib/api-keys";
import { db } from "@/lib/db";
import { datasets, evalDefinitions } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { runEval } from "@/lib/evals/runner";

export const maxDuration = 300;

const Body = z.object({
  datasetId: z.string(),
  evalDefinitionId: z.string(),
  model: z.string().optional(),
  systemPrompt: z.string().optional(),
  outputs: z.record(z.unknown()).optional(),
  commitSha: z.string().optional(),
  prNumber: z.number().int().optional(),
  repoFullName: z.string().optional(),
  targetBranch: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const apiKey = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
  const verified = await verifyApiKey(apiKey);
  if (!verified) return NextResponse.json({ error: "invalid_api_key" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const ds = await db.query.datasets.findFirst({
    where: and(
      eq(datasets.id, parsed.data.datasetId),
      eq(datasets.projectId, verified.project.id),
    ),
  });
  if (!ds) return NextResponse.json({ error: "dataset_not_found" }, { status: 404 });

  const def = await db.query.evalDefinitions.findFirst({
    where: and(
      eq(evalDefinitions.id, parsed.data.evalDefinitionId),
      eq(evalDefinitions.projectId, verified.project.id),
    ),
  });
  if (!def) return NextResponse.json({ error: "eval_not_found" }, { status: 404 });

  try {
    const runId = await runEval({
      projectId: verified.project.id,
      datasetId: parsed.data.datasetId,
      evalDefinitionId: parsed.data.evalDefinitionId,
      model: parsed.data.model,
      systemPrompt: parsed.data.systemPrompt,
      outputs: parsed.data.outputs,
      commitSha: parsed.data.commitSha,
      prNumber: parsed.data.prNumber,
      repoFullName: parsed.data.repoFullName,
      targetBranch: parsed.data.targetBranch,
    });
    return NextResponse.json({ runId }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: "run_failed", message: (e as Error).message },
      { status: 500 },
    );
  }
}
