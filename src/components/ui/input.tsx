import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full bg-surface border border-hairline-2 rounded-md px-[13px] py-[11px] text-sm text-ink font-sans placeholder:text-ink-3 transition-[border-color,box-shadow] focus-visible:outline-none focus-visible:border-accent focus-visible:shadow-[0_0_0_3px_var(--color-mint)]",
        className,
      )}
      {...props}
    />
  );
}
