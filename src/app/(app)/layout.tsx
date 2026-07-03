import { Sidebar } from "@/components/layout/sidebar";
import { CommandPalette } from "@/components/layout/command-palette";
import { requireSession } from "@/server/context";
import { getSidebarData, getMyWorkspaces } from "@/server/data/workspace";
import { listPromptSummaries } from "@/server/data/prompts";

const PLAN_LABEL: Record<string, string> = {
  FREE: "Free plan",
  PRO: "Pro plan",
  TEAM: "Team plan",
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const workspaceId = session.user.workspaceId;
  const [stats, prompts, workspaces] = await Promise.all([
    workspaceId ? getSidebarData(workspaceId, session.user.id) : Promise.resolve(undefined),
    workspaceId ? listPromptSummaries(workspaceId) : Promise.resolve([]),
    getMyWorkspaces(session.user.id),
  ]);

  const user = {
    name: session.user.name ?? session.user.email ?? "You",
    email: session.user.email,
    planLabel: stats ? PLAN_LABEL[stats.plan] ?? "Free plan" : "Free plan",
  };

  return (
    <div className="min-h-full lg:flex">
      <Sidebar user={user} stats={stats} workspaces={workspaces} currentWorkspaceId={workspaceId} />
      <main className="min-w-0 flex-1">{children}</main>
      <CommandPalette prompts={prompts} />
    </div>
  );
}
