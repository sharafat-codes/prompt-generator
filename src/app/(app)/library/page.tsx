import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { requireSession } from "@/server/context";
import { listPrompts } from "@/server/data/prompts";
import { PromptCard } from "@/components/prompt/prompt-card";
import { Button } from "@/components/ui/button";

export default async function LibraryPage() {
  const session = await requireSession();
  const workspaceId = session.user.workspaceId;
  const prompts = workspaceId ? await listPrompts(workspaceId, session.user.id) : [];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center gap-3.5 border-b border-hairline px-6 py-4">
        <h1 className="font-serif text-xl font-semibold tracking-[-0.01em]">Library</h1>
        {prompts.length > 0 && (
          <span className="text-sm text-ink-3 tabular-nums">{prompts.length}</span>
        )}
        <div className="flex-1" />
        <Link href="/create">
          <Button size="sm">
            <Plus size={15} strokeWidth={2.4} />
            New prompt
          </Button>
        </Link>
      </header>

      <div className="flex-1 p-6">
        {prompts.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-mint text-accent">
              <Sparkles size={22} />
            </span>
            <h2 className="mt-5 font-serif text-xl font-semibold tracking-[-0.01em]">
              Your library is empty
            </h2>
            <p className="mt-2 text-ink-2">
              Create your first prompt and it&apos;ll be saved here as a reusable recipe you can
              re-run anytime.
            </p>
            <Link href="/create" className="mt-6">
              <Button>
                <Plus size={16} strokeWidth={2.4} />
                Create a prompt
              </Button>
            </Link>
          </div>
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
