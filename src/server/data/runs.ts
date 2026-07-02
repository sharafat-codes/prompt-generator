import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { currentPeriod } from "@/lib/plans";

/**
 * Records a successful generation and meters it: writes a Run row and bumps the
 * workspace's monthly UsageCounter — in one transaction so the count and the
 * record never drift apart.
 */
export async function recordRun(params: {
  workspaceId: string;
  userId: string;
  promptId?: string | null;
  promptVersionId?: string | null;
  inputs: Prisma.InputJsonValue;
  output: string;
  model: string;
}) {
  const period = currentPeriod();
  await prisma.$transaction([
    prisma.run.create({
      data: {
        workspaceId: params.workspaceId,
        userId: params.userId,
        promptId: params.promptId ?? null,
        promptVersionId: params.promptVersionId ?? null,
        inputs: params.inputs,
        output: params.output,
        model: params.model,
        status: "SUCCESS",
      },
    }),
    prisma.usageCounter.upsert({
      where: { workspaceId_period: { workspaceId: params.workspaceId, period } },
      create: { workspaceId: params.workspaceId, period, generations: 1 },
      update: { generations: { increment: 1 } },
    }),
  ]);
}
