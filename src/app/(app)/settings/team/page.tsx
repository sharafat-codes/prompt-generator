import Link from "next/link";
import { Users } from "lucide-react";
import { requireSession } from "@/server/context";
import {
  getMyWorkspaces,
  getMembers,
  getWorkspaceMeta,
} from "@/server/data/workspace";
import {
  createTeamWorkspace,
  switchWorkspace,
  rotateInviteToken,
  removeMember,
  leaveWorkspace,
} from "@/server/actions/workspace-actions";
import { InviteLink } from "@/components/team/invite-link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/lib/site";

const ROLE_LABEL: Record<string, string> = { OWNER: "Owner", ADMIN: "Admin", MEMBER: "Member" };
const PLAN_LABEL: Record<string, string> = { FREE: "Free", PRO: "Pro", TEAM: "Team" };

function Initial({ name, team }: { name: string; team?: boolean }) {
  return (
    <span
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold text-white ${
        team ? "bg-accent" : "bg-ink"
      }`}
    >
      {team ? <Users size={15} /> : (name.trim()[0] ?? "?").toUpperCase()}
    </span>
  );
}

export default async function TeamPage() {
  const session = await requireSession();
  const userId = session.user.id;
  const workspaceId = session.user.workspaceId;

  const [meta, workspaces] = await Promise.all([
    workspaceId ? getWorkspaceMeta(workspaceId, userId) : Promise.resolve(null),
    getMyWorkspaces(userId),
  ]);
  const isTeam = meta?.type === "TEAM";
  const members = workspaceId && isTeam ? await getMembers(workspaceId) : [];
  const isManager = meta?.myRole === "OWNER" || meta?.myRole === "ADMIN";
  const inviteUrl = meta?.inviteToken ? `${SITE_URL}/join/${meta.inviteToken}` : null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6">
        <Link href="/settings" className="text-sm text-ink-3 hover:text-ink">
          ← Settings
        </Link>
        <h1 className="mt-2 font-serif text-2xl font-semibold tracking-[-0.015em]">Team</h1>
        <p className="mt-1 text-ink-2">
          Share one recipe library and work together. Prompts, versions, and history are scoped to
          the active workspace.
        </p>
      </div>

      {/* Your workspaces ------------------------------------------------ */}
      <Card className="mb-4 p-5">
        <h2 className="mb-1 text-sm font-semibold">Your workspaces</h2>
        <p className="mb-3 text-[13px] text-ink-3">Switch which workspace you&apos;re working in.</p>
        <ul className="flex flex-col divide-y divide-hairline">
          {workspaces.map((w) => (
            <li key={w.id} className="flex items-center gap-3 py-2.5">
              <Initial name={w.name} team={w.type === "TEAM"} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{w.name}</div>
                <div className="text-[12px] text-ink-3">
                  {w.type === "TEAM" ? `Team · ${w.memberCount} members` : "Personal"} ·{" "}
                  {ROLE_LABEL[w.role]}
                </div>
              </div>
              {w.id === workspaceId ? (
                <span className="rounded-full bg-mint px-2.5 py-1 text-[11px] font-semibold text-accent-press">
                  Current
                </span>
              ) : (
                <form action={switchWorkspace}>
                  <input type="hidden" name="workspaceId" value={w.id} />
                  <Button type="submit" variant="secondary" size="sm">
                    Switch
                  </Button>
                </form>
              )}
            </li>
          ))}
        </ul>
      </Card>

      {/* Invite + members (team workspaces only) ------------------------ */}
      {isTeam && meta && (
        <>
          <Card className="mb-4 p-5">
            <h2 className="mb-1 text-sm font-semibold">Invite teammates</h2>
            {inviteUrl ? (
              <>
                <p className="mb-3 text-[13px] text-ink-3">
                  Anyone with this link can join <span className="font-medium text-ink-2">{meta.name}</span>{" "}
                  as a member.
                </p>
                <InviteLink url={inviteUrl} />
                {isManager && (
                  <form action={rotateInviteToken} className="mt-3">
                    <Button type="submit" variant="ghost" size="sm">
                      Regenerate link
                    </Button>
                    <span className="ml-2 text-[12px] text-ink-3">Revokes the current link.</span>
                  </form>
                )}
              </>
            ) : isManager ? (
              <form action={rotateInviteToken}>
                <p className="mb-3 text-[13px] text-ink-3">
                  Create a shareable link so teammates can join this workspace.
                </p>
                <Button type="submit" size="sm">
                  Create invite link
                </Button>
              </form>
            ) : (
              <p className="text-[13px] text-ink-3">No invite link yet — ask an owner to create one.</p>
            )}
          </Card>

          <Card className="mb-4 p-5">
            <h2 className="mb-3 text-sm font-semibold">Members · {members.length}</h2>
            <ul className="flex flex-col divide-y divide-hairline">
              {members.map((m) => (
                <li key={m.userId} className="flex items-center gap-3 py-2.5">
                  <Initial name={m.name} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {m.name}
                      {m.userId === userId && <span className="text-ink-3"> (you)</span>}
                    </div>
                    {m.email && <div className="truncate text-[12px] text-ink-3">{m.email}</div>}
                  </div>
                  <span className="text-[12px] font-medium text-ink-3">{ROLE_LABEL[m.role]}</span>
                  {isManager && m.role !== "OWNER" && m.userId !== userId && (
                    <form action={removeMember}>
                      <input type="hidden" name="userId" value={m.userId} />
                      <Button type="submit" variant="ghost" size="sm">
                        Remove
                      </Button>
                    </form>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-4 border-t border-hairline pt-4">
              <form action={leaveWorkspace}>
                <Button type="submit" variant="secondary" size="sm">
                  Leave this team
                </Button>
              </form>
            </div>
          </Card>

          {meta.plan !== "TEAM" && (
            <p className="mb-4 text-[13px] text-ink-2">
              This team is on the {PLAN_LABEL[meta.plan]} plan.{" "}
              <Link href="/settings/usage" className="font-semibold text-accent hover:text-accent-hover">
                Upgrade to Team
              </Link>{" "}
              for 10,000 generations/mo, unlimited recipes, and the best model.
            </p>
          )}
        </>
      )}

      {/* Create a team -------------------------------------------------- */}
      <Card className="p-5">
        <h2 className="mb-1 text-sm font-semibold">Create a team workspace</h2>
        <p className="mb-3 text-[13px] text-ink-3">
          A fresh shared library with its own members, usage, and plan. You&apos;ll be its owner.
        </p>
        <form action={createTeamWorkspace} className="flex gap-2">
          <input
            name="name"
            required
            maxLength={60}
            placeholder="e.g. Acme Marketing"
            className="min-w-0 flex-1 rounded-sm border border-hairline-2 bg-surface px-3 py-2 text-sm shadow-sm placeholder:text-ink-3 focus:border-ink-3 focus:outline-none"
          />
          <Button type="submit">Create team</Button>
        </form>
      </Card>
    </div>
  );
}
