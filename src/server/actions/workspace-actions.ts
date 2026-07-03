"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { requireSession } from "@/server/context";
import { resolveActiveWorkspaceId } from "@/server/data/workspace";
import { prisma } from "@/lib/db";
import { slugify, randomToken } from "@/lib/slug";

const nameSchema = z.string().trim().min(1, "Name is required").max(60);

function newInviteToken() {
  return randomUUID().replace(/-/g, "");
}

async function uniqueWorkspaceSlug(name: string) {
  const base = slugify(name);
  for (let i = 0; i < 5; i += 1) {
    const candidate = `${base}-${randomToken(6)}`;
    const existing = await prisma.workspace.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  return `${base}-${randomToken(12)}`;
}

/** A workspace membership with a management role (owner or admin). */
async function requireManager(workspaceId: string, userId: string) {
  const m = await prisma.membership.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
    select: { role: true },
  });
  if (!m || (m.role !== "OWNER" && m.role !== "ADMIN")) {
    throw new Error("You don't have permission to manage this team.");
  }
  return m.role;
}

/** Create a TEAM workspace, make the caller its owner, and switch to it. */
export async function createTeamWorkspace(formData: FormData) {
  const session = await requireSession();
  const userId = session.user.id;
  const name = nameSchema.parse(formData.get("name"));

  const ws = await prisma.workspace.create({
    data: {
      name,
      slug: await uniqueWorkspaceSlug(name),
      type: "TEAM",
      plan: "FREE",
      inviteToken: newInviteToken(),
      members: { create: { userId, role: "OWNER" } },
    },
    select: { id: true },
  });
  await prisma.user.update({ where: { id: userId }, data: { activeWorkspaceId: ws.id } });

  redirect("/settings/team");
}

/** Switch the caller's active workspace (must be a member). */
export async function switchWorkspace(formData: FormData) {
  const session = await requireSession();
  const userId = session.user.id;
  const workspaceId = String(formData.get("workspaceId") ?? "");

  const member = await prisma.membership.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
    select: { workspaceId: true },
  });
  if (!member) throw new Error("You're not a member of that workspace.");

  await prisma.user.update({ where: { id: userId }, data: { activeWorkspaceId: workspaceId } });
  redirect("/library");
}

/** Generate (or rotate, revoking the old one) the current team's invite link. */
export async function rotateInviteToken() {
  const session = await requireSession();
  const userId = session.user.id;
  const workspaceId = await resolveActiveWorkspaceId(userId);
  if (!workspaceId) throw new Error("No active workspace.");
  await requireManager(workspaceId, userId);

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { inviteToken: newInviteToken() },
  });
  revalidatePath("/settings/team");
}

/** Join a workspace by its invite token, then switch to it. */
export async function joinWorkspace(formData: FormData) {
  const session = await requireSession();
  const userId = session.user.id;
  const token = String(formData.get("token") ?? "");

  const ws = await prisma.workspace.findUnique({
    where: { inviteToken: token },
    select: { id: true },
  });
  if (!ws) throw new Error("This invite link is invalid or has been revoked.");

  await prisma.membership.upsert({
    where: { workspaceId_userId: { workspaceId: ws.id, userId } },
    create: { workspaceId: ws.id, userId, role: "MEMBER" },
    update: {},
  });
  await prisma.user.update({ where: { id: userId }, data: { activeWorkspaceId: ws.id } });

  redirect("/library");
}

/** Remove a member from the current team (owners/admins only; never an owner). */
export async function removeMember(formData: FormData) {
  const session = await requireSession();
  const actorId = session.user.id;
  const workspaceId = await resolveActiveWorkspaceId(actorId);
  if (!workspaceId) throw new Error("No active workspace.");
  const targetUserId = String(formData.get("userId") ?? "");

  await requireManager(workspaceId, actorId);
  if (targetUserId === actorId) throw new Error("Use “Leave team” to remove yourself.");

  const target = await prisma.membership.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
    select: { role: true },
  });
  if (!target) return;
  if (target.role === "OWNER") throw new Error("You can't remove an owner.");

  await prisma.membership.delete({
    where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
  });
  revalidatePath("/settings/team");
}

/** Leave the current team workspace and fall back to your personal one. */
export async function leaveWorkspace() {
  const session = await requireSession();
  const userId = session.user.id;
  const workspaceId = await resolveActiveWorkspaceId(userId);
  if (!workspaceId) throw new Error("No active workspace.");

  const ws = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { type: true },
  });
  if (ws?.type === "PERSONAL") throw new Error("You can't leave your personal workspace.");

  const membership = await prisma.membership.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
    select: { role: true },
  });
  if (!membership) redirect("/library");

  if (membership.role === "OWNER") {
    const [owners, members] = await Promise.all([
      prisma.membership.count({ where: { workspaceId, role: "OWNER" } }),
      prisma.membership.count({ where: { workspaceId } }),
    ]);
    if (owners <= 1 && members > 1) {
      throw new Error("You're the only owner — remove the other members first, then leave.");
    }
  }

  await prisma.membership.delete({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  await prisma.user.update({ where: { id: userId }, data: { activeWorkspaceId: null } });
  redirect("/library");
}
