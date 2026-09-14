# @evalo/sdk

TypeScript SDK for [Evalo](https://evalo.dev) — GitHub-native LLM evals.

```bash
npm i @evalo/sdk
```

```ts
import { Evalo } from "@evalo/sdk";
import OpenAI from "openai";

const evalo = new Evalo({ apiKey: process.env.EVALO_API_KEY! });
const openai = new OpenAI();

const trace = evalo.trace({ name: "summarize", input: { article } });

const llm = trace.span({ kind: "llm", name: "openai.chat", model: "gpt-4o-mini", input: messages });
const r = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages,
});
llm.end({ output: r.choices[0].message, tokensInput: r.usage?.prompt_tokens, tokensOutput: r.usage?.completion_tokens });

await trace.end({ output: r.choices[0].message.content });
```

Trigger an eval run programmatically (e.g. from CI):

```ts
await evalo.runEval({
  datasetId: "ds_xxx",
  evalDefinitionId: "ev_xxx",
  commitSha: process.env.GITHUB_SHA,
  prNumber: Number(process.env.PR_NUMBER),
});
```
