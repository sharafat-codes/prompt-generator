"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { toggleStar } from "@/server/actions/prompt-actions";
import { cn } from "@/lib/utils";

export function StarButton({
  promptId,
  starred,
  size = 16,
}: {
  promptId: string;
  starred: boolean;
  size?: number;
}) {
  const [on, setOn] = useState(starred);
  const [, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label={on ? "Remove star" : "Star this prompt"}
      aria-pressed={on}
      onClick={(e) => {
        // The card is a link — don't navigate when toggling the star.
        e.preventDefault();
        e.stopPropagation();
        const next = !on;
        setOn(next); // optimistic
        startTransition(async () => {
          try {
            await toggleStar(promptId);
          } catch {
            setOn(!next); // revert on failure
          }
        });
      }}
      className="shrink-0 cursor-pointer rounded-sm p-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <Star
        size={size}
        className={cn(
          "transition-colors",
          on ? "fill-star text-star" : "text-ink-3 hover:text-ink-2",
        )}
      />
    </button>
  );
}
