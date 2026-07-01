"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Clock, Star, Plus, Hash } from "lucide-react";
import { Mark } from "./mark";
import { UsageMeter } from "./usage-meter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/library", label: "Library", icon: LayoutGrid, count: 142 },
  { href: "/library?view=recent", label: "Recent", icon: Clock },
  { href: "/library?view=starred", label: "Starred", icon: Star, count: 9 },
];

const TAGS = ["Email", "Ads", "Social"];

type SidebarUser = { name: string; email?: string | null; plan?: string };

export function Sidebar({ user }: { user?: SidebarUser }) {
  const pathname = usePathname();
  const name = user?.name ?? "Shah";
  const plan = user?.plan ?? "Free plan";
  const initial = (name.trim()[0] ?? "P").toUpperCase();

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
        {NAV.map((item) => {
          const active = pathname === item.href.split("?")[0] && item.href === "/library";
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-[11px] rounded-sm px-2.5 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-mint text-accent-press"
                  : "text-ink-2 hover:bg-surface-2 hover:text-ink",
              )}
            >
              <Icon size={16} className={active ? "text-accent" : "opacity-80"} />
              {item.label}
              {item.count != null && (
                <span className="ml-auto text-xs text-ink-3 tabular-nums">{item.count}</span>
              )}
            </Link>
          );
        })}

        <div className="px-2.5 pb-1.5 pt-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
          Tags
        </div>
        {TAGS.map((tag) => (
          <Link
            key={tag}
            href={`/library?tag=${tag.toLowerCase()}`}
            className="flex items-center gap-[11px] rounded-sm px-2.5 py-2 text-sm font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <Hash size={15} className="opacity-70" />
            {tag}
          </Link>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-3 pt-4">
        <UsageMeter used={142} limit={200} />
        <Link
          href="/settings"
          className="flex items-center gap-2.5 rounded-md p-2 transition-colors hover:bg-surface-2"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent text-xs font-semibold text-white">
            {initial}
          </span>
          <span className="leading-tight">
            <span className="block text-[13px] font-semibold">{name}</span>
            <span className="block text-[11.5px] text-ink-3">{plan}</span>
          </span>
        </Link>
      </div>
    </aside>
  );
}
