"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireSession, getCurrentWorkspaceId } from "@/server/context";
import { createPrompt } from "@/server/data/prompts";

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
export async function savePrompt(input: z.infer<typeof saveSchema>) {
  const parsed = saveSchema.parse(input);
  const session = await requireSession();
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) throw new Error("No active workspace.");

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
