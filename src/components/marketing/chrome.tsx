import Link from "next/link";
import { Mark } from "@/components/layout/mark";

export const CTA_PRIMARY =
  "inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-accent px-5 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-ground/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Mark size={28} />
          <span className="text-[16px] font-semibold tracking-[-0.01em]">PromptPilot</span>
        </Link>
        <div className="flex items-center gap-5">
          <Link href="/pricing" className="text-sm font-semibold text-ink-2 hover:text-ink">
            Pricing
          </Link>
          <Link
            href="/login"
            className="rounded-sm border border-hairline-2 bg-surface px-4 py-2 text-sm font-semibold text-ink shadow-sm transition-colors hover:border-ink-3"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-ink-3 sm:flex-row">
        <Link href="/" className="flex items-center gap-2">
          <Mark size={22} />
          <span className="font-semibold text-ink-2">PromptPilot</span>
        </Link>
        <div className="flex items-center gap-5">
          <Link href="/tools" className="hover:text-ink-2">
            Generators
          </Link>
          <Link href="/pricing" className="hover:text-ink-2">
            Pricing
          </Link>
          <Link href="/login" className="font-semibold text-ink-2 hover:text-ink">
            Sign in
          </Link>
        </div>
      </div>
    </footer>
  );
}
