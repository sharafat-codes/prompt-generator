import Link from "next/link";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TemplatePreview } from "@/components/prompt/template-preview";
import type { PromptListItem } from "@/lib/prompt-types";
import { cn } from "@/lib/utils";

export function PromptCard({ prompt }: { prompt: PromptListItem }) {
  const { variableCount: vars } = prompt;
  return (
    <Link href={`/p/${prompt.slug}`} className="group block">
      <Card className="flex h-full flex-col gap-[11px] p-4 transition-[box-shadow,transform,border-color] duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:border-hairline-2">
        <div className="flex items-start justify-between gap-2.5">
          <h3 className="text-[15px] font-semibold tracking-[-0.01em] leading-snug">
            {prompt.title}
          </h3>
          <Star
            size={16}
            className={cn(
              "shrink-0 mt-0.5",
              prompt.starred ? "fill-star text-star" : "text-ink-3",
            )}
          />
        </div>

        <div className="rounded-sm border border-hairline bg-surface-2 px-[11px] py-2.5">
          <p className="line-clamp-2 text-[11.5px] leading-[1.7] text-ink-2">
            <TemplatePreview template={prompt.template} />
          </p>
        </div>

        <div className="mt-auto flex items-center gap-2.5 text-xs text-ink-3">
          <Badge>
            {vars} var{vars === 1 ? "" : "s"}
          </Badge>
          <span className="ml-auto tabular-nums">
            {prompt.runCount === 0 ? "Not run yet" : `Run ${prompt.runCount}×`}
          </span>
        </div>
      </Card>
    </Link>
  );
}
