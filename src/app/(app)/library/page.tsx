import { Search } from "lucide-react";
import { Tag } from "@/components/ui/tag";
import { Button } from "@/components/ui/button";
import { PromptCard } from "@/components/prompt/prompt-card";
import { MOCK_PROMPTS, LIBRARY_FILTERS } from "@/lib/mock-data";

export default function LibraryPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* header */}
      <header className="flex items-center gap-3.5 border-b border-hairline px-6 py-4">
        <h1 className="font-serif text-xl font-semibold tracking-[-0.01em]">Library</h1>
        <div className="flex max-w-[340px] flex-1 items-center gap-2.5 rounded-md border border-hairline bg-surface-2 px-3 py-2 text-[13.5px] text-ink-3">
          <Search size={15} />
          Search prompts…
        </div>
        <div className="flex-1" />
        <Button variant="secondary" size="sm">
          Sort: Recent
        </Button>
      </header>

      {/* body */}
      <div className="flex-1 p-6">
        <div className="mb-5 flex flex-wrap gap-2">
          {LIBRARY_FILTERS.map((filter, i) => (
            <Tag key={filter} active={i === 0}>
              {filter}
            </Tag>
          ))}
          <Tag>⭐ Starred</Tag>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_PROMPTS.map((prompt) => (
            <PromptCard key={prompt.slug} prompt={prompt} />
          ))}
        </div>
      </div>
    </div>
  );
}
