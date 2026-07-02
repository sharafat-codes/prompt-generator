"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireSession, getCurrentWorkspaceId } from "@/server/context";
import { createPrompt } from "@/server/data/prompts";
import { prisma } from "@/lib/db";
import { savedRecipeCap } from "@/lib/plans";

const variableSpec = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(["text", "longtext", "select"]),
  options: z.array(z.string()).optional(),
  placeholder: z.string().optional(),
});

const saveSchema = z.object({
  title: z.string().min(1).max(120),
  template: z.string().min(1).max(8000),
  variables: z.array(variableSpec).max(20),
});

/** Save a generated recipe to the library. Returns the new prompt's slug. */
export async function savePrompt(
  input: z.infer<typeof saveSchema>,
): Promise<{ slug: string } | { error: "recipe_limit"; cap: number }> {
  const parsed = saveSchema.parse(input);
  const session = await requireSession();
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) throw new Error("No active workspace.");

  // Freemium: the Free plan caps saved recipes.
  const ws = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { plan: true },
  });
  const cap = savedRecipeCap(ws?.plan ?? "FREE");
  if (cap !== null) {
    const count = await prisma.prompt.count({ where: { workspaceId, status: "ACTIVE" } });
    if (count >= cap) return { error: "recipe_limit", cap };
  }

  const slug = await createPrompt({
    workspaceId,
    userId: session.user.id,
    title: parsed.title,
    template: parsed.template,
    variables: parsed.variables,
  });

  revalidatePath("/library");
  return { slug };
}

/** Toggle the current user's star on a prompt (per-user favorite). */
export async function toggleStar(promptId: string) {
  const session = await requireSession();
  const workspaceId = session.user.workspaceId;
  if (!workspaceId) throw new Error("No active workspace.");

  // Scope check: the prompt must belong to the caller's workspace.
  const owned = await prisma.prompt.findFirst({
    where: { id: promptId, workspaceId },
    select: { id: true },
  });
  if (!owned) throw new Error("Prompt not found.");

  const key = { userId_promptId: { userId: session.user.id, promptId } };
  const existing = await prisma.favorite.findUnique({ where: key });
  if (existing) {
    await prisma.favorite.delete({ where: key });
  } else {
    await prisma.favorite.create({ data: { userId: session.user.id, promptId } });
  }

  revalidatePath("/library");
}
