"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function InviteLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard blocked — the field is selectable as a fallback
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        className="min-w-0 flex-1 rounded-sm border border-hairline bg-ground px-2.5 py-2 font-mono text-[12px] text-ink-2 focus:outline-none"
      />
      <button
        type="button"
        onClick={copy}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-hairline bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-ink-3"
      >
        {copied ? <Check size={15} className="text-accent" /> : <Copy size={15} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
