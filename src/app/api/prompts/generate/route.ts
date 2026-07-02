import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { streamGeneration } from "@/lib/ai/generate";
import { hasApiKey } from "@/lib/ai/provider";
import { modelForPlan } from "@/lib/plans";
import { getUsageStatus } from "@/server/data/workspace";
import { recordRun } from "@/server/data/runs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  prompt: z.string().min(1).max(8000),
  contentType: z.string().max(64).optional(),
  promptId: z.string().max(64).optional(),
  inputs: z.record(z.string(), z.string()).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Please sign in.", { status: 401 });
  }
  const workspaceId = session.user.workspaceId;
  if (!workspaceId) {
    return new Response("No active workspace.", { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return new Response("Invalid request", { status: 400 });
  }

  // Freemium metering — enforced server-side, never trusted from the client.
  const usage = await getUsageStatus(workspaceId);
  if (usage.over) {
    return new Response(
      JSON.stringify({ error: "limit", used: usage.used, limit: usage.limit }),
      { status: 402, headers: { "Content-Type": "application/json" } },
    );
  }

  // Link the run to a saved prompt's current version when one is provided.
  let promptId = parsed.data.promptId ?? null;
  let promptVersionId: string | null = null;
  if (promptId) {
    const owned = await prisma.prompt.findFirst({
      where: { id: promptId, workspaceId },
      select: { currentVersionId: true },
    });
    if (owned) promptVersionId = owned.currentVersionId;
    else promptId = null;
  }

  const model = hasApiKey() ? modelForPlan(usage.plan) : "demo";
  const inputs = (parsed.data.inputs ?? {}) as Prisma.InputJsonValue;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let output = "";
      let ok = true;
      try {
        for await (const chunk of streamGeneration(parsed.data.prompt, {
          contentType: parsed.data.contentType,
          model,
        })) {
          output += chunk;
          controller.enqueue(encoder.encode(chunk));
        }
      } catch {
        ok = false;
        controller.enqueue(encoder.encode("\n\n[Generation was interrupted. Please try again.]"));
      }

      // Record + meter only on success. Never let a bookkeeping failure break the stream.
      if (ok) {
        try {
          await recordRun({
            workspaceId,
            userId: session.user.id,
            promptId,
            promptVersionId,
            inputs,
            output,
            model,
          });
        } catch {
          // swallow — the user already has their output
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
