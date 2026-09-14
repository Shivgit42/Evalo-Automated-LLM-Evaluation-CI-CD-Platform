# Evalo

GitHub-native LLM evals. Every PR that touches a prompt auto-runs your eval suite and posts the quality diff right where the review happens.

The wedge vs Braintrust / Langfuse / Helicone: those are dashboards. Evalo lives in the PR — where the decision to ship actually gets made.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Postgres + Drizzle ORM (Neon-ready)
- Auth.js v5 (GitHub OAuth)
- Stripe billing
- OpenAI (LLM-as-judge)
- GitHub App (PR checks)
- Vercel-ready

## Local setup

```bash
# 1. install
npm install

# 2. configure env
cp .env.example .env.local
# - DATABASE_URL: Neon or local Postgres
# - AUTH_GITHUB_ID / AUTH_GITHUB_SECRET: GitHub OAuth app (see below)
# - OPENAI_API_KEY: for LLM-as-judge evals

# 3. push schema
npm run db:push

# 4. run
npm run dev
```

Open http://localhost:3000.

## Create the GitHub OAuth app (for sign-in)

1. https://github.com/settings/developers → New OAuth App
2. Homepage URL: `http://localhost:3000`
3. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy client ID and secret into `.env.local`

## Create the GitHub App (for PR checks — the wedge)

1. https://github.com/settings/apps → New GitHub App
2. Permissions:
   - Repository: Checks (read & write), Pull requests (read & write), Contents (read)
3. Subscribe to events: **Pull request**
4. Webhook URL: `https://YOUR_DOMAIN/api/github/webhook`
5. Setup URL: `https://YOUR_DOMAIN/api/github/setup` (redirect on install)
6. Generate a private key, copy into `GITHUB_APP_PRIVATE_KEY` (replace literal newlines with `\n` if needed)

## Deploy to Vercel

```bash
vercel
# add all env vars from .env.example in the Vercel dashboard
```

Hook your Postgres URL (Neon recommended), then run `npm run db:push` against your production DB once.

## Project structure

```
src/
  app/
    page.tsx                          # marketing landing
    pricing/                          # pricing page
    signin/                           # OAuth sign-in
    app/                              # auth-gated dashboard
      [projectId]/
        page.tsx                      # overview
        traces/                       # trace list + detail
        datasets/                     # dataset list + detail
        evals/                        # eval runs + run detail
        settings/                     # API keys + GitHub integration
    docs/                             # quickstart docs
    api/
      auth/[...nextauth]/             # Auth.js
      v1/
        traces/                       # POST /api/v1/traces (ingestion)
        evals/run/                    # POST /api/v1/evals/run
      github/
        webhook/                      # PR events → eval run + check-run
        setup/                        # post-install callback
      stripe/
        checkout/                     # create Stripe Checkout session
        webhook/                      # subscription state sync
  lib/
    db/                               # Drizzle schema + client
    auth.ts                           # Auth.js config
    api-keys.ts                       # API-key generation + verification
    evals/                            # eval runner (LLM-as-judge, exact, contains, json)
    github.ts                         # GitHub App JWT + check-runs
    projects.ts                       # server actions
    stripe.ts                         # Stripe client
packages/
  sdk/                                # @evalo/sdk (publishable npm package)
```
