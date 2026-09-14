import Link from "next/link";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";

const tiers = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    blurb: "For exploring evals on a side project or new team.",
    cta: "Start free",
    highlight: false,
    features: [
      "1,000 traces / month",
      "1 project",
      "1 GitHub repo connected",
      "100 eval runs / month",
      "7-day trace retention",
      "Community support",
    ],
  },
  {
    name: "Pro",
    price: "$99",
    cadence: "/ month",
    blurb: "For teams shipping LLM features to production.",
    cta: "Start 14-day trial",
    highlight: true,
    features: [
      "100,000 traces / month",
      "Unlimited projects",
      "Unlimited GitHub repos",
      "10,000 eval runs / month",
      "90-day trace retention",
      "LLM-as-judge included",
      "Slack / email alerts",
      "Priority support",
    ],
  },
  {
    name: "Team",
    price: "$499",
    cadence: "/ month",
    blurb: "For engineering orgs running mission-critical AI.",
    cta: "Talk to us",
    highlight: false,
    features: [
      "1M traces / month",
      "SAML SSO + SCIM",
      "Audit log",
      "1-year retention",
      "Custom eval models",
      "Dedicated Slack channel",
      "SLA + 99.9% uptime",
    ],
  },
];

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main className="py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-semibold tracking-tight">Simple, usage-based pricing.</h1>
          <p className="text-[color:var(--color-text-dim)] mt-4">
            Free to start. Pay only when your eval suite is doing real work.
          </p>
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-14 grid md:grid-cols-3 gap-5">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`card p-7 flex flex-col ${t.highlight ? "ring-2 ring-[color:var(--color-brand)] relative" : ""}`}
            >
              {t.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider bg-[color:var(--color-brand)] text-white px-2 py-0.5 rounded">
                  Most popular
                </div>
              )}
              <div className="font-semibold text-lg">{t.name}</div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-semibold">{t.price}</span>
                <span className="text-sm text-[color:var(--color-text-faint)]">{t.cadence}</span>
              </div>
              <div className="text-sm text-[color:var(--color-text-dim)] mt-2">{t.blurb}</div>
              <ul className="mt-6 space-y-2 text-sm flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-[color:var(--color-brand)]">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={t.name === "Team" ? "mailto:founders@evalo.dev" : "/signin"}
                className={`btn ${t.highlight ? "btn-brand" : "btn-secondary"} mt-7 w-full`}
              >
                {t.cta}
              </Link>
            </div>
          ))}
        </div>
        <div className="max-w-3xl mx-auto px-6 mt-16 text-center text-sm text-[color:var(--color-text-faint)]">
          Need a self-hosted deployment, BAA, or single-tenant cloud? <Link href="mailto:founders@evalo.dev" className="text-[color:var(--color-brand)] hover:underline">Get in touch</Link>.
        </div>
      </main>
      <Footer />
    </>
  );
}
