import Link from "next/link";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";

export default function DocsPage() {
  return (
    <>
      <Nav />
      <main className="max-w-3xl mx-auto px-6 py-16 space-y-12">
        <header>
          <h1 className="text-4xl font-semibold tracking-tight">Quickstart</h1>
          <p className="text-[color:var(--color-text-dim)] mt-2">
            Send your first trace and run your first eval in under 5 minutes.
          </p>
        </header>

        <Section number="1" title="Sign up & create a project">
          <p>
            <Link href="/signin" className="text-[color:var(--color-brand)]">Sign in with GitHub</Link>{" "}
            and create a project. You&apos;ll see your <code>EVALO_API_KEY</code> on the project overview page — save it now, it&apos;s only shown once.
          </p>
        </Section>

        <Section number="2" title="Install the SDK">
          <pre>{`npm i @evalo/sdk
# or
pnpm add @evalo/sdk`}</pre>
        </Section>

        <Section number="3" title="Send a trace">
          <pre>{`import { Evalo } from "@evalo/sdk";
import OpenAI from "openai";

const evalo = new Evalo({ apiKey: process.env.EVALO_API_KEY! });
const openai = new OpenAI();

const trace = evalo.trace({
  name: "summarize",
  input: { article },
});

const r = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: \`Summarize: \${article}\` }],
});

await trace.end({
  output: r.choices[0].message.content,
  tokensInput: r.usage?.prompt_tokens,
  tokensOutput: r.usage?.completion_tokens,
});`}</pre>
          <p>
            Or send a raw HTTP request:
          </p>
          <pre>{`curl -X POST https://evalo.dev/api/v1/traces \\
  -H "Authorization: Bearer $EVALO_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "summarize",
    "input": { "article": "..." },
    "output": "...",
    "durationMs": 842
  }'`}</pre>
        </Section>

        <Section number="4" title="Create a dataset">
          <p>
            In your project, go to <strong>Datasets → New dataset</strong>, then paste JSONL — one
            test case per line:
          </p>
          <pre>{`{"input": "refund my order #1234", "expected_output": "Initiate refund and confirm."}
{"input": "is bitcoin a security?", "expected_output": "Decline; out of scope."}
{"input": "where is my package?", "expected_output": "Ask for order number."}`}</pre>
        </Section>

        <Section number="5" title="Run your first eval">
          <p>
            Go to <strong>Eval runs</strong>, pick your dataset and eval definition, optionally add
            a system prompt, and hit <strong>Run evals</strong>. Or trigger from CI:
          </p>
          <pre>{`await evalo.runEval({
  datasetId: "ds_xxx",
  evalDefinitionId: "ev_xxx",
  systemPrompt: "You are a helpful support agent.",
  model: "gpt-4o-mini",
});`}</pre>
        </Section>

        <Section number="6" title="Connect GitHub for PR checks">
          <p>
            In <strong>Settings → GitHub integration</strong>, install the Evalo GitHub App. Every PR
            against the connected repo will trigger your configured eval suite and post a check-run
            with the pass-rate diff vs <code>main</code>. Set up branch protection to block merges
            on regression.
          </p>
        </Section>
      </main>
      <Footer />
    </>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-3">
        <span className="text-[color:var(--color-brand)] font-mono text-sm">{number}</span>
        {title}
      </h2>
      <div className="text-[color:var(--color-text-dim)] space-y-3 leading-relaxed">{children}</div>
    </section>
  );
}
