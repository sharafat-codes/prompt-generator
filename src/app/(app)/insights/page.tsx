import Link from "next/link";
import { requireSession } from "@/server/context";
import { getInsights } from "@/server/data/insights";
import { RunsChart } from "@/components/insights/runs-chart";
import { Card } from "@/components/ui/card";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-hairline bg-surface p-5 shadow-sm">
      <div className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-3">
        {label}
      </div>
      <div className="mt-2 font-serif text-3xl font-semibold tabular-nums tracking-[-0.02em]">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

export default async function InsightsPage() {
  const session = await requireSession();
  const workspaceId = session.user.workspaceId;
  const data = workspaceId ? await getInsights(workspaceId) : null;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-hairline px-6 py-4">
        <h1 className="font-serif text-xl font-semibold tracking-[-0.01em]">Insights</h1>
      </header>

      <div className="mx-auto w-full max-w-4xl flex-1 p-6">
        {!data ? (
          <p className="text-ink-2">No workspace found.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Stat label="Saved recipes" value={data.totalPrompts} />
              <Stat label="Generations this month" value={data.runsThisMonth} />
              <Stat label="Total generations" value={data.totalRuns} />
            </div>

            <Card className="mt-4 p-5">
              <div className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-ink-3">
                Generations · last 14 days
              </div>
              <RunsChart daily={data.daily} />
            </Card>

            <Card className="mt-4 p-5">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-ink-3">
                Most-used recipes
              </div>
              {data.topPrompts.length === 0 ? (
                <p className="text-sm text-ink-2">
                  Run some prompts and your most-used recipes will show up here.
                </p>
              ) : (
                <ul className="flex flex-col divide-y divide-hairline">
                  {data.topPrompts.map((p, i) => (
                    <li key={p.slug} className="flex items-center gap-3 py-2.5 text-sm">
                      <span className="w-5 font-mono text-[12px] text-ink-3">{i + 1}</span>
                      <Link
                        href={`/p/${p.slug}`}
                        className="flex-1 truncate font-medium hover:text-accent"
                      >
                        {p.title}
                      </Link>
                      <span className="tabular-nums text-ink-3">
                        {p.runs} run{p.runs === 1 ? "" : "s"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
