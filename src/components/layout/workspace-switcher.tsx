"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronsUpDown, Plus, Users } from "lucide-react";
import { switchWorkspace } from "@/server/actions/workspace-actions";
import { cn } from "@/lib/utils";

type Workspace = {
  id: string;
  name: string;
  type: "PERSONAL" | "TEAM";
  role: "OWNER" | "ADMIN" | "MEMBER";
  memberCount: number;
};

export function WorkspaceSwitcher({
  workspaces,
  currentId,
}: {
  workspaces: Workspace[];
  currentId: string | null;
}) {
  const [open, setOpen] = useState(false);
  if (workspaces.length === 0) return null;

  const current = workspaces.find((w) => w.id === currentId) ?? workspaces[0];

  return (
    <div className="relative mb-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-sm border border-hairline bg-surface px-2.5 py-2 text-left shadow-sm transition-colors hover:border-ink-3"
      >
        <span
          className={cn(
            "grid h-6 w-6 shrink-0 place-items-center rounded-[5px] text-[11px] font-semibold text-white",
            current.type === "TEAM" ? "bg-accent" : "bg-ink",
          )}
        >
          {current.type === "TEAM" ? <Users size={13} /> : current.name.trim()[0]?.toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold leading-tight">
            {current.name}
          </span>
          <span className="block text-[11px] text-ink-3">
            {current.type === "TEAM" ? `Team · ${current.memberCount} members` : "Personal"}
          </span>
        </span>
        <ChevronsUpDown size={14} className="shrink-0 text-ink-3" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 overflow-hidden rounded-md border border-hairline bg-surface p-1.5 shadow-lg">
            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-3">
              Workspaces
            </p>
            {workspaces.map((w) =>
              w.id === current.id ? (
                <div
                  key={w.id}
                  className="flex items-center gap-2 rounded-sm bg-mint px-2 py-1.5 text-sm text-accent-press"
                >
                  <span className="flex-1 truncate font-medium">{w.name}</span>
                  <Check size={14} className="text-accent" />
                </div>
              ) : (
                <form key={w.id} action={switchWorkspace}>
                  <input type="hidden" name="workspaceId" value={w.id} />
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm text-ink transition-colors hover:bg-surface-2"
                  >
                    <span className="flex-1 truncate">{w.name}</span>
                    {w.type === "TEAM" && (
                      <Users size={12} className="shrink-0 text-ink-3" />
                    )}
                  </button>
                </form>
              ),
            )}
            <div className="my-1 border-t border-hairline" />
            <Link
              href="/settings/team"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <Plus size={14} />
              Create or manage a team
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
