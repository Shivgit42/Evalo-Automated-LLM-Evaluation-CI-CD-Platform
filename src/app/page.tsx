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
    <section className="relative overflow-hidden pt-28 pb-24">
      {/* Background orbs */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full bg-[#6d28d9]/25 blur-[140px] animate-pulse-orb" />
        <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full bg-[#06b6d4]/10 blur-[100px] animate-pulse-orb delay-300" />
        <div className="absolute top-[30%] right-[5%] w-[300px] h-[300px] rounded-full bg-[#8b5cf6]/15 blur-[80px] animate-pulse-orb delay-600" />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Beta pill */}
        <div className="animate-fade-up inline-flex items-center gap-2 text-xs px-3.5 py-1.5 rounded-full border border-[color:var(--color-border-2)] bg-[color:var(--color-surface)] text-[color:var(--color-text-dim)] mb-8 backdrop-blur-sm">
          <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          Now in private beta · Join 200+ teams shipping AI faster
        </div>

        {/* Headline */}
        <h1 className="animate-fade-up delay-100 text-5xl md:text-[4.5rem] font-semibold tracking-tight leading-[1.06]">
          Evals on every{" "}
          <span className="gradient-text">pull&nbsp;request</span>.
        </h1>

        <p className="animate-fade-up delay-200 mt-6 text-lg md:text-xl text-[color:var(--color-text-dim)] max-w-2xl mx-auto leading-relaxed">
          Evalo runs your LLM eval suite on every PR that touches a prompt, model,
          or agent — and comments the quality diff right where review happens.
          Catch regressions before they ship.
        </p>

        <div className="animate-fade-up delay-300 mt-10 flex items-center justify-center gap-3 flex-wrap">
          <Link href="/signin" className="btn btn-brand text-base px-6 py-2.5 glow">
            Start free with GitHub →
          </Link>
          <Link href="#how" className="btn btn-secondary text-base px-6 py-2.5">
            See how it works
          </Link>
        </div>
        <div className="animate-fade-up delay-400 mt-4 text-xs text-[color:var(--color-text-faint)]">
          Free for 1k traces / month · No credit card required
        </div>
      </div>

      {/* Hero product mock */}
      <div className="animate-fade-up delay-500 max-w-5xl mx-auto px-6 mt-16">
        <div className="relative">
          {/* Glow behind the card */}
          <div className="absolute -inset-px rounded-[16px] bg-gradient-to-b from-[#8b5cf6]/30 to-transparent blur-[2px] pointer-events-none" />
          <div className="card overflow-hidden relative animate-border-glow">
            {/* macOS window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-2)]">
              <span className="size-3 rounded-full bg-[#ff5f56]" />
              <span className="size-3 rounded-full bg-[#ffbd2e]" />
              <span className="size-3 rounded-full bg-[#27c93f]" />
              <span className="ml-3 text-xs text-[color:var(--color-text-faint)] font-mono">
                github.com / acme / llm-agent · PR #842 · feat: upgrade to gpt-4o-mini
              </span>
            </div>
            <PRMock />
          </div>
        </div>
      </div>
    </section>
  );
}

function PRMock() {
  return (
    <div className="p-6 grid md:grid-cols-[1fr_300px] gap-6 text-sm">
      {/* Bot comment */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="size-7 rounded-full bg-gradient-to-br from-violet-400 to-violet-700 flex items-center justify-center text-[10px] font-bold text-white">E</div>
          <div className="font-medium">evalo-bot</div>
          <div className="text-xs text-[color:var(--color-text-faint)]">commented just now</div>
        </div>
        <div className="rounded-xl border border-[color:var(--color-border-2)] bg-[color:var(--color-surface-2)] p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-medium text-sm">Eval suite: <span className="text-[color:var(--color-text-dim)]">customer-support-v3</span></div>
            <span className="badge badge-amber">⚠ regression detected</span>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: "87%", label: "pass rate", sub: "↓ 6%", subColor: "text-red-400" },
              { val: "240", label: "eval cases", sub: "+0", subColor: "text-[color:var(--color-text-faint)]" },
              { val: "$0.42", label: "run cost", sub: "↑ $0.04", subColor: "text-amber-400" },
            ].map((s) => (
              <div key={s.label} className="rounded-lg bg-[color:var(--color-surface)] border border-[color:var(--color-border)] p-3 text-center">
                <div className="text-2xl font-semibold">{s.val}</div>
                <div className="text-[11px] text-[color:var(--color-text-faint)] mt-0.5">{s.label}</div>
                <div className={`text-[11px] mt-1 font-medium ${s.subColor}`}>{s.sub}</div>
              </div>
            ))}
          </div>
          {/* Regressions */}
          <div className="border-t border-[color:var(--color-border)] pt-3 space-y-1.5">
            <div className="font-medium text-white text-xs mb-2">14 regressions vs main</div>
            {[
              "refund_followup — refused valid request (5 cases)",
              "tone_check — formal → casual drift (4 cases)",
              "hallucination — invented order ID (3 cases)",
            ].map((r) => (
              <div key={r} className="flex items-start gap-2 text-xs text-[color:var(--color-text-dim)]">
                <span className="text-red-400 mt-px">•</span>
                {r}
              </div>
            ))}
          </div>
          <Link href="#" className="text-xs text-[color:var(--color-brand)] hover:underline inline-flex items-center gap-1">
            View full diff →
          </Link>
        </div>
      </div>

      {/* Check runs */}
      <div className="space-y-2">
        <div className="text-xs text-[color:var(--color-text-faint)] uppercase tracking-wider mb-3">Checks</div>
        <CheckRow status="ok"   label="build"         detail="2m 14s" />
        <CheckRow status="ok"   label="lint"          detail="14s" />
        <CheckRow status="ok"   label="test"          detail="48s" />
        <CheckRow status="warn" label="evalo/quality" detail="87% pass" highlight />
        <CheckRow status="ok"   label="vercel"        detail="preview ready" />
      </div>
    </div>
  );
}

