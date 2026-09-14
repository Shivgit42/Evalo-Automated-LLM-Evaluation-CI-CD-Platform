"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects, apiKeys, datasets, evalDefinitions } from "@/lib/db/schema";
import { generateApiKey, hashKey } from "@/lib/api-keys";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40) || "project";
}

export async function createProjectAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("unauthorized");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("name required");

  let slug = slugify(name);
  let suffix = 0;
  while (true) {
    const exists = await db.query.projects.findFirst({
      where: and(eq(projects.ownerId, session.user.id), eq(projects.slug, slug)),
    });
    if (!exists) break;
    suffix += 1;
    slug = `${slugify(name)}-${suffix}`;
  }

  const [project] = await db
    .insert(projects)
    .values({ ownerId: session.user.id, name, slug })
    .returning();

  // Seed one default API key + a starter eval definition
  const { full, prefix } = generateApiKey();
  await db.insert(apiKeys).values({
    projectId: project.id,
    name: "Default key",
    prefix,
    hashedKey: await hashKey(full),
  });

  await db.insert(evalDefinitions).values({
    projectId: project.id,
    name: "LLM judge — helpful & correct",
    kind: "llm_judge",
    config: {
      rubric:
        "Score 1 if the output is helpful, factually correct, and matches expected_output in meaning. Otherwise 0.",
      threshold: 1,
    },
  });

  revalidatePath("/app");
  redirect(`/app/${project.id}?newKey=${encodeURIComponent(full)}`);
}

export async function createApiKeyAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("unauthorized");

  const projectId = String(formData.get("projectId") ?? "");
  const name = String(formData.get("name") ?? "Key");

  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.ownerId, session.user.id)),
  });
  if (!project) throw new Error("project not found");

  const { full, prefix } = generateApiKey();
  await db.insert(apiKeys).values({
    projectId,
    name,
    prefix,
    hashedKey: await hashKey(full),
  });

  revalidatePath(`/app/${projectId}/settings`);
  redirect(`/app/${projectId}/settings?newKey=${encodeURIComponent(full)}`);
}

export async function revokeApiKeyAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("unauthorized");

  const keyId = String(formData.get("keyId") ?? "");
  const projectId = String(formData.get("projectId") ?? "");

  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.ownerId, session.user.id)),
  });
  if (!project) throw new Error("project not found");

  await db
    .update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.projectId, projectId)));

  revalidatePath(`/app/${projectId}/settings`);
}

export async function createDatasetAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("unauthorized");

  const projectId = String(formData.get("projectId") ?? "");
  const name = String(formData.get("name") ?? "").trim() || "Untitled dataset";

  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.ownerId, session.user.id)),
  });
  if (!project) throw new Error("project not found");

  const [ds] = await db
    .insert(datasets)
    .values({ projectId, name })
    .returning();

  revalidatePath(`/app/${projectId}/datasets`);
  redirect(`/app/${projectId}/datasets/${ds.id}`);
}
