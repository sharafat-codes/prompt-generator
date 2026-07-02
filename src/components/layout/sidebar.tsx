"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Plus, Star, Search, Menu, X, BarChart3 } from "lucide-react";
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

const openPalette = () => window.dispatchEvent(new Event("openCommandPalette"));

export function Sidebar({ user, stats }: { user?: SidebarUser; stats?: SidebarStats }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const name = user?.name ?? "You";
  const planLabel = user?.planLabel ?? "Free plan";
  const initial = (name.trim()[0] ?? "P").toUpperCase();
  const libraryActive = pathname === "/library";

  return (
    <>
      {/* mobile top bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-hairline bg-ground px-4 lg:hidden">
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="text-ink-2">
          <Menu size={20} />
        </button>
        <Link href="/library" className="flex items-center gap-2">
          <Mark size={24} />
          <span className="font-semibold tracking-[-0.01em]">PromptPilot</span>
        </Link>
        <button onClick={openPalette} aria-label="Search" className="ml-auto text-ink-2">
          <Search size={18} />
        </button>
      </div>

      {/* drawer backdrop (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "flex w-[240px] shrink-0 flex-col border-r border-hairline bg-ground px-3.5 py-4",
          "max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50 max-lg:w-[264px] max-lg:transition-transform",
          open ? "max-lg:translate-x-0" : "max-lg:-translate-x-full",
          "lg:sticky lg:top-0 lg:h-screen",
        )}
      >
        {/* mobile drawer header */}
        <div className="mb-3 flex items-center justify-between px-1 lg:hidden">
          <Link href="/library" className="flex items-center gap-2">
            <Mark size={24} />
            <span className="font-semibold tracking-[-0.01em]">PromptPilot</span>
          </Link>
          <button onClick={() => setOpen(false)} aria-label="Close menu" className="text-ink-3">
            <X size={18} />
          </button>
        </div>

        {/* desktop brand */}
        <Link href="/library" className="hidden items-center gap-2.5 px-2 pb-4 pt-1.5 lg:flex">
          <Mark size={26} />
          <span className="text-[15px] font-semibold tracking-[-0.01em]">PromptPilot</span>
        </Link>

        <Link href="/create" className="mb-2 block">
          <Button className="w-full">
            <Plus size={16} strokeWidth={2.4} />
            New prompt
          </Button>
        </Link>

        <button
          onClick={openPalette}
          className="mb-2 flex items-center gap-2.5 rounded-sm border border-hairline bg-surface px-2.5 py-2 text-sm text-ink-3 shadow-sm transition-colors hover:border-ink-3"
        >
          <Search size={15} />
          <span>Search…</span>
          <kbd className="ml-auto rounded border border-hairline px-1.5 py-0.5 font-mono text-[10px]">
            ⌘K
          </kbd>
        </button>

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

          <Link
            href="/insights"
            className={cn(
              "flex items-center gap-[11px] rounded-sm px-2.5 py-2 text-sm font-medium transition-colors",
              pathname === "/insights"
                ? "bg-mint text-accent-press"
                : "text-ink-2 hover:bg-surface-2 hover:text-ink",
            )}
          >
            <BarChart3 size={16} className={pathname === "/insights" ? "text-accent" : "opacity-80"} />
            Insights
          </Link>
        </nav>

        <div className="mt-auto flex flex-col gap-3 pt-4">
          {stats && <UsageMeter used={stats.generationsUsed} limit={stats.generationsLimit} />}
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
    </>
  );
}
