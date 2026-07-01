import NextAuth, { type NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/db";
import { ensurePersonalWorkspace, getPrimaryWorkspaceId } from "@/server/data/workspace";

// Only register a provider when its credentials exist, so the app runs before
// any OAuth app is configured. Auth.js v5 auto-reads AUTH_<PROVIDER>_ID/SECRET.
const providers: NextAuthConfig["providers"] = [];
if (process.env.AUTH_GITHUB_ID) providers.push(GitHub);
if (process.env.AUTH_GOOGLE_ID) providers.push(Google);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  trustHost: true,
  pages: { signIn: "/login" },
  providers,
  events: {
    // Every new user gets a PERSONAL workspace of one (tenancy rule).
    async createUser({ user }) {
      if (user.id) {
        await ensurePersonalWorkspace(user.id, user.name ?? user.email ?? "Personal");
      }
    },
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.workspaceId = await getPrimaryWorkspaceId(user.id);
      }
      return session;
    },
  },
});
