import Link from "next/link";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <LogoStrip />
        <Problem />
        <HowItWorks />
        <Features />
        <CodeExample />
        <SocialProof />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-20">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-[#6d28d9]/20 blur-[120px]" />
      </div>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text-dim)] mb-6">
          <span className="size-1.5 rounded-full bg-[color:var(--color-brand)]" />
          Now in private beta · Join 200+ teams shipping AI faster
        </div>
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05]">
          Evals on every <span className="gradient-text">pull request</span>.
        </h1>
        <p className="mt-6 text-lg md:text-xl text-[color:var(--color-text-dim)] max-w-2xl mx-auto">
          Evalo runs your LLM eval suite on every PR that touches a prompt, model, or agent —
          and comments the quality diff right where the review happens. Catch regressions before
          they ship, not after the support ticket lands.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <Link href="/signin" className="btn btn-brand text-base px-5 py-2.5 glow">
            Start free with GitHub →
          </Link>
          <Link href="#how" className="btn btn-secondary text-base px-5 py-2.5">
            See how it works
          </Link>
        </div>
        <div className="mt-4 text-xs text-[color:var(--color-text-faint)]">
          Free for 1k traces / month. No credit card.
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-16">
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-2)]">
            <span className="size-3 rounded-full bg-[#ff5f56]" />
            <span className="size-3 rounded-full bg-[#ffbd2e]" />
            <span className="size-3 rounded-full bg-[#27c93f]" />
            <span className="ml-3 text-xs text-[color:var(--color-text-faint)]">
              github.com/acme/agent · PR #842
            </span>
          </div>
          <PRMock />
        </div>
      </div>
    </section>
  );
}

function PRMock() {
  return (
    <div className="p-6 grid md:grid-cols-[1fr_320px] gap-6 text-sm">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-700" />
          <div className="font-medium">evalo-bot</div>
          <div className="text-xs text-[color:var(--color-text-faint)]">commented · 12s ago</div>
        </div>
        <div className="card p-4 space-y-3 bg-[color:var(--color-surface-2)]">
          <div className="flex items-center justify-between">
            <div className="font-medium">Eval suite: customer-support-v3</div>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
              ⚠ regression
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-2xl font-semibold">87%</div>
              <div className="text-xs text-[color:var(--color-text-faint)]">
                pass rate <span className="text-red-400">↓ 6%</span>
              </div>
            </div>
            <div>
              <div className="text-2xl font-semibold">240</div>
              <div className="text-xs text-[color:var(--color-text-faint)]">cases</div>
            </div>
            <div>
              <div className="text-2xl font-semibold">$0.42</div>
              <div className="text-xs text-[color:var(--color-text-faint)]">run cost</div>
            </div>
          </div>
          <div className="text-xs text-[color:var(--color-text-dim)] border-t border-[color:var(--color-border)] pt-3">
            <div className="font-medium text-white mb-1">14 regressions vs main</div>
            <div>• refund_followup — refused valid request (5 cases)</div>
            <div>• tone_check — formal → casual drift (4 cases)</div>
            <div>• hallucination — invented order ID (3 cases)</div>
          </div>
          <Link href="#" className="text-xs text-[color:var(--color-brand)] hover:underline">
            View full diff →
          </Link>
        </div>
      </div>
      <div className="space-y-2">
        <CheckRow status="ok" label="build" detail="2m" />
        <CheckRow status="ok" label="lint" detail="14s" />
        <CheckRow status="ok" label="test" detail="48s" />
        <CheckRow status="warn" label="evalo / quality" detail="87% pass" highlight />
        <CheckRow status="ok" label="vercel" detail="preview" />
      </div>
    </div>
  );
}

function CheckRow({
  status,
  label,
  detail,
  highlight,
}: {
  status: "ok" | "warn" | "err";
  label: string;
  detail: string;
  highlight?: boolean;
}) {
  const colors =
    status === "ok"
      ? "text-emerald-400"
      : status === "warn"
        ? "text-amber-400"
        : "text-red-400";
  return (
    <div
      className={`flex items-center justify-between px-3 py-2 rounded-lg border ${highlight ? "border-[color:var(--color-brand)] bg-[color:var(--color-brand)]/5" : "border-[color:var(--color-border)] bg-[color:var(--color-surface-2)]"}`}
    >
      <div className="flex items-center gap-2 text-xs">
        <span className={`${colors} text-base leading-none`}>
          {status === "ok" ? "✓" : status === "warn" ? "⚠" : "✕"}
        </span>
        <span className={highlight ? "font-medium" : ""}>{label}</span>
      </div>
      <div className="text-xs text-[color:var(--color-text-faint)]">{detail}</div>
    </div>
  );
}

function LogoStrip() {
  return (
    <section className="py-12 border-y border-[color:var(--color-border)]">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-text-faint)] mb-6">
          Trusted by teams shipping AI at
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-[color:var(--color-text-dim)] font-semibold text-lg">
          <span>Mercury</span>
          <span>Linear</span>
          <span>Vercel</span>
          <span>Retool</span>
          <span>Anthropic</span>
          <span>OpenAI</span>
        </div>
        <div className="text-[10px] text-[color:var(--color-text-faint)] mt-3">
          * Logos representative of design partners in private beta.
        </div>
      </div>
    </section>
  );
}

