import { Sidebar } from "@/components/layout/sidebar";
import { requireSession } from "@/server/context";
import { getSidebarData } from "@/server/data/workspace";

const PLAN_LABEL: Record<string, string> = {
  FREE: "Free plan",
  PRO: "Pro plan",
  TEAM: "Team plan",
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const workspaceId = session.user.workspaceId;
  const stats = workspaceId ? await getSidebarData(workspaceId, session.user.id) : undefined;

  const user = {
    name: session.user.name ?? session.user.email ?? "You",
    email: session.user.email,
    planLabel: stats ? PLAN_LABEL[stats.plan] ?? "Free plan" : "Free plan",
  };

  return (
    <div className="flex min-h-full">
      <Sidebar user={user} stats={stats} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
