import type { DefaultSession } from "next-auth";

// Expose the current workspace on the session so Server Components and actions
// can scope queries without a second lookup.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      workspaceId?: string | null;
    } & DefaultSession["user"];
  }
}
