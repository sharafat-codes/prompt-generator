import { notFound } from "next/navigation";
import { requireSession } from "@/server/context";
import { getPromptBySlug } from "@/server/data/prompts";
import { hasApiKey } from "@/lib/ai/provider";
import { PromptRunner } from "@/components/prompt/prompt-runner";

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await requireSession();
  const workspaceId = session.user.workspaceId;
  const prompt = workspaceId ? await getPromptBySlug(workspaceId, session.user.id, slug) : null;
  if (!prompt) notFound();

  return <PromptRunner prompt={prompt} live={hasApiKey()} />;
}
