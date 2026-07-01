import { Sidebar } from "@/components/layout/sidebar";
import { requireSession } from "@/server/context";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Gate the whole authenticated app: no session → redirect to /login.
  const session = await requireSession();
  const user = {
    name: session.user.name ?? session.user.email ?? "You",
    email: session.user.email,
    plan: "Free plan",
  };

  return (
    <div className="flex min-h-full">
      <Sidebar user={user} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
