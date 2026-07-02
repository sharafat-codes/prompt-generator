"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireSession, getCurrentWorkspaceId } from "@/server/context";
import { createPrompt, createVersion, restoreVersion } from "@/server/data/prompts";
import { prisma } from "@/lib/db";
import { savedRecipeCap, modelForPlan } from "@/lib/plans";
import { deriveVariables } from "@/lib/variables";
import { improveTemplate } from "@/lib/ai/generate";
import type { VariableSpec } from "@/lib/prompt-types";

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

/** Edit a recipe → save as a NEW immutable version. Available to all plans. */
export async function updatePromptTemplate(promptId: string, template: string) {
  const session = await requireSession();
  const workspaceId = session.user.workspaceId;
  if (!workspaceId) throw new Error("No active workspace.");

  const clean = template.trim();
  if (!clean) throw new Error("The recipe can't be empty.");

  const prompt = await prisma.prompt.findFirst({
    where: { id: promptId, workspaceId },
    select: { slug: true, currentVersion: { select: { variables: true } } },
  });
  if (!prompt) throw new Error("Prompt not found.");

  const previous = (prompt.currentVersion?.variables as unknown as VariableSpec[]) ?? [];
  await createVersion({
    workspaceId,
    userId: session.user.id,
    promptId,
    template: clean,
    variables: deriveVariables(clean, previous),
  });

  revalidatePath(`/p/${prompt.slug}`);
  revalidatePath("/library");
}

/** Restore an earlier version (Pro feature). */
export async function restorePromptVersion(
  promptId: string,
  versionId: string,
): Promise<{ ok: true } | { error: "pro_required" }> {
  const session = await requireSession();
  const workspaceId = session.user.workspaceId;
  if (!workspaceId) throw new Error("No active workspace.");

  const ws = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { plan: true },
  });
  if ((ws?.plan ?? "FREE") === "FREE") return { error: "pro_required" };

  await restoreVersion(workspaceId, promptId, versionId);

  const prompt = await prisma.prompt.findFirst({
    where: { id: promptId, workspaceId },
    select: { slug: true },
  });
  if (prompt) revalidatePath(`/p/${prompt.slug}`);
  return { ok: true };
}

/** AI-improve the current recipe → save as a new version (Pro feature). */
export async function improvePromptAction(
  promptId: string,
): Promise<{ ok: true } | { error: "pro_required" }> {
  const session = await requireSession();
  const workspaceId = session.user.workspaceId;
  if (!workspaceId) throw new Error("No active workspace.");

  const ws = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { plan: true },
  });
  const plan = ws?.plan ?? "FREE";
  if (plan === "FREE") return { error: "pro_required" };

  const prompt = await prisma.prompt.findFirst({
    where: { id: promptId, workspaceId },
    select: { slug: true, currentVersion: { select: { template: true, variables: true } } },
  });
  if (!prompt?.currentVersion) throw new Error("Prompt not found.");

  const improved = await improveTemplate(prompt.currentVersion.template, modelForPlan(plan));
  const previous = (prompt.currentVersion.variables as unknown as VariableSpec[]) ?? [];
  await createVersion({
    workspaceId,
    userId: session.user.id,
    promptId,
    template: improved,
    variables: deriveVariables(improved, previous),
  });

  revalidatePath(`/p/${prompt.slug}`);
  return { ok: true };
}
