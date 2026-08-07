import "server-only";
import OpenAI from "openai";
import { getEnv } from "@/lib/env";

let cachedClient: OpenAI | undefined;

/**
 * Server-only OpenAI client singleton. Never import this from a Client
 * Component — the `server-only` package makes that a build-time error.
 */
export function getOpenAIClient(): OpenAI {
  if (cachedClient) return cachedClient;
  const env = getEnv();
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set and OPENAI_MOCK is not enabled.");
  }
  cachedClient = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  return cachedClient;
}
