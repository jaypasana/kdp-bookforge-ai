import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/**
 * Edge-runtime NextAuth instance for use in middleware only. No adapter, no
 * Node-only dependencies — just enough to read/verify the session JWT.
 */
export const { auth } = NextAuth(authConfig);
