import "server-only";
import { DEFAULT_TOKEN_RATES } from "@/lib/cost-estimator";

/**
 * Per-model USD-per-1M-token rates. Unknown models fall back to
 * DEFAULT_TOKEN_RATES so cost tracking never throws — it just becomes a
 * rough estimate until this table (or the future admin settings UI in
 * Phase 7) is updated with the real rate for that model.
 */
const KNOWN_RATES: Record<string, { inputPerMillion: number; outputPerMillion: number }> = {
  "gpt-5": { inputPerMillion: 5, outputPerMillion: 15 },
  "gpt-5-mini": { inputPerMillion: 0.5, outputPerMillion: 2 },
  "gpt-4.1": { inputPerMillion: 2, outputPerMillion: 8 },
  "gpt-4.1-mini": { inputPerMillion: 0.4, outputPerMillion: 1.6 },
  "gpt-4o": { inputPerMillion: 2.5, outputPerMillion: 10 },
  "gpt-4o-mini": { inputPerMillion: 0.15, outputPerMillion: 0.6 },
};

export function getRatesForModel(model: string) {
  return KNOWN_RATES[model] ?? DEFAULT_TOKEN_RATES;
}

export function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const rates = getRatesForModel(model);
  return (
    (inputTokens / 1_000_000) * rates.inputPerMillion +
    (outputTokens / 1_000_000) * rates.outputPerMillion
  );
}
