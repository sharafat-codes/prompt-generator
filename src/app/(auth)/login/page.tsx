import Link from "next/link";
import { LogIn } from "lucide-react";
import { signIn } from "@/lib/auth";
import { Mark } from "@/components/layout/mark";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  // Only honor same-origin relative paths, so an invite link returns the user
  // to /join/<token> — never an attacker-supplied external URL.
  const dest = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/library";
  const hasGitHub = Boolean(process.env.AUTH_GITHUB_ID);
  const hasGoogle = Boolean(process.env.AUTH_GOOGLE_ID);
  const configured = hasGitHub || hasGoogle;

  return (
    <Card className="w-full max-w-sm p-8 shadow-lg">
      <div className="flex flex-col items-center text-center">
        <Mark size={36} />
        <h1 className="mt-5 font-serif text-2xl font-semibold tracking-[-0.015em]">
          Welcome to PromptPilot
        </h1>
        <p className="mt-2 text-sm text-ink-2">
          Sign in to save prompts as reusable recipes.
        </p>
      </div>

      {configured ? (
        <div className="mt-7 flex flex-col gap-2.5">
          {hasGitHub && (
            <form
              action={async () => {
                "use server";
                await signIn("github", { redirectTo: dest });
              }}
            >
              <Button variant="secondary" className="w-full">
                <LogIn size={16} />
                Continue with GitHub
              </Button>
            </form>
          )}
          {hasGoogle && (
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: dest });
              }}
            >
              <Button variant="secondary" className="w-full">
                <LogIn size={16} />
                Continue with Google
              </Button>
            </form>
          )}
        </div>
      ) : (
        <div className="mt-7 rounded-md border border-hairline bg-surface-2 px-4 py-3.5 text-[13px] leading-relaxed text-ink-2">
          No sign-in provider is configured yet. Add{" "}
          <span className="font-mono text-[12px]">AUTH_GITHUB_ID</span> /{" "}
          <span className="font-mono text-[12px]">AUTH_GITHUB_SECRET</span> to{" "}
          <span className="font-mono text-[12px]">.env</span> (a GitHub OAuth app takes ~2
          minutes), then reload.
        </div>
      )}

      <p className="mt-6 text-center text-xs text-ink-3">
        <Link href="/library" className="hover:text-ink-2">
          Continue to the app →
        </Link>
      </p>
    </Card>
  );
}
