import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyApiKey } from "@/lib/api-keys";
import { db } from "@/lib/db";
import { traces, spans, projects } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

const PLAN_LIMITS: Record<string, number> = {
  free: 1000,
  pro: 100_000,
  team: 1_000_000,
};

const SpanSchema = z.object({
  name: z.string().min(1),
  kind: z.enum(["llm", "tool", "retrieval", "span"]).default("span"),
  parentSpanId: z.string().optional(),
  model: z.string().optional(),
  input: z.unknown().optional(),
  output: z.unknown().optional(),
  metadata: z.record(z.unknown()).optional(),
  tokensInput: z.number().int().nonnegative().optional(),
  tokensOutput: z.number().int().nonnegative().optional(),
  costUsd: z.number().nonnegative().optional(),
  latencyMs: z.number().int().nonnegative().optional(),
  startedAt: z.string().optional(),
  endedAt: z.string().optional(),
});

const TraceSchema = z.object({
  name: z.string().min(1),
  environment: z.string().default("production"),
  status: z.enum(["ok", "error"]).default("ok"),
  input: z.unknown().optional(),
  output: z.unknown().optional(),
  metadata: z.record(z.unknown()).optional(),
  error: z.string().optional(),
  durationMs: z.number().int().nonnegative().optional(),
  tokensInput: z.number().int().nonnegative().optional(),
  tokensOutput: z.number().int().nonnegative().optional(),
  costUsd: z.number().nonnegative().optional(),
  startedAt: z.string().optional(),
  endedAt: z.string().optional(),
  spans: z.array(SpanSchema).optional(),
});

function parseDate(s?: string) {
  if (!s) return undefined;
  const d = new Date(s);
  return isNaN(d.getTime()) ? undefined : d;
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const apiKey = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
  const verified = await verifyApiKey(apiKey);
  if (!verified) {
    return NextResponse.json({ error: "invalid_api_key" }, { status: 401 });
  }

  const limit = PLAN_LIMITS[verified.project.plan] ?? PLAN_LIMITS.free;
  if (verified.project.traceCount >= limit) {
    return NextResponse.json(
      { error: "quota_exceeded", limit, plan: verified.project.plan },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = TraceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const t = parsed.data;
  const [trace] = await db
    .insert(traces)
    .values({
      projectId: verified.project.id,
      name: t.name,
      environment: t.environment,
      status: t.status,
      input: t.input ?? null,
      output: t.output ?? null,
      metadata: t.metadata ?? null,
      error: t.error,
      durationMs: t.durationMs,
      tokensInput: t.tokensInput,
      tokensOutput: t.tokensOutput,
      costUsd: t.costUsd,
      startedAt: parseDate(t.startedAt) ?? new Date(),
      endedAt: parseDate(t.endedAt),
    })
    .returning();

  if (t.spans?.length) {
    await db.insert(spans).values(
      t.spans.map((s) => ({
        traceId: trace.id,
        name: s.name,
        kind: s.kind,
        parentSpanId: s.parentSpanId,
        model: s.model,
        input: s.input ?? null,
        output: s.output ?? null,
        metadata: s.metadata ?? null,
        tokensInput: s.tokensInput,
        tokensOutput: s.tokensOutput,
        costUsd: s.costUsd,
        latencyMs: s.latencyMs,
        startedAt: parseDate(s.startedAt) ?? new Date(),
        endedAt: parseDate(s.endedAt),
      })),
    );
  }

  await db
    .update(projects)
    .set({ traceCount: sql`${projects.traceCount} + 1` })
    .where(eq(projects.id, verified.project.id));

  return NextResponse.json({ id: trace.id }, { status: 201 });
}

export async function GET() {
  return NextResponse.json({
    message: "Evalo trace API. POST /api/v1/traces with Bearer EVALO_API_KEY.",
  });
}
