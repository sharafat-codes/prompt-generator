import type { PlanId } from "@/lib/plans";

// Map our plans to Stripe recurring price IDs (set in env from the Stripe
// dashboard) and back — the webhook uses the reverse map to sync the plan.

export function priceIdForPlan(plan: PlanId): string | null {
  if (plan === "PRO") return process.env.STRIPE_PRICE_PRO ?? null;
  if (plan === "TEAM") return process.env.STRIPE_PRICE_TEAM ?? null;
  return null;
}

export function planForPriceId(priceId: string | null | undefined): PlanId {
  if (!priceId) return "FREE";
  if (priceId === process.env.STRIPE_PRICE_PRO) return "PRO";
  if (priceId === process.env.STRIPE_PRICE_TEAM) return "TEAM";
  return "FREE";
}
