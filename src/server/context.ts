import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Session without throwing. Returns null if auth isn't reachable yet
 * (e.g. no database connected during early development), so pages keep
 * rendering instead of crashing. Remove the guard once the DB is wired.
 */
export async function getSessionSafe() {
  try {
    return await auth();
  } catch {
    return null;
  }
}

/** Require a signed-in user or redirect to /login. Use in mutations/protected reads. */
export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session;
}

/** The caller's current workspace id, or null. Every data query is scoped by this. */
export async function getCurrentWorkspaceId() {
  const session = await getSessionSafe();
  return session?.user?.workspaceId ?? null;
}
