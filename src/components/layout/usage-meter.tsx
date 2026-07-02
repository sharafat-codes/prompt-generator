import Link from "next/link";
import { cn } from "@/lib/utils";

/** Freemium usage, shown quietly in the sidebar. Bar turns amber near the limit. */
export function UsageMeter({ used, limit }: { used: number; limit: number }) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const near = pct >= 85;

  return (
    <div className="rounded-md border border-hairline bg-surface p-3">
      <div className="mb-2 flex items-center justify-between text-xs text-ink-2">
        <span>Generations this month</span>
        <b className="font-semibold text-ink tabular-nums">
          {used} / {limit}
        </b>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div
          className={cn("h-full rounded-full", near ? "bg-amber" : "bg-accent")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <Link
        href="/pricing"
        className="mt-2.5 block text-xs font-semibold text-accent hover:text-accent-hover"
      >
        Upgrade to Pro →
      </Link>
    </div>
  );
}
