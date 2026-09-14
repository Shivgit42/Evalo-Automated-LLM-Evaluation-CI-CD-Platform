import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";

export const stripe = new Stripe(secretKey, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

export const PRICE_TO_PLAN: Record<string, "pro" | "team"> = {
  ...(process.env.STRIPE_PRO_PRICE_ID ? { [process.env.STRIPE_PRO_PRICE_ID]: "pro" } : {}),
  ...(process.env.STRIPE_TEAM_PRICE_ID ? { [process.env.STRIPE_TEAM_PRICE_ID]: "team" } : {}),
};
