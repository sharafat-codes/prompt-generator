import { prisma } from "@/lib/db";
import { generationLimit, currentPeriod, savedRecipeCap } from "@/lib/plans";
import { seedStarterPrompts } from "@/server/data/prompts";

function slugify(input: string) {
  return (
    input
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 24) || "workspace"
  );
}

/**
 * The load-bearing tenancy rule: every user — even a solo one — owns a
 * PERSONAL workspace. Called once when a user is first created. Idempotent.
 * Returns the workspace id.
 */
export async function ensurePersonalWorkspace(userId: string, displayName: string) {
  const existing = await prisma.membership.findFirst({
    where: { userId },
    select: { workspaceId: true },
  });
  if (existing) return existing.workspaceId;

  const workspace = await prisma.workspace.create({
    data: {
      name: `${displayName.split(" ")[0] || "Personal"}'s Workspace`,
      slug: `${slugify(displayName)}-${userId.slice(0, 6)}`,
      type: "PERSONAL",
      plan: "FREE",
      members: { create: { userId, role: "OWNER" } },
    },
    select: { id: true },
  });

  // Seed a few example recipes so the first library view isn't empty.
  try {
    await seedStarterPrompts(workspace.id, userId);
  } catch {
    // never block sign-up on seeding
  }

  return workspace.id;
}

/** The user's primary (oldest) workspace id, or null. */
export async function getPrimaryWorkspaceId(userId: string) {
  const membership = await prisma.membership.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { workspaceId: true },
  });
  return membership?.workspaceId ?? null;
}

/**
 * The workspace the user is currently acting in. Honors User.activeWorkspaceId
 * when it still points at a workspace they belong to; otherwise falls back to
 * their oldest membership (their personal workspace). Never returns a workspace
 * the caller isn't a member of.
 */
export async function resolveActiveWorkspaceId(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { activeWorkspaceId: true },
  });
  if (user?.activeWorkspaceId) {
    const member = await prisma.membership.findUnique({
      where: { workspaceId_userId: { workspaceId: user.activeWorkspaceId, userId } },
      select: { workspaceId: true },
    });
    if (member) return member.workspaceId;
  }
  return getPrimaryWorkspaceId(userId);
}

export type MyWorkspace = {
  id: string;
  name: string;
  type: "PERSONAL" | "TEAM";
  role: "OWNER" | "ADMIN" | "MEMBER";
  memberCount: number;
};

/** Every workspace the user belongs to, oldest first (personal is usually first). */
export async function getMyWorkspaces(userId: string): Promise<MyWorkspace[]> {
  const memberships = await prisma.membership.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: {
      role: true,
      workspace: {
        select: { id: true, name: true, type: true, _count: { select: { members: true } } },
      },
    },
  });
  return memberships.map((m) => ({
    id: m.workspace.id,
    name: m.workspace.name,
    type: m.workspace.type,
    role: m.role,
    memberCount: m.workspace._count.members,
  }));
}

export type WorkspaceMember = {
  userId: string;
  name: string;
  email: string | null;
  image: string | null;
  role: "OWNER" | "ADMIN" | "MEMBER";
  joinedAt: Date;
};

/** Members of a workspace, owners first. */
export async function getMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  const members = await prisma.membership.findMany({
    where: { workspaceId },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: {
      role: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });
  return members.map((m) => ({
    userId: m.user.id,
    name: m.user.name ?? m.user.email ?? "Member",
    email: m.user.email,
    image: m.user.image,
    role: m.role,
    joinedAt: m.createdAt,
  }));
}

/** Name/type/plan/role for the current workspace, plus its invite token. */
export async function getWorkspaceMeta(workspaceId: string, userId: string) {
  const [ws, membership] = await Promise.all([
    prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true, name: true, type: true, plan: true, inviteToken: true },
    }),
    prisma.membership.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
      select: { role: true },
    }),
  ]);
  if (!ws) return null;
  return { ...ws, myRole: membership?.role ?? null };
}

/** Resolve an invite link to its (public-safe) workspace summary, or null. */
export async function getWorkspaceByInviteToken(token: string) {
  const ws = await prisma.workspace.findUnique({
    where: { inviteToken: token },
    select: { id: true, name: true, type: true, _count: { select: { members: true } } },
  });
  return ws
    ? { id: ws.id, name: ws.name, type: ws.type, memberCount: ws._count.members }
    : null;
}

/** The workspace's plan tier (defaults to FREE). */
export async function getWorkspacePlan(workspaceId: string) {
  const ws = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { plan: true },
  });
  return ws?.plan ?? "FREE";
}

/** Current-period generation usage vs the workspace's plan limit. */
export async function getUsageStatus(workspaceId: string) {
  const [workspace, usage] = await Promise.all([
    prisma.workspace.findUnique({ where: { id: workspaceId }, select: { plan: true } }),
    prisma.usageCounter.findUnique({
      where: { workspaceId_period: { workspaceId, period: currentPeriod() } },
      select: { generations: true },
    }),
  ]);
  const plan = workspace?.plan ?? "FREE";
  const used = usage?.generations ?? 0;
  const limit = generationLimit(plan);
  return { plan, used, limit, remaining: Math.max(0, limit - used), over: used >= limit };
}

/** Real counts for the sidebar: prompt count, starred count, plan, and usage. */
export async function getSidebarData(workspaceId: string, userId: string) {
  const [promptCount, starredCount, workspace, usage] = await Promise.all([
    prisma.prompt.count({ where: { workspaceId, status: "ACTIVE" } }),
    prisma.favorite.count({ where: { userId, prompt: { workspaceId } } }),
    prisma.workspace.findUnique({ where: { id: workspaceId }, select: { plan: true } }),
    prisma.usageCounter.findUnique({
      where: { workspaceId_period: { workspaceId, period: currentPeriod() } },
      select: { generations: true },
    }),
  ]);
  const plan = workspace?.plan ?? "FREE";
  return {
    promptCount,
    starredCount,
    plan,
    savedRecipesCap: savedRecipeCap(plan),
    generationsUsed: usage?.generations ?? 0,
    generationsLimit: generationLimit(plan),
  };
}
