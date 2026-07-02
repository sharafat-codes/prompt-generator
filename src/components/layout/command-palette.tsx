"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  LayoutGrid,
  Star,
  Settings,
  CreditCard,
  FileText,
  CornerDownLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Item = {
  id: string;
  label: string;
  href: string;
  icon: ReactNode;
  hint?: string;
  keywords?: string;
};

export function CommandPalette({ prompts }: { prompts: { title: string; slug: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("openCommandPalette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("openCommandPalette", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
    }
  }, [open]);

  const actions: Item[] = [
    { id: "new", label: "New prompt", href: "/create", icon: <Plus size={16} />, keywords: "create generate" },
    { id: "library", label: "Library", href: "/library", icon: <LayoutGrid size={16} /> },
    { id: "starred", label: "Starred", href: "/library?view=starred", icon: <Star size={16} /> },
    { id: "billing", label: "Plan & usage", href: "/settings/usage", icon: <CreditCard size={16} />, keywords: "upgrade billing plan" },
    { id: "settings", label: "Settings", href: "/settings", icon: <Settings size={16} /> },
  ];
  const promptItems: Item[] = prompts.map((p) => ({
    id: `p-${p.slug}`,
    label: p.title,
    href: `/p/${p.slug}`,
    icon: <FileText size={16} />,
    hint: "Prompt",
  }));

  const query = q.trim().toLowerCase();
  const match = (it: Item) =>
    !query || `${it.label} ${it.keywords ?? ""}`.toLowerCase().includes(query);
  const filtered = [...actions.filter(match), ...promptItems.filter(match).slice(0, 8)];
  const activeItem = filtered[Math.min(active, filtered.length - 1)];

  function go(item: Item | undefined) {
    if (!item) return;
    setOpen(false);
    router.push(item.href);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-ink/30 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-lg border border-hairline bg-surface shadow-lg">
        <div className="flex items-center gap-2.5 border-b border-hairline px-4">
          <Search size={16} className="text-ink-3" />
          <input
            autoFocus
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((i) => Math.min(i + 1, filtered.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                go(activeItem);
              }
            }}
            placeholder="Search prompts or jump to…"
            className="h-12 w-full bg-transparent text-[15px] text-ink placeholder:text-ink-3 focus:outline-none"
          />
          <kbd className="rounded border border-hairline px-1.5 py-0.5 font-mono text-[10px] text-ink-3">
            esc
          </kbd>
        </div>

        <ul className="max-h-[52vh] overflow-y-auto p-1.5">
          {filtered.length === 0 && (
            <li className="px-3 py-8 text-center text-sm text-ink-3">No matches</li>
          )}
          {filtered.map((it, i) => (
            <li key={it.id}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(it)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm",
                  i === active ? "bg-mint text-accent-press" : "text-ink hover:bg-surface-2",
                )}
              >
                <span className={i === active ? "text-accent" : "text-ink-3"}>{it.icon}</span>
                <span className="flex-1 truncate">{it.label}</span>
                {it.hint && <span className="text-[11px] text-ink-3">{it.hint}</span>}
                {i === active && <CornerDownLeft size={13} className="text-ink-3" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
