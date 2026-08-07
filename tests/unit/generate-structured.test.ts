import { describe, expect, it, vi, beforeEach } from "vitest";
import { z } from "zod";

const apiUsageCreate = vi.fn().mockResolvedValue({});

vi.mock("@/lib/db/prisma", () => ({
  prisma: { apiUsage: { create: (...args: unknown[]) => apiUsageCreate(...args) } },
}));

vi.mock("@/lib/env", () => ({
  getEnv: () => ({
    OPENAI_MOCK: true,
    OPENAI_MODEL_PRIMARY: "gpt-5",
    OPENAI_MODEL_FAST: "gpt-5-mini",
    OPENAI_MODEL_REVIEW: "gpt-5",
    OPENAI_MODEL_RESEARCH: "gpt-5",
  }),
}));

describe("generateStructured (mock mode)", () => {
  beforeEach(() => {
    apiUsageCreate.mockClear();
  });

  it("returns the mock response validated against the schema", async () => {
    const { generateStructured } = await import("@/lib/openai/generate-structured");
    const schema = z.object({ greeting: z.string() });

    const result = await generateStructured({
      taskType: "test-task",
      modelTask: "primary",
      systemPrompt: "system",
      userPrompt: "user",
      schema,
      mockResponse: { greeting: "hello" },
      userId: "user_1",
    });

    expect(result).toEqual({ greeting: "hello" });
    expect(apiUsageCreate).toHaveBeenCalledTimes(1);
    expect(apiUsageCreate.mock.calls[0][0].data.taskType).toBe("test-task");
  });

  it("throws if the mock response itself doesn't satisfy the schema", async () => {
    const { generateStructured } = await import("@/lib/openai/generate-structured");
    const schema = z.object({ greeting: z.string() });

    await expect(
      generateStructured({
        taskType: "test-task",
        modelTask: "primary",
        systemPrompt: "system",
        userPrompt: "user",
        schema,
        // @ts-expect-error intentionally invalid for the test
        mockResponse: { greeting: 123 },
        userId: "user_1",
      })
    ).rejects.toThrow();
  });
});
