import { randomBytes, createHash } from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { apiKeys, projects } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";

const PREFIX = "evk_live_";

export function generateApiKey() {
  const raw = randomBytes(24).toString("base64url");
  const full = `${PREFIX}${raw}`;
  const prefix = full.slice(0, PREFIX.length + 6); // shown in UI
  return { full, prefix };
}

export async function hashKey(full: string) {
  return bcrypt.hash(full, 10);
}

// Fast lookup: we store sha256(full) as a lookup index in hashed_key column? No — we use bcrypt.
// To avoid scanning all keys, we narrow by prefix then bcrypt-compare.
export async function verifyApiKey(full: string) {
  if (!full?.startsWith(PREFIX)) return null;
  const prefix = full.slice(0, PREFIX.length + 6);

  const candidates = await db
    .select({
      id: apiKeys.id,
      projectId: apiKeys.projectId,
      hashedKey: apiKeys.hashedKey,
    })
    .from(apiKeys)
    .where(and(eq(apiKeys.prefix, prefix), isNull(apiKeys.revokedAt)));

  for (const c of candidates) {
    if (await bcrypt.compare(full, c.hashedKey)) {
      const project = await db.query.projects.findFirst({
        where: eq(projects.id, c.projectId),
      });
      if (!project) return null;
      // fire-and-forget last-used update
      db.update(apiKeys)
        .set({ lastUsedAt: new Date() })
        .where(eq(apiKeys.id, c.id))
        .catch(() => {});
      return { apiKeyId: c.id, project };
    }
  }
  return null;
}

export function sha256(s: string) {
  return createHash("sha256").update(s).digest("hex");
}