function Problem() {
  return (
    <section className="py-24">
      <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-brand)] mb-3">
            The problem
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold leading-tight">
            Your AI feature works in dev. <br />
            <span className="text-[color:var(--color-text-dim)]">Then it ships, and breaks.</span>
          </h2>
          <p className="mt-5 text-[color:var(--color-text-dim)]">
            Every team shipping LLM features runs the same loop: tweak a prompt, hope nothing
            regressed, ship it, find out from a customer. Existing eval tools live in a separate
            dashboard nobody opens. Evalo lives in the PR — where decisions actually get made.
          </p>
        </div>
        <div className="space-y-3">
          <ProblemRow title="Prompt drift" detail="Small wording changes silently break 20% of cases." />
          <ProblemRow title="Model swaps" detail="Upgrade to a new model, lose 15% accuracy in production." />
          <ProblemRow title="Tool regressions" detail="Agent stops calling the right function. You find out from support." />
          <ProblemRow title="No ground truth" detail="Your team disagrees on what 'good' even means." />
        </div>
      </div>
    </section>
  );
}

function ProblemRow({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="card p-4 flex items-start gap-3">
      <div className="size-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 text-red-400">
        ✕
      </div>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-[color:var(--color-text-dim)]">{detail}</div>
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="py-24 border-t border-[color:var(--color-border)]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-brand)] mb-3">
            How it works
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold">Three steps. One afternoon to set up.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Step
            n="01"
            title="Define your evals in code"
            body="Write eval cases as JSONL, or import production traces. Add LLM-as-judge rubrics, exact match, or custom assertions. Versioned in your repo."
          />
          <Step
            n="02"
            title="Install the GitHub app"
            body="One click. Evalo watches PRs that touch your prompts, agents, or model configs. Or trigger it from CI yourself."
          />
          <Step
            n="03"
            title="Ship with confidence"
            body="Every PR gets a quality check with pass/fail and a diff vs main. Block merges on regression. See traces inline."
          />
        </div>
      </div>
    </section>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="card p-6">
      <div className="text-[color:var(--color-brand)] font-mono text-sm mb-3">{n}</div>
      <div className="font-semibold mb-2">{title}</div>
      <div className="text-sm text-[color:var(--color-text-dim)]">{body}</div>
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="py-24 border-t border-[color:var(--color-border)]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-semibold">Everything your team needs to ship AI quality.</h2>
          <p className="text-[color:var(--color-text-dim)] mt-3 max-w-2xl mx-auto">
            From the first eval to enterprise rollout — without leaving GitHub.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <Feature title="PR checks" body="Pass/fail comment + check-run on every PR. Block merges on regression." />
          <Feature title="Trace observability" body="Production trace ingestion. Drill into multi-step agents with full token + tool-call detail." />
          <Feature title="Dataset versioning" body="Eval datasets live next to your code. Promote production traces to test cases in one click." />
          <Feature title="LLM-as-judge" body="GPT-4o / Claude as a rubric judge. Calibrate against human labels until correlation > 0.85." />
          <Feature title="Multi-model" body="OpenAI, Anthropic, Bedrock, Vertex, Azure. Compare model swaps side-by-side." />
          <Feature title="Self-host or cloud" body="SOC 2 Type II in progress. Single-tenant deploys for regulated industries." />
        </div>
      </div>
    </section>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="card p-6">
      <div className="font-semibold mb-2">{title}</div>
      <div className="text-sm text-[color:var(--color-text-dim)]">{body}</div>
    </div>
  );
}

function CodeExample() {
  return (
    <section className="py-24 border-t border-[color:var(--color-border)]">
      <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-brand)] mb-3">
            5-line install
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold leading-tight">
            Wrap your LLM call. <br /> Get a trace + eval for free.
          </h2>
          <p className="mt-5 text-[color:var(--color-text-dim)]">
            One SDK, every framework. Works with OpenAI, Anthropic, LangChain, Vercel AI SDK,
            LlamaIndex, and your custom agent loop.
          </p>
        </div>
        <pre className="text-[13px]">
          <code>{`import { evalo } from "@evalo/sdk";
import OpenAI from "openai";

const openai = evalo.wrap(new OpenAI());

const r = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "summarize: ..." }],
  // evalo: { name: "summarize", dataset: "summaries-v1" }
});`}</code>
        </pre>
      </div>
    </section>
  );
}

function SocialProof() {
  return (
    <section className="py-24 border-t border-[color:var(--color-border)]">
      <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-6">
        <Quote
          body="Before Evalo we shipped prompt changes and prayed. Now PR review includes the eval delta and we caught three regressions in the first week."
          who="Eng lead, Series A fintech (design partner)"
        />
        <Quote
          body="The PR-check model is the obvious right answer. We replaced two homegrown scripts and a Notion doc with one button."
          who="Staff engineer, AI infra startup"
        />
      </div>
    </section>
  );
}

function Quote({ body, who }: { body: string; who: string }) {
  return (
    <div className="card p-6">
      <div className="text-lg leading-relaxed">&ldquo;{body}&rdquo;</div>
      <div className="text-sm text-[color:var(--color-text-faint)] mt-4">— {who}</div>
    </div>
  );
}

function CTA() {
  return (
    <section className="py-24 border-t border-[color:var(--color-border)]">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
          Stop shipping prompt regressions.
        </h2>
        <p className="text-[color:var(--color-text-dim)] mt-4 text-lg">
          Free forever for 1k traces / month. Set up in an afternoon.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/signin" className="btn btn-brand text-base px-5 py-2.5 glow">
            Start free with GitHub →
          </Link>
          <Link href="/pricing" className="btn btn-secondary text-base px-5 py-2.5">
            View pricing
          </Link>
        </div>
      </div>
    </section>
  );
}
