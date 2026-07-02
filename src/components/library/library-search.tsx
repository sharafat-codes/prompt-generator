"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

/** Debounced search box that syncs `?q=` into the URL (server re-queries). */
export function LibrarySearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    const handle = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (q) params.set("q", q);
      else params.delete("q");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, 250);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="flex w-full max-w-[340px] flex-1 items-center gap-2.5 rounded-md border border-hairline bg-surface-2 px-3 py-2 text-[13.5px] text-ink transition-[border-color,box-shadow] focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--color-mint)]">
      <Search size={15} className="shrink-0 text-ink-3" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search prompts…"
        className="w-full bg-transparent placeholder:text-ink-3 focus:outline-none"
      />
    </div>
  );
}