function CheckRow({
  status, label, detail, highlight,
}: {
  status: "ok" | "warn" | "err";
  label: string;
  detail: string;
  highlight?: boolean;
}) {
  const icon = status === "ok" ? "✓" : status === "warn" ? "⚠" : "✕";
  const color = status === "ok" ? "text-emerald-400" : status === "warn" ? "text-amber-400" : "text-red-400";
  return (
    <div className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-xs transition-all ${highlight ? "border-[color:var(--color-brand)]/50 bg-[color:var(--color-brand)]/5 shadow-[0_0_12px_rgba(139,92,246,0.08)]" : "border-[color:var(--color-border)] bg-[color:var(--color-surface-2)]"}`}>
      <div className="flex items-center gap-2">
        <span className={`${color} text-sm leading-none`}>{icon}</span>
        <span className={highlight ? "font-medium text-white" : "text-[color:var(--color-text-dim)]"}>{label}</span>
      </div>
      <div className={`text-[color:var(--color-text-faint)] font-mono`}>{detail}</div>
    </div>
  );
}

function LogoStrip() {
  const names = ["Mercury", "Linear", "Vercel", "Retool", "Anthropic", "OpenAI"];
  return (
    <section className="py-14 border-y border-[color:var(--color-border)]">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <div className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-text-faint)] mb-7">
          Trusted by teams building AI at
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {names.map((n) => (
            <span key={n} className="text-[color:var(--color-text-faint)] font-semibold text-lg hover:text-[color:var(--color-text-dim)] transition-colors cursor-default">
              {n}
            </span>
          ))}
        </div>
        <div className="text-[10px] text-[color:var(--color-text-faint)] mt-4 opacity-60">
          * Representative of design partners in private beta
        </div>
      </div>
    </section>
  );
}

function Problem() {
  const problems = [
    { title: "Prompt drift", detail: "Small wording changes silently break 20% of cases." },
    { title: "Model swaps", detail: "Upgrade to a new model, lose 15% accuracy in production." },
    { title: "Tool regressions", detail: "Agent stops calling the right function. You find out from support." },
    { title: "No ground truth", detail: "Your team disagrees on what 'good' even means." },
  ];
  return (
    <section className="py-28">
      <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-brand)] mb-4">The problem</div>
          <h2 className="text-3xl md:text-4xl font-semibold leading-tight">
            Your AI feature works in dev.{" "}
            <span className="text-[color:var(--color-text-dim)]">Then it ships, and breaks.</span>
          </h2>
          <p className="mt-5 text-[color:var(--color-text-dim)] leading-relaxed">
            Every team shipping LLM features runs the same loop: tweak a prompt, hope nothing
            regressed, ship it, find out from a customer. Existing eval tools live in a separate
            dashboard nobody opens. Evalo lives in the PR — where decisions actually get made.
          </p>
        </div>
        <div className="space-y-3">
          {problems.map((p, i) => (
            <div key={p.title} className={`card card-hover p-4 flex items-start gap-3 delay-${i * 100}`}>
              <div className="size-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 text-red-400 text-sm">
                ✕
              </div>
              <div>
                <div className="font-medium text-sm">{p.title}</div>
                <div className="text-sm text-[color:var(--color-text-dim)] mt-0.5">{p.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Define your evals",
      body: "Write eval cases as JSONL or promote production traces. Add LLM-as-judge rubrics, exact match, or custom assertions. Versioned in your repo.",
      icon: "📝",
    },
    {
      n: "02",
      title: "Install the GitHub App",
      body: "One click. Evalo watches PRs that touch your prompts, agents, or model configs — or trigger from CI yourself.",
      icon: "⚡",
    },
    {
      n: "03",
      title: "Ship with confidence",
      body: "Every PR gets a pass/fail comment and quality diff vs main. Block merges on regression. See traces inline.",
      icon: "🚀",
    },
  ];
  return (
    <section id="how" className="py-28 border-t border-[color:var(--color-border)]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-brand)] mb-4">How it works</div>
          <h2 className="text-3xl md:text-4xl font-semibold">Three steps. One afternoon to set up.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-10 left-[calc(33%-16px)] right-[calc(33%-16px)] h-px bg-gradient-to-r from-transparent via-[color:var(--color-border-2)] to-transparent" />
          {steps.map((s, i) => (
            <div key={s.n} className={`card card-hover p-6 relative delay-${i * 100}`}>
              <div className="text-2xl mb-4 animate-float" style={{ animationDelay: `${i * 0.7}s` }}>{s.icon}</div>
              <div className="text-[color:var(--color-brand)] font-mono text-xs mb-2">{s.n}</div>
              <div className="font-semibold mb-2">{s.title}</div>
              <div className="text-sm text-[color:var(--color-text-dim)] leading-relaxed">{s.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const feats = [
    { icon: "⎔", title: "PR checks", body: "Pass/fail comment + check-run on every PR. Block merges on regression." },
    { icon: "◎", title: "Trace observability", body: "Production trace ingestion. Drill into multi-step agents with full token + tool-call detail." },
    { icon: "⚙", title: "Dataset versioning", body: "Eval datasets live next to your code. Promote production traces to test cases in one click." },
    { icon: "✦", title: "LLM-as-judge", body: "GPT-4o / Claude as a rubric judge. Calibrate against human labels until correlation > 0.85." },
    { icon: "⊕", title: "Multi-model", body: "OpenAI, Anthropic, Bedrock, Vertex, Azure. Compare model swaps side-by-side." },
    { icon: "⊗", title: "Self-host or cloud", body: "SOC 2 Type II in progress. Single-tenant deploys for regulated industries." },
  ];
  return (
    <section id="features" className="py-28 border-t border-[color:var(--color-border)]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold">Everything your team needs to ship AI quality.</h2>
          <p className="text-[color:var(--color-text-dim)] mt-4 max-w-2xl mx-auto">
            From the first eval to enterprise rollout — without leaving GitHub.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {feats.map((f, i) => (
            <div key={f.title} className={`card card-hover p-6 group delay-${i * 100}`}>
              <div className="text-xl text-[color:var(--color-brand)] mb-4 group-hover:scale-110 transition-transform inline-block">{f.icon}</div>
              <div className="font-semibold mb-2">{f.title}</div>
              <div className="text-sm text-[color:var(--color-text-dim)] leading-relaxed">{f.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CodeExample() {
  const code = `import { evalo } from "@evalo/sdk";
import OpenAI from "openai";

// Wrap once — get traces, evals, and PR checks
const openai = evalo.wrap(new OpenAI(), {
  project: "customer-support",
  dataset: "summaries-v1",
});

const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: input }],
});`;

  return (
    <section className="py-28 border-t border-[color:var(--color-border)]">
      <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-center">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-brand)] mb-4">5-line install</div>
          <h2 className="text-3xl md:text-4xl font-semibold leading-tight">
            Wrap your LLM call.<br />
            <span className="text-[color:var(--color-text-dim)]">Get traces + evals for free.</span>
          </h2>
          <p className="mt-5 text-[color:var(--color-text-dim)] leading-relaxed">
            One SDK, every framework. Works with OpenAI, Anthropic, LangChain, Vercel AI SDK,
            LlamaIndex, and your custom agent loop.
          </p>
          <div className="mt-8 flex flex-col gap-2">
            {["Zero config to start", "Auto-captures latency, cost, and tokens", "Works with any LLM provider"].map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-sm text-[color:var(--color-text-dim)]">
                <span className="size-4 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-[9px] text-emerald-400">✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-1 rounded-[14px] bg-gradient-to-br from-[#8b5cf6]/20 to-[#06b6d4]/10 blur-[6px] pointer-events-none" />
          <pre className="relative text-[13px] leading-7">
            <code>{code}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}

function SocialProof() {
  const quotes = [
    {
      body: "Before Evalo we shipped prompt changes and prayed. Now PR review includes the eval delta and we caught three regressions in the first week.",
      who: "Eng lead, Series A fintech",
      initials: "KL",
    },
    {
      body: "The PR-check model is the obvious right answer. We replaced two homegrown scripts and a Notion doc with one button.",
      who: "Staff engineer, AI infra startup",
      initials: "MR",
    },
  ];
  return (
    <section className="py-28 border-t border-[color:var(--color-border)]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-brand)] mb-3">What teams say</div>
          <h2 className="text-2xl font-semibold">Trusted by the teams building real AI products</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {quotes.map((q) => (
            <div key={q.who} className="card card-hover p-7 flex flex-col gap-5">
              <div className="text-3xl text-[color:var(--color-brand)] opacity-40 leading-none font-serif">"</div>
              <div className="text-base leading-relaxed text-[color:var(--color-text)]">{q.body}</div>
              <div className="flex items-center gap-3 mt-auto">
                <div className="size-8 rounded-full bg-gradient-to-br from-violet-400 to-violet-700 flex items-center justify-center text-[11px] font-bold text-white">
                  {q.initials}
                </div>
                <div className="text-sm text-[color:var(--color-text-faint)]">— {q.who}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-28 border-t border-[color:var(--color-border)]">
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-[#6d28d9]/20 blur-[80px] animate-pulse-orb" />
        </div>
        <div className="badge badge-purple mb-6">Get started free</div>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
          Stop shipping{" "}
          <span className="gradient-text">prompt regressions</span>.
        </h2>
        <p className="text-[color:var(--color-text-dim)] mt-5 text-lg leading-relaxed">
          Free forever for 1k traces / month. Set up in an afternoon.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
          <Link href="/signin" className="btn btn-brand text-base px-7 py-3 glow">
            Start free with GitHub →
          </Link>
          <Link href="/pricing" className="btn btn-secondary text-base px-7 py-3">
            View pricing
          </Link>
        </div>
      </div>
    </section>
  );
}
