// Freemium plans — one source of truth for pricing, limits, model, and features.
// Read by the pricing page, usage meter, metering, save-cap, and model routing.

export type PlanId = "FREE" | "PRO" | "TEAM";

export type Plan = {
  id: PlanId;
  name: string;
  priceMonthly: number; // USD
  tagline: string;
  generations: number; // per month
  savedRecipes: number | null; // null = unlimited
  model: string; // AI model used for this plan
  features: string[];
  cta: string;
  highlighted?: boolean;
};

// Free uses a fast, cheap model; paid plans get the higher-quality one.
// Bump PAID_MODEL to "claude-opus-4-8" if you want the absolute top tier.
const FREE_MODEL = "claude-haiku-4-5";
const PAID_MODEL = "claude-sonnet-5";

export const PLANS: Plan[] = [
  {
    id: "FREE",
    name: "Free",
    priceMonthly: 0,
    tagline: "Try it and find your favorite recipes.",
    generations: 50,
    savedRecipes: 10,
    model: FREE_MODEL,
    cta: "Start free",
    features: [
      "50 generations / month",
      "Up to 10 saved recipes",
      "Every generator — content & AI prompts",
      "Search, filters & favorites",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    priceMonthly: 15,
    tagline: "For creators & marketers who ship daily.",
    generations: 2000,
    savedRecipes: null,
    model: PAID_MODEL,
    cta: "Upgrade to Pro",
    highlighted: true,
    features: [
      "2,000 generations / month",
      "Unlimited saved recipes",
      "Best AI model — higher-quality output",
      "Version history on every recipe",
      "Priority support",
    ],
  },
  {
    id: "TEAM",
    name: "Team",
    priceMonthly: 49,
    tagline: "A shared prompt library for your whole team.",
    generations: 10000,
    savedRecipes: null,
    model: PAID_MODEL,
    cta: "Upgrade to Team",
    features: [
      "10,000 generations / month",
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

export function savedRecipeCap(plan: string) {
  return getPlan(plan).savedRecipes;
}

export function modelForPlan(plan: string) {
  return getPlan(plan).model;
}

/** Current metering period as YYYY-MM (UTC). */
export function currentPeriod(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}
