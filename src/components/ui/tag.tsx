import { cn } from "@/lib/utils";

type TagProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean };

export function Tag({ active = false, className, ...props }: TagProps) {
  return (
    <button
      type="button"
      data-active={active}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-[11px] py-[5px] border transition-colors cursor-pointer",
        active
          ? "bg-ink text-white border-ink"
          : "bg-surface text-ink-2 border-hairline hover:border-ink-3",
        className,
      )}
      {...props}
    />
  );
}
