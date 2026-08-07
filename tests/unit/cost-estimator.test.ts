import { describe, expect, it } from "vitest";
import { estimateGenerationCost } from "@/lib/cost-estimator";

describe("estimateGenerationCost", () => {
  it("scales roughly linearly with target word count", () => {
    const small = estimateGenerationCost(10000);
    const large = estimateGenerationCost(50000);

    expect(large.estimatedOutputTokens).toBeGreaterThan(small.estimatedOutputTokens);
    expect(large.estimatedCostUsd).toBeGreaterThan(small.estimatedCostUsd);
    // roughly 5x input word count -> roughly 5x tokens
    expect(large.estimatedOutputTokens / small.estimatedOutputTokens).toBeCloseTo(5, 0);
  });

  it("returns a positive, rounded-to-cents cost estimate", () => {
    const result = estimateGenerationCost(50000);
    expect(result.estimatedCostUsd).toBeGreaterThan(0);
    expect(Number.isFinite(result.estimatedCostUsd)).toBe(true);
    expect(result.estimatedCostUsd).toBe(Math.round(result.estimatedCostUsd * 100) / 100);
  });

  it("respects custom rates", () => {
    const cheap = estimateGenerationCost(50000, { inputPerMillion: 0, outputPerMillion: 0 });
    expect(cheap.estimatedCostUsd).toBe(0);
  });
});
