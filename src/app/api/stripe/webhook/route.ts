import { NextRequest, NextResponse } from "next/server";
import { stripe, PRICE_TO_PLAN } from "@/lib/stripe";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: "no_signature" }, { status: 400 });
  }
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    return NextResponse.json(
      { error: "bad_signature", message: (err as Error).message },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub =
        event.type === "checkout.session.completed"
          ? await stripe.subscriptions.retrieve(
              (event.data.object as Stripe.Checkout.Session).subscription as string,
            )
          : (event.data.object as Stripe.Subscription);

      const projectId =
        (sub.metadata?.projectId as string) ||
        ((event.data.object as Stripe.Checkout.Session).metadata?.projectId as string);
      const priceId = sub.items.data[0]?.price.id;
      const plan = priceId ? PRICE_TO_PLAN[priceId] : undefined;

      if (projectId) {
        await db
          .update(projects)
          .set({
            stripeSubscriptionId: sub.id,
            plan: plan ?? "pro",
            traceCount: 0,
            traceCountResetAt: new Date(),
          })
          .where(eq(projects.id, projectId));
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const projectId = sub.metadata?.projectId as string | undefined;
      if (projectId) {
        await db
          .update(projects)
          .set({ plan: "free", stripeSubscriptionId: null })
          .where(eq(projects.id, projectId));
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
