"use server";

import { redirect } from "next/navigation";
import { requireSession } from "@/server/context";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { priceIdForPlan } from "@/lib/stripe-config";
import { SITE_URL } from "@/lib/site";
import type { PlanId } from "@/lib/plans";

/** Start a Stripe Checkout for a paid plan and redirect the user to it. */
export async function startCheckout(plan: PlanId) {
  if (!stripe) throw new Error("Billing is not configured.");
  const session = await requireSession();
  const workspaceId = session.user.workspaceId;
  if (!workspaceId) throw new Error("No active workspace.");

  const priceId = priceIdForPlan(plan);
  if (!priceId) throw new Error("That plan isn't available yet.");

  const ws = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { stripeCustomerId: true },
  });

  // Reuse the workspace's Stripe customer, or create one.
  let customerId = ws?.stripeCustomerId ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email ?? undefined,
      metadata: { workspaceId },
    });
    customerId = customer.id;
    await prisma.workspace.update({
      where: { id: workspaceId },
      data: { stripeCustomerId: customerId },
    });
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: { metadata: { workspaceId } },
    metadata: { workspaceId, plan },
    allow_promotion_codes: true,
    success_url: `${SITE_URL}/settings/usage?upgraded=1`,
    cancel_url: `${SITE_URL}/settings/usage`,
  });

  if (!checkout.url) throw new Error("Could not start checkout.");
  redirect(checkout.url);
}

/** Open the Stripe customer portal so a subscriber can manage/cancel. */
export async function openBillingPortal() {
  if (!stripe) throw new Error("Billing is not configured.");
  const session = await requireSession();
  const workspaceId = session.user.workspaceId;
  if (!workspaceId) throw new Error("No active workspace.");

  const ws = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { stripeCustomerId: true },
  });
  if (!ws?.stripeCustomerId) throw new Error("No billing account yet.");

  const portal = await stripe.billingPortal.sessions.create({
    customer: ws.stripeCustomerId,
    return_url: `${SITE_URL}/settings/usage`,
  });
  redirect(portal.url);
}
