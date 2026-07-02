import Link from "next/link";
import { Mark } from "@/components/layout/mark";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Mark size={40} />
      <p className="mt-6 font-mono text-[13px] uppercase tracking-[0.14em] text-accent">404</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold tracking-[-0.02em]">Page not found</h1>
      <p className="mt-3 max-w-[42ch] text-ink-2">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-sm bg-accent px-5 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-accent-hover"
        >
          Go home
        </Link>
        <Link
          href="/library"
          className="inline-flex h-11 items-center rounded-sm border border-hairline-2 bg-surface px-5 text-[15px] font-semibold text-ink shadow-sm transition-colors hover:border-ink-3"
        >
          Your library
        </Link>
      </div>
    </div>
  );
}
