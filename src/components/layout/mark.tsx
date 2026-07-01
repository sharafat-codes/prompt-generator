import { cn } from "@/lib/utils";

/** PromptPilot mark: a command prompt ">_" set in a pine tile. */
export function Mark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-grid place-items-center rounded-[8px] bg-accent shadow-sm",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
        <path
          d="M7 7l5 5-5 5"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M13 17h5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </span>
  );
}
