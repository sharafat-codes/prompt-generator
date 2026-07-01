import { parseTemplate } from "@/lib/variables";
import { VarToken } from "@/components/ui/var-token";
import { cn } from "@/lib/utils";

/** Renders a prompt template with its {variable} tokens highlighted. */
export function TemplatePreview({
  template,
  className,
}: {
  template: string;
  className?: string;
}) {
  return (
    <span className={cn("font-mono", className)}>
      {parseTemplate(template).map((segment, i) =>
        segment.type === "text" ? (
          <span key={i}>{segment.value}</span>
        ) : (
          <VarToken key={i} name={segment.name} />
        ),
      )}
    </span>
  );
}
