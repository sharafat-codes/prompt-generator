import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { PLANS } from "@/lib/plans";
import { SITE_URL } from "@/lib/site";
import { SiteHeader, SiteFooter } from "@/components/marketing/chrome";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, honest pricing for PromptPilot. Start free with 200 generations a month, or upgrade to Pro and Team for more volume, version history, and team features.",
  alternates: { canonical: `${SITE_URL}/pricing` },
};

const FAQ = [
  {
    q: "What counts as a generation?",
    a: "Every time you generate a result — in the Create flow or by re-running a saved recipe — counts as one generation. Saving and editing recipes is always free.",
  },
  {
    q: "Can I change plans anytime?",
    a: "Yes. Upgrade or downgrade whenever you like from your account — changes take effect immediately.",
  },
  {
    q: "What happens if I hit my limit?",
    a: "Generation pauses until the next month, or until you upgrade. Your saved recipes and library are never touched.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="mx-auto max-w-3xl px-6 pb-4 pt-16 text-center sm:pt-24">
        <h1 className="text-balance font-serif text-4xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-5xl">
          Simple, honest pricing
        </h1>
        <p className="mx-auto mt-5 max-w-[48ch] text-lg leading-relaxed text-ink-2">
          Start free and keep your best prompts forever. Upgrade when you&apos;re generating enough
          that it pays for itself.
        </p>
      </section>

      {/* tiers */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid items-start gap-5 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "flex flex-col rounded-lg border bg-surface p-6",
                plan.highlighted
                  ? "border-accent shadow-lg ring-1 ring-accent/20"
                  : "border-hairline shadow-sm",
              )}
            >
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl font-semibold tracking-[-0.01em]">{plan.name}</h2>
                {plan.highlighted && (
                  <span className="rounded-full bg-mint px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.04em] text-accent">
                    Popular
                  </span>
                )}
              </div>
              <p className="mt-1.5 min-h-[40px] text-sm text-ink-2">{plan.tagline}</p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-serif text-4xl font-semibold tracking-[-0.02em]">
                  ${plan.priceMonthly}
                </span>
                <span className="text-sm text-ink-3">/ month</span>
              </div>

              <Link
                href="/login"
                className={cn(
                  "mt-5 inline-flex h-11 items-center justify-center rounded-sm px-5 text-[15px] font-semibold shadow-sm transition-colors",
                  plan.highlighted
                    ? "bg-accent text-white hover:bg-accent-hover"
                    : "border border-hairline-2 bg-surface text-ink hover:border-ink-3",
                )}
              >
                {plan.cta}
              </Link>

              <ul className="mt-6 flex flex-col gap-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[14px] text-ink">
                    <Check size={16} className="mt-0.5 shrink-0 text-accent" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-[13px] text-ink-3">
          Prices in USD. Upgrade or cancel anytime from your account.
        </p>
      </section>

      {/* faq */}
      <section className="border-t border-hairline bg-surface/40">
        <div className="mx-auto max-w-2xl px-6 py-16">
          <h2 className="text-center font-serif text-2xl font-semibold tracking-[-0.015em]">
            Questions
          </h2>
          <div className="mt-8 flex flex-col gap-6">
            {FAQ.map((item) => (
              <div key={item.q}>
                <h3 className="text-[15px] font-semibold">{item.q}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
