import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-[0.02em] text-accent bg-mint border border-mint-line rounded-full px-2.5 py-0.5",
        className,
      )}
      {...props}
    />
  );
}
