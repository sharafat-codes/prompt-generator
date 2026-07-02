import { notFound } from "next/navigation";
import { requireSession } from "@/server/context";
import { getPromptBySlug, getPromptVersions } from "@/server/data/prompts";
import { getWorkspacePlan } from "@/server/data/workspace";
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

  const plan = workspaceId ? await getWorkspacePlan(workspaceId) : "FREE";
  const canManage = plan !== "FREE"; // history + restore + improve are Pro
  const versions = canManage && workspaceId ? await getPromptVersions(workspaceId, prompt.id) : [];

  return (
    <PromptRunner prompt={prompt} live={hasApiKey()} canManage={canManage} versions={versions} />
  );
}
