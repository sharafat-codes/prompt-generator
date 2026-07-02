import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { extractVariables } from "@/lib/variables";
import type { PromptListItem, PromptDetail, VariableSpec } from "@/lib/prompt-types";

// Every function takes workspaceId — reads/writes are always tenant-scoped.

export async function listPrompts(
  workspaceId: string,
  userId: string,
  opts: { q?: string; starredOnly?: boolean } = {},
): Promise<PromptListItem[]> {
  const where: Prisma.PromptWhereInput = { workspaceId, status: "ACTIVE" };
  if (opts.q) where.title = { contains: opts.q, mode: "insensitive" };
  if (opts.starredOnly) where.favorites = { some: { userId } };

  const prompts = await prisma.prompt.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      currentVersion: { select: { template: true } },
      favorites: { where: { userId }, select: { userId: true } },
      _count: { select: { runs: true } },
    },
  });

  return prompts.map((p) => {
    const template = p.currentVersion?.template ?? "";
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      template,
      variableCount: extractVariables(template).length,
      runCount: p._count.runs,
      starred: p.favorites.length > 0,
    };
  });
}

export async function getPromptBySlug(
  workspaceId: string,
  userId: string,
  slug: string,
): Promise<PromptDetail | null> {
  const prompt = await prisma.prompt.findFirst({
    where: { workspaceId, slug, status: { not: "ARCHIVED" } },
    include: {
      currentVersion: true,
      favorites: { where: { userId }, select: { userId: true } },
      _count: { select: { runs: true } },
    },
  });
  if (!prompt?.currentVersion) return null;

  return {
    id: prompt.id,
    slug: prompt.slug,
    title: prompt.title,
    template: prompt.currentVersion.template,
    variables: (prompt.currentVersion.variables as unknown as VariableSpec[]) ?? [],
    versionNumber: prompt.currentVersion.versionNumber,
    runCount: prompt._count.runs,
    starred: prompt.favorites.length > 0,
  };
}

async function uniqueSlug(workspaceId: string, title: string) {
  const base = slugify(title);
  let slug = base;
  let n = 1;
  // Slugs are unique per workspace; append a counter on collision.
  while (
    await prisma.prompt.findFirst({
      where: { workspaceId, slug },
      select: { id: true },
    })
  ) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

/**
 * Creates an ACTIVE prompt with its first immutable version and points
 * currentVersionId at it — all in one transaction. Returns the slug.
 */
export async function createPrompt(params: {
  workspaceId: string;
  userId: string;
  title: string;
  template: string;
  variables: VariableSpec[];
  modelConfig?: Prisma.InputJsonValue;
}): Promise<string> {
  const slug = await uniqueSlug(params.workspaceId, params.title);

  await prisma.$transaction(async (tx) => {
    const prompt = await tx.prompt.create({
      data: {
        workspaceId: params.workspaceId,
        title: params.title,
        slug,
        status: "ACTIVE",
        createdById: params.userId,
      },
    });
    const version = await tx.promptVersion.create({
      data: {
        promptId: prompt.id,
        versionNumber: 1,
        template: params.template,
        variables: params.variables as unknown as Prisma.InputJsonValue,
        modelConfig: params.modelConfig,
        createdById: params.userId,
      },
    });
    await tx.prompt.update({
      where: { id: prompt.id },
      data: { currentVersionId: version.id },
    });
  });

  return slug;
}
