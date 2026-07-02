"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Check, Plus } from "lucide-react";
import { clonePublicPrompt } from "@/server/actions/prompt-actions";
import { Button } from "@/components/ui/button";

export function PublicPromptActions({
  publicSlug,
  template,
  canSave,
}: {
  publicSlug: string;
  template: string;
  canSave: boolean;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);

  async function copyRecipe() {
    await navigator.clipboard.writeText(template);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function save() {
    startTransition(async () => {
      const result = await clonePublicPrompt(publicSlug);
      if ("error" in result) {
        setNotice(
          result.error === "recipe_limit"
            ? "You've hit your saved-recipe limit — upgrade to save more."
            : "Couldn't save this prompt. Please try again.",
        );
        return;
      }
      router.push(`/p/${result.slug}`);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2.5">
        <Button variant="secondary" onClick={copyRecipe}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "Copied" : "Copy recipe"}
        </Button>
        {canSave ? (
          <Button onClick={save} disabled={pending}>
            <Plus size={16} />
            {pending ? "Saving…" : "Save to my library"}
          </Button>
        ) : (
          <Link
            href="/login"
            className="inline-flex h-[38px] items-center gap-2 rounded-sm bg-accent px-[15px] text-[13.5px] font-semibold text-white shadow-sm transition-colors hover:bg-accent-hover"
          >
            <Plus size={16} />
            Sign up free to save &amp; use it
          </Link>
        )}
      </div>
      {notice && (
        <p className="text-[13px] text-ink-2">
          {notice}{" "}
          <Link href="/settings/usage" className="font-semibold text-accent hover:text-accent-hover">
            View plans
          </Link>
        </p>
      )}
    </div>
  );
}
