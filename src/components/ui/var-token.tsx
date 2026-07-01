import { cn } from "@/lib/utils";

/** The signature motif: a {variable} rendered as a mint mono pill. */
export function VarToken({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "font-mono text-[0.86em] text-accent-hover bg-mint border border-mint-line rounded-[5px] px-1.5 whitespace-nowrap",
        className,
      )}
    >
      {`{${name}}`}
    </span>
  );
}
