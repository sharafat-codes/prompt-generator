import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { TemplatePreview } from "@/components/prompt/template-preview";
import { MOCK_PROMPTS } from "@/lib/mock-data";

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const prompt = MOCK_PROMPTS.find((p) => p.slug === slug);
  if (!prompt) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-9">
      <div className="mb-3 text-[12.5px] text-ink-3">
        <Link href="/library" className="font-medium text-ink-2 hover:text-ink">
          Library
        </Link>{" "}
        / {prompt.title}
      </div>

      <div className="flex items-center gap-3">
        <h1 className="font-serif text-[26px] font-semibold tracking-[-0.015em]">
          {prompt.title}
        </h1>
        <Badge>v1</Badge>
      </div>
      <p className="mt-1 text-sm text-ink-2">
        Reused {prompt.runs} times · {prompt.tag}
      </p>

      <div className="mt-6 rounded-md border border-hairline bg-surface-2 px-[18px] py-4 text-[13.5px] leading-[1.85]">
        <TemplatePreview template={prompt.template} />
      </div>

      <p className="mt-6 text-ink-2">
        The run screen — where these tokens become fields you fill in — lands in the next step.
      </p>
    </div>
  );
}
