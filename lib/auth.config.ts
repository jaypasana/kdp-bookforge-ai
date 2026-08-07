import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

/**
 * Edge-safe NextAuth config. This is used by middleware (which runs on the
 * Edge runtime) to decode the session JWT — it never calls `authorize`, so
 * it must not import anything Node-only (bcryptjs, Prisma) or middleware
 * will fail to compile/run on Vercel and similar platforms.
 *
 * The full config with real credential verification lives in lib/auth.ts
 * and is used everywhere else (route handlers, server components/actions).
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // Never invoked on the Edge runtime — real verification lives in lib/auth.ts.
      authorize: async () => null,
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = (user as { role?: string }).role ?? "USER";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
