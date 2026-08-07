import "server-only";
import { getEnv } from "@/lib/env";

/**
 * Task-based model routing (spec section 6). Callers never hardcode a model
 * name — they declare what kind of task they're doing, and the actual model
 * comes from environment configuration so it can be swapped as OpenAI
 * releases new models, without touching application code.
 *
 * - primary: market positioning, book architecture, outlines, difficult
 *   chapters, final review
 * - fast: metadata extraction, summaries, formatting cleanup, classification
 * - review: repetition checks, consistency, style adherence, scoring
 * - research: source-verification-aware generation (Research Mode)
 */
export type ModelTask = "primary" | "fast" | "review" | "research";

export function resolveModel(task: ModelTask): string {
  const env = getEnv();
  switch (task) {
    case "primary":
      return env.OPENAI_MODEL_PRIMARY;
    case "fast":
      return env.OPENAI_MODEL_FAST;
    case "review":
      return env.OPENAI_MODEL_REVIEW;
    case "research":
      return env.OPENAI_MODEL_RESEARCH;
  }
}
