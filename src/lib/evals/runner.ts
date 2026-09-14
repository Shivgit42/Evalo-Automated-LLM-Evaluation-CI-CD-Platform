import OpenAI from "openai";
import { db } from "@/lib/db";
import {
  datasetItems,
  evalDefinitions,
  evalResults,
  evalRuns,
  datasets,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type EvalKind = "exact_match" | "contains" | "json_match" | "llm_judge";

interface EvalConfig {
  rubric?: string;
  threshold?: number;
  field?: string;
}

function pickField(obj: unknown, field?: string): unknown {
  if (!field) return obj;
  if (obj && typeof obj === "object") {
    const segs = field.split(".");
    let cur: unknown = obj;
    for (const s of segs) {
      if (cur && typeof cur === "object" && s in (cur as Record<string, unknown>)) {
        cur = (cur as Record<string, unknown>)[s];
      } else return undefined;
    }
    return cur;
  }
  return undefined;
}

function toStr(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  return JSON.stringify(v);
}

async function judgeWithLlm(
  rubric: string,
  input: unknown,
  expected: unknown,
  output: unknown,
): Promise<{ passed: boolean; score: number; reason: string }> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const system = `You are an LLM-as-judge evaluator. Apply the rubric strictly. Respond with JSON only: {"score": 0|1, "reason": "..."}.`;
  const user = `Rubric:
${rubric}

Input:
${toStr(input)}

Expected output (may be partial or absent):
${toStr(expected)}

Actual output:
${toStr(output)}

Return JSON only.`;

  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0,
  });

  const raw = resp.choices[0]?.message?.content ?? "{}";
  let parsed: { score?: number; reason?: string };
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = {};
  }
  const score = Number(parsed.score) || 0;
  return {
    passed: score >= 1,
    score,
    reason: parsed.reason ?? "no reason",
  };
}

function evaluate(
  kind: EvalKind,
  cfg: EvalConfig,
  expected: unknown,
  output: unknown,
): { passed: boolean; score: number; reason: string } {
  const e = pickField(expected, cfg.field);
  const o = pickField(output, cfg.field);
  switch (kind) {
    case "exact_match": {
      const ok = toStr(e) === toStr(o);
      return { passed: ok, score: ok ? 1 : 0, reason: ok ? "exact match" : "mismatch" };
    }
    case "contains": {
      const target = toStr(e);
      const got = toStr(o);
      const ok = got.toLowerCase().includes(target.toLowerCase()) && target.length > 0;
      return { passed: ok, score: ok ? 1 : 0, reason: ok ? "found substring" : "missing substring" };
    }
    case "json_match": {
      try {
        const a = typeof e === "string" ? JSON.parse(e) : e;
        const b = typeof o === "string" ? JSON.parse(o) : o;
        const ok = JSON.stringify(a) === JSON.stringify(b);
        return { passed: ok, score: ok ? 1 : 0, reason: ok ? "json equal" : "json differs" };
      } catch {
        return { passed: false, score: 0, reason: "invalid json" };
      }
    }
    default:
      return { passed: false, score: 0, reason: "unsupported sync kind" };
  }
}

export interface RunOptions {
  projectId: string;
  datasetId: string;
  evalDefinitionId: string;
  /** if provided, used instead of dataset item input → output. Map: itemId -> output */
  outputs?: Record<string, unknown>;
  /** if no outputs map, call this model to produce them */
  model?: string;
  systemPrompt?: string;
  commitSha?: string;
  prNumber?: number;
  repoFullName?: string;
  targetBranch?: string;
}

export async function runEval(opts: RunOptions): Promise<string> {
  const [run] = await db
    .insert(evalRuns)
    .values({
      projectId: opts.projectId,
      datasetId: opts.datasetId,
      evalDefinitionId: opts.evalDefinitionId,
      status: "running",
      model: opts.model ?? "gpt-4o-mini",
      commitSha: opts.commitSha,
      prNumber: opts.prNumber,
      repoFullName: opts.repoFullName,
      targetBranch: opts.targetBranch,
      startedAt: new Date(),
    })
    .returning();

  try {
    const def = await db.query.evalDefinitions.findFirst({
      where: eq(evalDefinitions.id, opts.evalDefinitionId),
    });
    if (!def) throw new Error("eval definition not found");
    const cfg = (def.config ?? {}) as EvalConfig;

    const items = await db
      .select()
      .from(datasetItems)
      .where(eq(datasetItems.datasetId, opts.datasetId));

    const openai = opts.outputs ? null : new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Bounded concurrent execution (max 4 parallel calls) with per-item fault tolerance
    const CONCURRENCY_LIMIT = 4;
    const worker = async (item: typeof items[number]) => {
      const start = Date.now();
      try {
        let output: unknown;
        if (opts.outputs && opts.outputs[item.id] !== undefined) {
          output = opts.outputs[item.id];
        } else if (openai) {
          // Generate output for this case via configured model
          const inputStr = toStr(item.input);
          const resp = await openai.chat.completions.create({
            model: opts.model ?? "gpt-4o-mini",
            messages: [
              ...(opts.systemPrompt
                ? [{ role: "system" as const, content: opts.systemPrompt }]
                : []),
              { role: "user", content: inputStr },
            ],
            temperature: 0,
          });
          output = resp.choices[0]?.message?.content ?? "";
        } else {
          output = null;
        }
        const latencyMs = Date.now() - start;

        let result: { passed: boolean; score: number; reason: string };
        if (def.kind === "llm_judge") {
          result = await judgeWithLlm(
            cfg.rubric ?? "Output should be correct and helpful.",
            item.input,
            item.expectedOutput,
            output,
          );
        } else {
          result = evaluate(def.kind, cfg, item.expectedOutput, output);
        }

        return {
          evalRunId: run.id,
          datasetItemId: item.id,
          output: output as object | null,
          passed: result.passed,
          score: result.score,
          reason: result.reason,
          latencyMs,
        };
      } catch (itemErr) {
        return {
          evalRunId: run.id,
          datasetItemId: item.id,
          output: null,
          passed: false,
          score: 0,
          reason: `Evaluation failed: ${(itemErr as Error).message || "unknown error"}`,
          latencyMs: Date.now() - start,
        };
      }
    };

    const results: (typeof evalResults.$inferInsert)[] = [];
    for (let i = 0; i < items.length; i += CONCURRENCY_LIMIT) {
      const batch = items.slice(i, i + CONCURRENCY_LIMIT);
      const batchResults = await Promise.all(batch.map(worker));
      results.push(...batchResults);
    }

    const passed = results.filter((r) => r.passed).length;
    const failed = results.length - passed;

    if (results.length) await db.insert(evalResults).values(results);

    const total = items.length;
    const passRate = total === 0 ? 0 : passed / total;
    await db
      .update(evalRuns)
      .set({
        status: "succeeded",
        total,
        passed,
        failed,
        passRate,
        finishedAt: new Date(),
      })
      .where(eq(evalRuns.id, run.id));

    // bump dataset item count to ensure consistency
    await db
      .update(datasets)
      .set({ itemCount: total })
      .where(eq(datasets.id, opts.datasetId));

    return run.id;
  } catch (err) {
    await db
      .update(evalRuns)
      .set({
        status: "failed",
        errorMessage: (err as Error).message,
        finishedAt: new Date(),
      })
      .where(eq(evalRuns.id, run.id));
    throw err;
  }
}
