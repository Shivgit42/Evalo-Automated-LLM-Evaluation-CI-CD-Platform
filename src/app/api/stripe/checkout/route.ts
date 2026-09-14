import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { projectId, plan } = (await req.json()) as { projectId: string; plan: "pro" | "team" };

  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.ownerId, session.user.id)),
  });
  if (!project) return NextResponse.json({ error: "project_not_found" }, { status: 404 });

  const priceId =
    plan === "pro" ? process.env.STRIPE_PRO_PRICE_ID : process.env.STRIPE_TEAM_PRICE_ID;
  if (!priceId) return NextResponse.json({ error: "price_not_configured" }, { status: 500 });

  let customerId = project.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
      metadata: { projectId },
    });
    customerId = customer.id;
    await db
      .update(projects)
      .set({ stripeCustomerId: customerId })
      .where(eq(projects.id, projectId));
  }

  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
  const checkout = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/app/${projectId}?billing=success`,
    cancel_url: `${baseUrl}/pricing?billing=canceled`,
    allow_promotion_codes: true,
    metadata: { projectId },
  });

  return NextResponse.json({ url: checkout.url });
}
