import { Suspense } from "react";
import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { requireSession } from "@/server/context";
import { listPrompts } from "@/server/data/prompts";
import { PromptCard } from "@/components/prompt/prompt-card";
import { LibrarySearch } from "@/components/library/library-search";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; view?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const starredOnly = sp.view === "starred";
  const filtering = Boolean(q || starredOnly);

  const session = await requireSession();
  const workspaceId = session.user.workspaceId;
  const prompts = workspaceId
    ? await listPrompts(workspaceId, session.user.id, { q, starredOnly })
    : [];

  const pillHref = (view?: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (view) params.set("view", view);
    const qs = params.toString();
    return qs ? `/library?${qs}` : "/library";
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center gap-3.5 border-b border-hairline px-6 py-4">
        <h1 className="font-serif text-xl font-semibold tracking-[-0.01em]">Library</h1>
        <div className="flex-1" />
        <Link href="/create">
          <Button size="sm">
            <Plus size={15} strokeWidth={2.4} />
            New prompt
          </Button>
        </Link>
      </header>

      <div className="flex flex-wrap items-center gap-3 px-6 pt-5">
        <Suspense
          fallback={
            <div className="h-[38px] w-full max-w-[340px] flex-1 rounded-md border border-hairline bg-surface-2" />
          }
        >
          <LibrarySearch />
        </Suspense>
        <div className="flex gap-2">
          <FilterPill href={pillHref(undefined)} active={!starredOnly}>
            All
          </FilterPill>
          <FilterPill href={pillHref("starred")} active={starredOnly}>
            ⭐ Starred
          </FilterPill>
        </div>
      </div>

      <div className="flex-1 p-6">
        {prompts.length === 0 ? (
          filtering ? (
            <NoResults />
          ) : (
            <EmptyLibrary />
          )
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {prompts.map((prompt) => (
              <PromptCard key={prompt.slug} prompt={prompt} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-[11px] py-[5px] text-xs font-medium transition-colors",
        active
          ? "border-ink bg-ink text-white"
          : "border-hairline bg-surface text-ink-2 hover:border-ink-3",
      )}
    >
      {children}
    </Link>
  );
}

function NoResults() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center">
      <h2 className="font-serif text-lg font-semibold tracking-[-0.01em]">No matches</h2>
      <p className="mt-2 text-ink-2">Nothing here matches your search or filter.</p>
      <Link
        href="/library"
        className="mt-4 text-sm font-semibold text-accent hover:text-accent-hover"
      >
        Clear filters
      </Link>
    </div>
  );
}

function EmptyLibrary() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-lg bg-mint text-accent">
        <Sparkles size={22} />
      </span>
      <h2 className="mt-5 font-serif text-xl font-semibold tracking-[-0.01em]">
        Your library is empty
      </h2>
      <p className="mt-2 text-ink-2">
        Create your first prompt and it&apos;ll be saved here as a reusable recipe you can re-run
        anytime.
      </p>
      <Link href="/create" className="mt-6">
        <Button>
          <Plus size={16} strokeWidth={2.4} />
          Create a prompt
        </Button>
      </Link>
    </div>
  );
}
