import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { planForPriceId } from "@/lib/stripe-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return new Response("Billing not configured", { status: 503 });

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        if (s.subscription) {
          const sub = await stripe.subscriptions.retrieve(s.subscription as string);
          await syncSubscription(sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      }
    }
  } catch {
    // Return 500 so Stripe retries; never crash the endpoint.
    return new Response("Webhook handler failed", { status: 500 });
  }

  return new Response("ok");
}

async function syncSubscription(sub: Stripe.Subscription) {
  const workspaceId = sub.metadata?.workspaceId;
  const priceId = sub.items.data[0]?.price?.id;
  const active = sub.status === "active" || sub.status === "trialing";
  const plan = active ? planForPriceId(priceId) : "FREE";

  // period-end lives on the subscription (older API) or its item (newer API)
  const anySub = sub as unknown as {
    current_period_end?: number;
    items?: { data?: Array<{ current_period_end?: number }> };
  };
  const endUnix = anySub.current_period_end ?? anySub.items?.data?.[0]?.current_period_end;
  const stripeCurrentPeriodEnd = typeof endUnix === "number" ? new Date(endUnix * 1000) : null;

  const data = {
    plan,
    stripeSubscriptionId: sub.id,
    stripeStatus: sub.status,
    stripeCurrentPeriodEnd,
  };

  if (workspaceId) {
    await prisma.workspace.update({ where: { id: workspaceId }, data });
  } else {
    await prisma.workspace.update({ where: { stripeCustomerId: sub.customer as string }, data });
  }
}
