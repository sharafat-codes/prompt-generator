// Freemium plans. One source of truth for pricing, limits, and features —
// read by the pricing page, the usage meter, and server-side metering.

export type PlanId = "FREE" | "PRO" | "TEAM";

export type Plan = {
  id: PlanId;
  name: string;
  priceMonthly: number; // USD
  tagline: string;
  generations: number; // per month
  features: string[];
  cta: string;
  highlighted?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "FREE",
    name: "Free",
    priceMonthly: 0,
    tagline: "Try it and keep your best prompts.",
    generations: 200,
    cta: "Start free",
    features: [
      "200 generations / month",
      "Unlimited saved recipes",
      "Every generator — content & AI prompts",
      "Search, filters & favorites",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    priceMonthly: 15,
    tagline: "For creators & marketers who ship daily.",
    generations: 5000,
    cta: "Upgrade to Pro",
    highlighted: true,
    features: [
      "5,000 generations / month",
      "Everything in Free",
      "Version history on every recipe",
      "Priority generation speed",
      "Email support",
    ],
  },
  {
    id: "TEAM",
    name: "Team",
    priceMonthly: 49,
    tagline: "A shared prompt library for your whole team.",
    generations: 20000,
    cta: "Upgrade to Team",
    features: [
      "20,000 generations / month",
      "Everything in Pro",
      "Shared team workspace",
      "Roles & members",
      "Centralized billing",
    ],
  },
];

export function getPlan(id: string): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

export function generationLimit(plan: string) {
  return getPlan(plan).generations;
}

/** Current metering period as YYYY-MM (UTC). */
export function currentPeriod(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}
