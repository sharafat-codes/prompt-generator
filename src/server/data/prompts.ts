import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { slugify, randomToken } from "@/lib/slug";
import { extractVariables } from "@/lib/variables";
import type {
  PromptListItem,
  PromptDetail,
  VariableSpec,
  PromptVersionItem,
  PublicPromptView,
} from "@/lib/prompt-types";

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
    visibility: prompt.visibility,
    publicSlug: prompt.publicSlug,
  };
}

async function uniquePublicSlug(title: string) {
  const base = slugify(title);
  for (let i = 0; i < 5; i += 1) {
    const candidate = `${base}-${randomToken(6)}`;
    const exists = await prisma.prompt.findUnique({
      where: { publicSlug: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
  }
  return `${base}-${randomToken(10)}`;
}

/** Publish/unpublish a prompt. Generates a stable public slug on first publish. */
export async function setPromptVisibility(
  workspaceId: string,
  promptId: string,
  makePublic: boolean,
): Promise<{ visibility: "PRIVATE" | "PUBLIC"; publicSlug: string | null }> {
  const prompt = await prisma.prompt.findFirst({
    where: { id: promptId, workspaceId },
    select: { publicSlug: true, title: true },
  });
  if (!prompt) throw new Error("Prompt not found.");

  if (!makePublic) {
    await prisma.prompt.update({ where: { id: promptId }, data: { visibility: "PRIVATE" } });
    return { visibility: "PRIVATE", publicSlug: prompt.publicSlug };
  }

  const publicSlug = prompt.publicSlug ?? (await uniquePublicSlug(prompt.title));
  await prisma.prompt.update({
    where: { id: promptId },
    data: { visibility: "PUBLIC", publicSlug },
  });
  return { visibility: "PUBLIC", publicSlug };
}

/** A publicly-shared prompt, by its public slug (no workspace scoping). */
export async function getPublicPrompt(publicSlug: string): Promise<PublicPromptView | null> {
  const prompt = await prisma.prompt.findFirst({
    where: { publicSlug, visibility: "PUBLIC", status: "ACTIVE" },
    include: { currentVersion: true },
  });
  if (!prompt?.currentVersion || !prompt.publicSlug) return null;
  return {
    title: prompt.title,
    template: prompt.currentVersion.template,
    variables: (prompt.currentVersion.variables as unknown as VariableSpec[]) ?? [],
    publicSlug: prompt.publicSlug,
  };
}

/** All public prompts (for the sitemap). */
export async function listPublicPrompts(): Promise<{ publicSlug: string; updatedAt: Date }[]> {
  const prompts = await prisma.prompt.findMany({
    where: { visibility: "PUBLIC", status: "ACTIVE", publicSlug: { not: null } },
    select: { publicSlug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 1000,
  });
  return prompts.flatMap((p) => (p.publicSlug ? [{ publicSlug: p.publicSlug, updatedAt: p.updatedAt }] : []));
}

const STARTER_PROMPTS: { title: string; template: string; variables: VariableSpec[] }[] = [
  {
    title: "Product launch email",
    template:
      "Write a {tone} launch email for {product}, targeting {audience}. Lead with the single biggest benefit and end with one clear call-to-action.",
    variables: [
      { key: "product", label: "Product", type: "text" },
      { key: "audience", label: "Audience", type: "text" },
      { key: "tone", label: "Tone", type: "select", options: ["Friendly", "Bold", "Premium", "Playful"] },
    ],
  },
  {
    title: "Instagram caption pack",
    template: "Write 5 {tone} Instagram captions for {product}, each with 3 relevant hashtags.",
    variables: [
      { key: "product", label: "Product", type: "text" },
      { key: "tone", label: "Tone", type: "select", options: ["Friendly", "Bold", "Premium", "Playful"] },
    ],
  },
  {
    title: "Midjourney image prompt",
    template:
      "Write a vivid, detailed image-generation prompt for {subject}. Style: {style}. Mood and lighting: {mood}. Detail level: {detail}. Return a single prompt with rich, comma-separated visual descriptors.",
    variables: [
      { key: "subject", label: "Subject", type: "text" },
      { key: "style", label: "Style", type: "select", options: ["Photorealistic", "Cinematic", "Digital art", "Illustration"] },
      { key: "mood", label: "Mood & lighting", type: "text" },
      { key: "detail", label: "Detail level", type: "select", options: ["Simple", "Detailed", "Expert"] },
    ],
  },
];

/** Seed a new workspace with a few example recipes so the library isn't empty. */
export async function seedStarterPrompts(workspaceId: string, userId: string) {
  for (const starter of STARTER_PROMPTS) {
    await createPrompt({
      workspaceId,
      userId,
      title: starter.title,
      template: starter.template,
      variables: starter.variables,
    });
  }
}

/** Slim list (title + slug) for the command palette. */
export async function listPromptSummaries(
  workspaceId: string,
): Promise<{ title: string; slug: string }[]> {
  return prisma.prompt.findMany({
    where: { workspaceId, status: "ACTIVE" },
    orderBy: { updatedAt: "desc" },
    select: { title: true, slug: true },
    take: 200,
  });
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

/** Add a new immutable version to an existing prompt and make it current. */
export async function createVersion(params: {
  workspaceId: string;
  userId: string;
  promptId: string;
  template: string;
  variables: VariableSpec[];
}) {
  const owned = await prisma.prompt.findFirst({
    where: { id: params.promptId, workspaceId: params.workspaceId },
    select: { id: true },
  });
  if (!owned) throw new Error("Prompt not found.");

  const last = await prisma.promptVersion.findFirst({
    where: { promptId: params.promptId },
    orderBy: { versionNumber: "desc" },
    select: { versionNumber: true },
  });
  const versionNumber = (last?.versionNumber ?? 0) + 1;

  await prisma.$transaction(async (tx) => {
    const version = await tx.promptVersion.create({
      data: {
        promptId: params.promptId,
        versionNumber,
        template: params.template,
        variables: params.variables as unknown as Prisma.InputJsonValue,
        createdById: params.userId,
      },
    });
    await tx.prompt.update({
      where: { id: params.promptId },
      data: { currentVersionId: version.id },
    });
  });
}

export async function getPromptVersions(
  workspaceId: string,
  promptId: string,
): Promise<PromptVersionItem[]> {
  const prompt = await prisma.prompt.findFirst({
    where: { id: promptId, workspaceId },
    select: { currentVersionId: true },
  });
  if (!prompt) return [];

  const versions = await prisma.promptVersion.findMany({
    where: { promptId },
    orderBy: { versionNumber: "desc" },
    select: { id: true, versionNumber: true, createdAt: true },
  });

  return versions.map((v) => ({
    id: v.id,
    versionNumber: v.versionNumber,
    createdAt: v.createdAt.toISOString(),
    isCurrent: v.id === prompt.currentVersionId,
  }));
}

/** Point currentVersionId back at an earlier version. */
export async function restoreVersion(workspaceId: string, promptId: string, versionId: string) {
  const version = await prisma.promptVersion.findFirst({
    where: { id: versionId, promptId, prompt: { workspaceId } },
    select: { id: true },
  });
  if (!version) throw new Error("Version not found.");
  await prisma.prompt.update({
    where: { id: promptId },
    data: { currentVersionId: versionId },
  });
}
