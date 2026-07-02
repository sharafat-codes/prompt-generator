import Link from "next/link";
import { requireSession } from "@/server/context";
import { getUsageStatus } from "@/server/data/workspace";
import { UsageMeter } from "@/components/layout/usage-meter";

const PLAN_LABEL: Record<string, string> = { FREE: "Free", PRO: "Pro", TEAM: "Team" };

export default async function UsagePage() {
  const session = await requireSession();
  const workspaceId = session.user.workspaceId;
  const usage = workspaceId ? await getUsageStatus(workspaceId) : null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-serif text-2xl font-semibold tracking-[-0.015em]">Plan &amp; usage</h1>
      <p className="mt-2 mb-6 text-ink-2">
        You&apos;re on the {usage ? PLAN_LABEL[usage.plan] ?? usage.plan : "Free"} plan. Metering is
        enforced server-side on every generation.
      </p>
      {usage && (
        <div className="max-w-xs">
          <UsageMeter used={usage.used} limit={usage.limit} />
        </div>
      )}
      {usage?.plan !== "TEAM" && (
        <Link
          href="/pricing"
          className="mt-6 inline-flex h-10 items-center rounded-sm bg-accent px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-hover"
        >
          Compare plans &amp; upgrade →
        </Link>
      )}
    </div>
  );
}
