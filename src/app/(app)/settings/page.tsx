import Link from "next/link";
import { getSessionSafe } from "@/server/context";
import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function SettingsPage() {
  const session = await getSessionSafe();
  const user = session?.user;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-serif text-2xl font-semibold tracking-[-0.015em]">Settings</h1>
      <p className="mt-2 mb-6 text-ink-2">Your account and workspace.</p>

      {user ? (
        <Card className="p-5">
          <div className="flex items-center gap-3.5">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-accent text-base font-semibold text-white">
              {(user.name?.[0] ?? user.email?.[0] ?? "P").toUpperCase()}
            </span>
            <div>
              <div className="font-semibold">{user.name ?? "You"}</div>
              <div className="text-sm text-ink-3">{user.email}</div>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
              className="ml-auto"
            >
              <Button variant="secondary" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </Card>
      ) : (
        <Card className="p-5">
          <p className="text-sm text-ink-2">
            You&apos;re browsing as a guest.{" "}
            <Link href="/login" className="font-semibold text-accent hover:text-accent-hover">
              Sign in
            </Link>{" "}
            to save prompts and sync across devices.
          </p>
        </Card>
      )}
    </div>
  );
}
