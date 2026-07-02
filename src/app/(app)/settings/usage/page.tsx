import Link from "next/link";
import { requireSession } from "@/server/context";
import { getUsageStatus } from "@/server/data/workspace";
import { getPlan, PLANS } from "@/lib/plans";
import { stripeConfigured } from "@/lib/stripe";
import { startCheckout, openBillingPortal } from "@/server/actions/billing-actions";
import { UsageMeter } from "@/components/layout/usage-meter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function UsagePage() {
  const session = await requireSession();
  const workspaceId = session.user.workspaceId;
  const usage = workspaceId ? await getUsageStatus(workspaceId) : null;
  const current = getPlan(usage?.plan ?? "FREE");
  const billingOn = stripeConfigured();
  const isPaid = current.id !== "FREE";
  const upgradeTargets = PLANS.filter((p) => p.id !== "FREE" && p.id !== current.id);

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-serif text-2xl font-semibold tracking-[-0.015em]">Plan &amp; usage</h1>
      <p className="mt-2 mb-6 text-ink-2">
        You&apos;re on the <span className="font-semibold text-ink">{current.name}</span> plan.
        Metering is enforced on every generation.
      </p>

      {usage && (
        <div className="max-w-xs">
          <UsageMeter used={usage.used} limit={usage.limit} />
        </div>
      )}

      <div className="mt-8">
        {!billingOn ? (
          <Card className="p-5 text-sm text-ink-2">
            Paid plans aren&apos;t switched on yet. Browse the{" "}
            <Link href="/pricing" className="font-semibold text-accent hover:text-accent-hover">
              plans
            </Link>{" "}
            in the meantime.
          </Card>
        ) : isPaid ? (
          <form action={openBillingPortal}>
            <Button variant="secondary" size="sm" type="submit">
              Manage billing
            </Button>
          </form>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-3">
              Upgrade
            </div>
            <div className="flex flex-wrap gap-3">
              {upgradeTargets.map((plan) => (
                <form key={plan.id} action={startCheckout.bind(null, plan.id)}>
                  <Button
                    type="submit"
                    size="sm"
                    variant={plan.highlighted ? "primary" : "secondary"}
                  >
                    {plan.cta} — ${plan.priceMonthly}/mo
                  </Button>
                </form>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
