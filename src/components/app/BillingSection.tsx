"use client";

import { useState } from "react";

interface BillingSectionProps {
  projectId: string;
  plan: "free" | "pro" | "team";
  traceCount: number;
}

export function BillingSection({ projectId, plan, traceCount }: BillingSectionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade(targetPlan: "pro" | "team") {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, plan: targetPlan }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to create checkout session");
      }
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  }

  const limits = {
    free: 1000,
    pro: 100000,
    team: 1000000,
  };

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-medium">Subscription & Billing</h2>
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold capitalize text-base">{plan} Plan</span>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                  plan === "pro"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : plan === "team"
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {plan.toUpperCase()}
              </span>
            </div>
            <div className="text-xs text-[color:var(--color-text-dim)] mt-1">
              {traceCount.toLocaleString()} / {limits[plan].toLocaleString()} traces used this period
            </div>
          </div>

          {plan === "free" ? (
            <button
              onClick={() => handleUpgrade("pro")}
              disabled={loading}
              className="btn btn-brand text-sm px-4 py-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Redirecting to Stripe..." : "Upgrade to Pro →"}
            </button>
          ) : (
            <div className="text-xs text-emerald-400 font-medium">✓ Plan Active</div>
          )}
        </div>

        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded">
            {error}
          </div>
        )}
      </div>
    </section>
  );
}
