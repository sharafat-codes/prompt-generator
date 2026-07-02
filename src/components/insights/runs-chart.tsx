"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

function label(dateKey: string) {
  return new Date(`${dateKey}T00:00:00Z`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function RunsChart({ daily }: { daily: { date: string; count: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...daily.map((d) => d.count));

  return (
    <div>
      <div className="flex h-40 items-end gap-1.5">
        {daily.map((d, i) => {
          const pct = (d.count / max) * 100;
          return (
            <div
              key={d.date}
              className="relative flex h-full flex-1 flex-col justify-end"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              {hover === i && (
                <div className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] text-white shadow-md">
                  {d.count} run{d.count === 1 ? "" : "s"} · {label(d.date)}
                </div>
              )}
              <div
                className={cn(
                  "w-full rounded-t-[4px] transition-colors",
                  hover === i ? "bg-accent-hover" : "bg-accent",
                  d.count === 0 && "bg-hairline-2",
                )}
                style={{ height: `${d.count === 0 ? 2 : Math.max(pct, 5)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-ink-3">
        <span>{label(daily[0]?.date ?? "")}</span>
        <span>{label(daily[daily.length - 1]?.date ?? "")}</span>
      </div>
    </div>
  );
}
