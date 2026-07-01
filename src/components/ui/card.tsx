import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("bg-surface border border-hairline rounded-md shadow-sm", className)}
      {...props}
    />
  );
}
