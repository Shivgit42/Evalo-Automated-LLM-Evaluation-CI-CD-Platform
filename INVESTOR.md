# Evalo — investor 1-pager

> **Evalo runs your LLM eval suite on every pull request and posts the quality diff right where the review happens. Catch prompt regressions before you merge, not after the support ticket lands.**

## The problem

Every team shipping LLM features lives the same loop: tweak a prompt, hope nothing regressed, ship it, find out from a customer. Existing eval tools (Braintrust, Langfuse, Helicone) are dashboards that live in a separate tab nobody opens during code review.

Meanwhile the rate of AI feature changes is exploding. Teams are pushing prompts daily, swapping models monthly, and trying new agent architectures weekly — and the quality bar is invisible.

The result: 60-70% of teams shipping LLM features in 2025 have no automated quality gate at all (internal interviews with 24 design-partner teams, Q1 2026).

## The wedge

**Evalo is the only eval tool that lives in the pull request.** One install, every PR that touches a prompt, agent, or model config gets:

- A check-run (✓/⚠/✕) gating merge
- A comment with pass-rate, regressions vs `main`, and the worst-failing cases
- Drill-in links to full traces and LLM-judge reasoning

Same surface as Vercel Preview deploys. Same muscle memory as CI. Decisions about AI quality happen at the same time and place as decisions about code quality.

## Why now

1. **PR-time eval is a 2025 behavior change.** OpenAI's evals UI, Anthropic's PR checks, and Vercel's AI SDK all shipped first-class eval primitives in 2025. The market has been taught the loop; we sell the best-in-class implementation.
2. **GitHub Actions for AI quality is unowned.** Snyk owns security. Vercel owns previews. CodeRabbit owns AI review. No one owns AI *quality* in the PR.
3. **Spend is shifting from inference to quality.** As inference costs collapse (Haiku 4.5, gpt-4o-mini at $0.15/M), the moat moves to "is the output any good?" Eval infra is where 2026 AI budget lands.

## Market

- **TAM:** every company shipping LLM-backed software. 250k+ orgs already on OpenAI/Anthropic APIs (provider disclosures, Q4 2025).
- **SAM:** seed–Series C companies with AI features in production: ~12k orgs, avg 5–30 engineers touching prompts.
- **ACV:** Pro ($1.2k/yr), Team ($6k/yr), Enterprise ($24–60k/yr).
- **Revenue model:** seat-light, usage-based on traces + eval runs.

Comparable: Vanta ($2.5B), Datadog ($45B), PostHog ($1B+ private). Quality-infra for AI is a similar "every team buys this once" wedge.

## Competitive landscape

| Player | Wedge | Where we win |
|---|---|---|
| Braintrust | Dashboard, datasets, side-by-side eval UI | We're the PR-native surface. They're 3 clicks away from a merge. |
| Langfuse | OSS observability | Tracing is table stakes. We're built around the eval-on-PR loop. |
| Helicone | Proxy, cost tracking | Different jobs-to-be-done. We can integrate, not replace. |
| Datadog / NewRelic | APM + AI observability | Too generic; lacks the GitHub-native developer loop. |

Our defensibility: workflow lock-in (PR check is configured per repo, blocks merges, hard to swap mid-flight) + dataset compounding (production traces → eval cases, growing per-project).

## The plan (next 6 months)

| Month | Milestone | Metric |
|---|---|---|
| M1 | YC application + private beta with 8 design partners | 8 logos shipping evals via PR |
| M2 | Public beta, $0–$99 pricing live | 50 sign-ups, 5 paying |
| M3 | YC interview / S26 batch | (or seed round) |
| M4 | GitHub Marketplace launch | 500 sign-ups, $5k MRR |
| M5 | Anthropic + Vertex provider support | $15k MRR, 25 paying |
| M6 | SOC 2 Type I, Team plan launch | $35k MRR, first Team customer |

## Founder

Software engineer building Evalo solo with the Claude Code agent stack. Reachable at `founders@evalo.dev`.

## Why we win

The teams who care about AI quality already use GitHub PRs. The eval tooling that meets them where decisions actually get made wins the workflow — and once you're the merge-blocker, you're impossible to rip out.

---

**Ask: $1.2M pre-seed at $8M cap.** 18-month runway to $200k MRR and Series A. We'll deploy capital on: 2 engineers, a GTM hire for design-partner-led sales, SOC 2, and a marketplace push.
