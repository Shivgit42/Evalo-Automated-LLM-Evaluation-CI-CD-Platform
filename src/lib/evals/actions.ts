"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  datasetItems,
  datasets,
  evalDefinitions,
  projects,
} from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { runEval } from "@/lib/evals/runner";

async function ownedProject(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("unauthorized");
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.ownerId, session.user.id)),
  });
  if (!project) throw new Error("project_not_found");
  return project;
}

export async function uploadDatasetItemsAction(formData: FormData) {
  const projectId = String(formData.get("projectId"));
  const datasetId = String(formData.get("datasetId"));
  const jsonl = String(formData.get("jsonl") ?? "");
  await ownedProject(projectId);

  const lines = jsonl
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const rows: { input: unknown; expectedOutput: unknown; metadata?: unknown }[] = [];
  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      rows.push({
        input: obj.input ?? obj.prompt ?? obj.question ?? obj,
        expectedOutput: obj.expected_output ?? obj.expected ?? obj.answer ?? null,
        metadata: obj.metadata ?? null,
      });
    } catch {
      // skip
    }
  }

  if (rows.length === 0) return;

  await db.insert(datasetItems).values(
    rows.map((r) => ({
      datasetId,
      input: r.input as object,
      expectedOutput: (r.expectedOutput ?? null) as object | null,
      metadata: (r.metadata ?? null) as object | null,
    })),
  );

  // Recompute itemCount
  await db
    .update(datasets)
    .set({ itemCount: rows.length })
    .where(eq(datasets.id, datasetId));

  revalidatePath(`/app/${projectId}/datasets/${datasetId}`);
}

export async function createEvalDefinitionAction(formData: FormData) {
  const projectId = String(formData.get("projectId"));
  await ownedProject(projectId);

  const name = String(formData.get("name") ?? "Untitled eval");
  const kind = String(formData.get("kind") ?? "llm_judge") as
    | "exact_match"
    | "contains"
    | "json_match"
    | "llm_judge";
  const rubric = String(formData.get("rubric") ?? "");
  const field = String(formData.get("field") ?? "") || undefined;

  await db.insert(evalDefinitions).values({
    projectId,
    name,
    kind,
    config: { rubric, field },
  });

  revalidatePath(`/app/${projectId}/evals`);
}

export async function triggerEvalRunAction(formData: FormData) {
  const projectId = String(formData.get("projectId"));
  const datasetId = String(formData.get("datasetId"));
  const evalDefinitionId = String(formData.get("evalDefinitionId"));
  const systemPrompt = String(formData.get("systemPrompt") ?? "");
  const model = String(formData.get("model") ?? "gpt-4o-mini");
  await ownedProject(projectId);

  const runId = await runEval({
    projectId,
    datasetId,
    evalDefinitionId,
    model,
    systemPrompt: systemPrompt || undefined,
  });

  revalidatePath(`/app/${projectId}/evals`);
  redirect(`/app/${projectId}/evals/${runId}`);
}
