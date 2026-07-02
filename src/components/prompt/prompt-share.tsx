"use client";

import { useState, useTransition } from "react";
import { Globe, Lock, Copy, Check } from "lucide-react";
import { togglePromptVisibility } from "@/server/actions/prompt-actions";
import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/lib/site";

export function PromptShare({
  promptId,
  initialVisibility,
  initialPublicSlug,
}: {
  promptId: string;
  initialVisibility: "PRIVATE" | "PUBLIC";
  initialPublicSlug: string | null;
}) {
  const [visibility, setVisibility] = useState(initialVisibility);
  const [publicSlug, setPublicSlug] = useState(initialPublicSlug);
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const isPublic = visibility === "PUBLIC";
  const url = publicSlug ? `${SITE_URL}/s/${publicSlug}` : "";

  function toggle() {
    startTransition(async () => {
      const result = await togglePromptVisibility(promptId);
      setVisibility(result.visibility);
      setPublicSlug(result.publicSlug);
    });
  }

  async function copyLink() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mt-4 rounded-md border border-hairline bg-surface-2 p-3.5">
      <div className="flex items-center gap-3">
        <span className="text-ink-3">{isPublic ? <Globe size={16} /> : <Lock size={16} />}</span>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold">
            {isPublic ? "Public — anyone with the link" : "Private"}
          </div>
          <div className="text-[12px] text-ink-3">
            {isPublic
              ? "Shared as a public page others can copy or save."
              : "Only you can see this recipe."}
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={toggle} disabled={pending}>
          {pending ? "…" : isPublic ? "Make private" : "Share publicly"}
        </Button>
      </div>

      {isPublic && url && (
        <div className="mt-3 flex items-center gap-2 rounded-sm border border-hairline bg-surface px-2.5 py-1.5">
          <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-ink-2">{url}</span>
          <button
            type="button"
            onClick={copyLink}
            aria-label="Copy link"
            className="shrink-0 cursor-pointer text-ink-3 hover:text-ink"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      )}
    </div>
  );
}
