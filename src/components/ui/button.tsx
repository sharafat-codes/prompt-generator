import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const button = cva(
  "inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap rounded-sm transition-[background-color,box-shadow,border-color,transform] duration-150 active:translate-y-[0.5px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-accent text-white shadow-sm hover:bg-accent-hover",
        secondary:
          "bg-surface text-ink border border-hairline-2 shadow-sm hover:border-ink-3",
        ghost: "bg-transparent text-ink-2 hover:bg-surface-2 hover:text-ink",
      },
      size: {
        sm: "h-8 px-3 text-[12.5px]",
        md: "h-[38px] px-[15px] text-[13.5px]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(button({ variant, size }), className)} {...props} />;
}
