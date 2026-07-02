"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Plus, Star } from "lucide-react";
import { Mark } from "./mark";
import { UsageMeter } from "./usage-meter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SidebarUser = { name: string; email?: string | null; planLabel?: string };
type SidebarStats = {
  promptCount: number;
  starredCount: number;
  savedRecipesCap: number | null;
  generationsUsed: number;
  generationsLimit: number;
};

export function Sidebar({ user, stats }: { user?: SidebarUser; stats?: SidebarStats }) {
  const pathname = usePathname();
  const name = user?.name ?? "You";
  const planLabel = user?.planLabel ?? "Free plan";
  const initial = (name.trim()[0] ?? "P").toUpperCase();
  const libraryActive = pathname === "/library";

  return (
    <aside className="sticky top-0 flex h-screen w-[240px] shrink-0 flex-col border-r border-hairline bg-ground px-3.5 py-4">
      <Link href="/library" className="flex items-center gap-2.5 px-2 pb-4 pt-1.5">
        <Mark size={26} />
        <span className="text-[15px] font-semibold tracking-[-0.01em]">PromptPilot</span>
      </Link>

      <Link href="/create" className="mb-1.5 block">
        <Button className="w-full">
          <Plus size={16} strokeWidth={2.4} />
          New prompt
        </Button>
      </Link>

      <nav className="flex flex-col gap-0.5">
        <Link
          href="/library"
          className={cn(
            "flex items-center gap-[11px] rounded-sm px-2.5 py-2 text-sm font-medium transition-colors",
            libraryActive
              ? "bg-mint text-accent-press"
              : "text-ink-2 hover:bg-surface-2 hover:text-ink",
          )}
        >
          <LayoutGrid size={16} className={libraryActive ? "text-accent" : "opacity-80"} />
          Library
          {stats && (
            <span className="ml-auto text-xs text-ink-3 tabular-nums">
              {stats.savedRecipesCap != null
                ? `${stats.promptCount}/${stats.savedRecipesCap}`
                : stats.promptCount}
            </span>
          )}
        </Link>

        <Link
          href="/library?view=starred"
          className="flex items-center gap-[11px] rounded-sm px-2.5 py-2 text-sm font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <Star size={16} className="opacity-80" />
          Starred
          {stats && (
            <span className="ml-auto text-xs text-ink-3 tabular-nums">{stats.starredCount}</span>
          )}
        </Link>
      </nav>

      <div className="mt-auto flex flex-col gap-3 pt-4">
        {stats && (
          <UsageMeter used={stats.generationsUsed} limit={stats.generationsLimit} />
        )}
        <Link
          href="/settings"
          className="flex items-center gap-2.5 rounded-md p-2 transition-colors hover:bg-surface-2"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent text-xs font-semibold text-white">
            {initial}
          </span>
          <span className="leading-tight">
            <span className="block text-[13px] font-semibold">{name}</span>
            <span className="block text-[11.5px] text-ink-3">{planLabel}</span>
          </span>
        </Link>
      </div>
    </aside>
  );
}
