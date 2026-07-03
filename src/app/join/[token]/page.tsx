import Link from "next/link";
import { Users } from "lucide-react";
import { getSessionSafe } from "@/server/context";
import { getWorkspaceByInviteToken } from "@/server/data/workspace";
import { joinWorkspace } from "@/server/actions/workspace-actions";
import { Mark } from "@/components/layout/mark";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { robots: { index: false, follow: false } };

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [ws, session] = await Promise.all([getWorkspaceByInviteToken(token), getSessionSafe()]);
  const signedIn = Boolean(session?.user?.id);

  return (
    <div className="grid min-h-screen place-items-center bg-ground px-4">
      <Card className="w-full max-w-sm p-8 text-center shadow-lg">
        <div className="flex flex-col items-center">
          <Mark size={34} />

          {!ws ? (
            <>
              <h1 className="mt-5 font-serif text-xl font-semibold tracking-[-0.01em]">
                Invite not found
              </h1>
              <p className="mt-2 text-sm text-ink-2">
                This link is invalid or has been revoked. Ask your teammate to send a fresh one.
              </p>
              <Link href="/library" className="mt-6 w-full">
                <Button variant="secondary" className="w-full">
                  Go to PromptPilot
                </Button>
              </Link>
            </>
          ) : (
            <>
              <span className="mt-5 grid h-12 w-12 place-items-center rounded-full bg-accent text-white">
                <Users size={22} />
              </span>
              <h1 className="mt-4 font-serif text-xl font-semibold tracking-[-0.01em]">
                Join {ws.name}
              </h1>
              <p className="mt-2 text-sm text-ink-2">
                You&apos;ve been invited to a shared workspace ({ws.memberCount} member
                {ws.memberCount === 1 ? "" : "s"}). Its recipe library will be shared with you.
              </p>

              {signedIn ? (
                <form action={joinWorkspace} className="mt-6 w-full">
                  <input type="hidden" name="token" value={token} />
                  <Button type="submit" className="w-full">
                    Join workspace
                  </Button>
                </form>
              ) : (
                <div className="mt-6 w-full">
                  <Link href={`/login?callbackUrl=${encodeURIComponent(`/join/${token}`)}`}>
                    <Button className="w-full">Sign in to join</Button>
                  </Link>
                  <p className="mt-2 text-xs text-ink-3">You&apos;ll come right back here.</p>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
