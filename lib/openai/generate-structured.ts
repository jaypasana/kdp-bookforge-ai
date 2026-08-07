import "server-only";
import type { ZodType } from "zod";
import { getOpenAIClient } from "./client";
import { resolveModel, type ModelTask } from "./models";
import { calculateCost } from "./pricing";
import { safeParseJson, extractJsonLoosely } from "./json-extract";
import { getEnv } from "@/lib/env";
import { prisma } from "@/lib/db/prisma";

export class GenerationValidationError extends Error {
  raw: string;
  constructor(message: string, raw: string) {
    super(message);
    this.name = "GenerationValidationError";
    this.raw = raw;
  }
}

export type GenerateStructuredOptions<T> = {
  /** Stable identifier for this pipeline stage, e.g. "book-discovery". Used for ApiUsage.taskType and logging. */
  taskType: string;
  modelTask: ModelTask;
  systemPrompt: string;
  userPrompt: string;
  schema: ZodType<T>;
  /**
   * A value satisfying `schema`, used verbatim when OPENAI_MOCK=true. Also
   * doubles as living documentation of the expected shape for this task.
   */
  mockResponse: T;
  userId: string;
  bookProjectId?: string;
};

async function logUsage(entry: {
  userId: string;
  bookProjectId?: string;
  taskType: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  durationMs: number;
  retryCount: number;
  responseId?: string;
}) {
  await prisma.apiUsage.create({
    data: {
      userId: entry.userId,
      bookProjectId: entry.bookProjectId,
      taskType: entry.taskType,
      model: entry.model,
      inputTokens: entry.inputTokens,
      outputTokens: entry.outputTokens,
      estimatedCost: calculateCost(entry.model, entry.inputTokens, entry.outputTokens),
      durationMs: entry.durationMs,
      retryCount: entry.retryCount,
      responseId: entry.responseId,
    },
  });
}

/**
 * Runs a single structured-output OpenAI call and validates the result
 * against a Zod schema, with one repair-retry and a loose-JSON-extraction
 * fallback before giving up (spec section 7). Every call — mocked or real —
 * is logged to ApiUsage for cost tracking.
 */
export async function generateStructured<T>(
  options: GenerateStructuredOptions<T>
): Promise<T> {
  const env = getEnv();
  const model = resolveModel(options.modelTask);
  const startedAt = Date.now();

  if (env.OPENAI_MOCK) {
    const parsed = options.schema.parse(options.mockResponse);
    await logUsage({
      userId: options.userId,
      bookProjectId: options.bookProjectId,
      taskType: options.taskType,
      model: `mock:${model}`,
      inputTokens: 0,
      outputTokens: 0,
      durationMs: Date.now() - startedAt,
      retryCount: 0,
    });
    return parsed;
  }

  const client = getOpenAIClient();

  async function callOnce(userInput: string) {
    return client.responses.create({
      model,
      instructions: options.systemPrompt,
      input: userInput,
      text: { format: { type: "json_object" } },
    });
  }

  let retryCount = 0;
  let response = await callOnce(options.userPrompt);
  let raw = response.output_text ?? "";
  let parsed = safeParseJson(raw);
  let result = parsed !== undefined ? options.schema.safeParse(parsed) : undefined;

  if (!result?.success) {
    retryCount = 1;
    const repairPrompt = [
      options.userPrompt,
      "",
      "Your previous response could not be parsed as valid JSON matching the required schema.",
      "Previous response:",
      raw,
      "",
      "Respond again with ONLY a single valid JSON object matching the required schema. No markdown, no commentary.",
    ].join("\n");

    response = await callOnce(repairPrompt);
    raw = response.output_text ?? "";
    parsed = safeParseJson(raw) ?? extractJsonLoosely(raw);
    result = parsed !== undefined ? options.schema.safeParse(parsed) : undefined;
  }

  await logUsage({
    userId: options.userId,
    bookProjectId: options.bookProjectId,
    taskType: options.taskType,
    model,
    inputTokens: response.usage?.input_tokens ?? 0,
    outputTokens: response.usage?.output_tokens ?? 0,
    durationMs: Date.now() - startedAt,
    retryCount,
    responseId: response.id,
  });

  if (!result?.success) {
    throw new GenerationValidationError(
      `OpenAI response for task "${options.taskType}" did not match the expected schema after a repair retry.`,
      raw
    );
  }

  return result.data;
}
