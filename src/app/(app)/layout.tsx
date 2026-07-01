import { Sidebar } from "@/components/layout/sidebar";
import { getSessionSafe } from "@/server/context";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionSafe();
  const user = session?.user
    ? {
        name: session.user.name ?? session.user.email ?? "You",
        email: session.user.email,
        plan: "Free plan",
      }
    : undefined;

  return (
    <div className="flex min-h-full">
      <Sidebar user={user} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
