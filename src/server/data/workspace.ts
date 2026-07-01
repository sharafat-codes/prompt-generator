import { prisma } from "@/lib/db";

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
