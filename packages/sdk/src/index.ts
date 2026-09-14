/**
 * @evalo/sdk — Send traces and trigger evals from your app.
 *
 *   import { Evalo } from "@evalo/sdk";
 *   const evalo = new Evalo({ apiKey: process.env.EVALO_API_KEY! });
 *   const t = evalo.trace({ name: "summarize" });
 *   const out = await openai.chat.completions.create({ ... });
 *   await t.end({ output: out });
 */

export interface EvaloOptions {
  apiKey: string;
  baseUrl?: string;
  fetch?: typeof fetch;
}

export interface TraceInit {
  name: string;
  environment?: string;
  input?: unknown;
  metadata?: Record<string, unknown>;
}

export interface SpanInit {
  name: string;
  kind?: "llm" | "tool" | "retrieval" | "span";
  parentSpanId?: string;
  model?: string;
  input?: unknown;
  metadata?: Record<string, unknown>;
}

interface SpanRecord extends SpanInit {
  startedAt: number;
  endedAt?: number;
  output?: unknown;
  tokensInput?: number;
  tokensOutput?: number;
  costUsd?: number;
}

export class Evalo {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(opts: EvaloOptions) {
    this.apiKey = opts.apiKey;
    this.baseUrl = (opts.baseUrl ?? "https://evalo.dev").replace(/\/$/, "");
    this.fetchImpl = opts.fetch ?? fetch;
  }

  trace(init: TraceInit) {
    return new Trace(this, init);
  }

  async sendTrace(payload: unknown): Promise<{ id: string }> {
    const res = await this.fetchImpl(`${this.baseUrl}/api/v1/traces`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`evalo: ${res.status} ${await res.text().catch(() => "")}`);
    }
    return res.json() as Promise<{ id: string }>;
  }

  async runEval(params: {
    datasetId: string;
    evalDefinitionId: string;
    model?: string;
    systemPrompt?: string;
    outputs?: Record<string, unknown>;
    commitSha?: string;
    prNumber?: number;
    repoFullName?: string;
    targetBranch?: string;
  }): Promise<{ runId: string }> {
    const res = await this.fetchImpl(`${this.baseUrl}/api/v1/evals/run`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      throw new Error(`evalo: ${res.status} ${await res.text().catch(() => "")}`);
    }
    return res.json() as Promise<{ runId: string }>;
  }
}

export class Trace {
  private readonly client: Evalo;
  private readonly init: TraceInit;
  private readonly startedAt: number;
  private readonly spans: SpanRecord[] = [];
  private nextId = 0;

  constructor(client: Evalo, init: TraceInit) {
    this.client = client;
    this.init = init;
    this.startedAt = Date.now();
  }

  span(init: SpanInit) {
    const rec: SpanRecord = { ...init, startedAt: Date.now() };
    this.spans.push(rec);
    const localId = `s${this.nextId++}`;
    return {
      id: localId,
      end(opts?: { output?: unknown; tokensInput?: number; tokensOutput?: number; costUsd?: number }) {
        rec.endedAt = Date.now();
        if (opts) Object.assign(rec, opts);
      },
    };
  }

  async end(opts?: {
    output?: unknown;
    status?: "ok" | "error";
    error?: string;
    tokensInput?: number;
    tokensOutput?: number;
    costUsd?: number;
  }) {
    const endedAt = Date.now();
    const durationMs = endedAt - this.startedAt;
    return this.client.sendTrace({
      name: this.init.name,
      environment: this.init.environment ?? process.env.NODE_ENV ?? "production",
      status: opts?.status ?? (opts?.error ? "error" : "ok"),
      input: this.init.input,
      output: opts?.output,
      error: opts?.error,
      metadata: this.init.metadata,
      durationMs,
      tokensInput: opts?.tokensInput,
      tokensOutput: opts?.tokensOutput,
      costUsd: opts?.costUsd,
      startedAt: new Date(this.startedAt).toISOString(),
      endedAt: new Date(endedAt).toISOString(),
      spans: this.spans.map((s) => ({
        name: s.name,
        kind: s.kind ?? "span",
        parentSpanId: s.parentSpanId,
        model: s.model,
        input: s.input,
        output: s.output,
        metadata: s.metadata,
        tokensInput: s.tokensInput,
        tokensOutput: s.tokensOutput,
        costUsd: s.costUsd,
        latencyMs: s.endedAt ? s.endedAt - s.startedAt : undefined,
        startedAt: new Date(s.startedAt).toISOString(),
        endedAt: s.endedAt ? new Date(s.endedAt).toISOString() : undefined,
      })),
    });
  }
}
