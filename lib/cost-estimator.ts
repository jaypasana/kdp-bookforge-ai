/**
 * Rough pre-generation cost estimate shown to the user before they commit to
 * a run. This is intentionally conservative and clearly labeled as an
 * estimate everywhere it's surfaced (spec section 23) — actual cost is
 * tracked per-call in ApiUsage once generation runs.
 *
 * Heuristic: ~1.3 tokens/word for prose, and each word of final manuscript
 * costs roughly `pipelineMultiplier` tokens once you account for brief
 * generation, drafting, chapter review/revision passes, and the KDP
 * marketing package. Rates are USD per 1M tokens and are intentionally
 * configurable so admin settings (Phase 7) can update them as OpenAI
 * pricing changes without touching this formula.
 */

export const DEFAULT_TOKEN_RATES = {
  inputPerMillion: 2.5,
  outputPerMillion: 10,
};

const TOKENS_PER_WORD = 1.3;
const PIPELINE_OUTPUT_MULTIPLIER = 2.2; // draft + revisions + reviews + KDP package
const PIPELINE_INPUT_MULTIPLIER = 1.4; // briefs, continuity context, review prompts

export function estimateGenerationCost(
  targetWordCount: number,
  rates: { inputPerMillion: number; outputPerMillion: number } = DEFAULT_TOKEN_RATES
): { estimatedInputTokens: number; estimatedOutputTokens: number; estimatedCostUsd: number } {
  const baseTokens = targetWordCount * TOKENS_PER_WORD;
  const estimatedOutputTokens = Math.round(baseTokens * PIPELINE_OUTPUT_MULTIPLIER);
  const estimatedInputTokens = Math.round(baseTokens * PIPELINE_INPUT_MULTIPLIER);

  const estimatedCostUsd =
    (estimatedInputTokens / 1_000_000) * rates.inputPerMillion +
    (estimatedOutputTokens / 1_000_000) * rates.outputPerMillion;

  return {
    estimatedInputTokens,
    estimatedOutputTokens,
    estimatedCostUsd: Math.round(estimatedCostUsd * 100) / 100,
  };
}
