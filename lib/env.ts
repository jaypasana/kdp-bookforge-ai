import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  DATABASE_URL: z.url({ message: "DATABASE_URL must be a valid connection string" }),

  AUTH_SECRET: z
    .string()
    .min(16, "AUTH_SECRET must be at least 16 characters — generate with `npx auth secret`"),
  NEXTAUTH_URL: z.url().optional(),

  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required").optional(),
  OPENAI_MODEL_PRIMARY: z.string().default("gpt-5"),
  OPENAI_MODEL_FAST: z.string().default("gpt-5-mini"),
  OPENAI_MODEL_REVIEW: z.string().default("gpt-5"),
  OPENAI_MODEL_RESEARCH: z.string().default("gpt-5"),
  OPENAI_MOCK: z
    .string()
    .default("false")
    .transform((v) => v === "true"),

  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | undefined;

/**
 * Validates process.env once and caches the result. Throws a descriptive
 * error at boot if required variables are missing/malformed rather than
 * failing confusingly deep inside a request handler.
 */
export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Invalid environment configuration. Check your .env file against .env.example:\n${issues}`
    );
  }

  if (!parsed.data.OPENAI_API_KEY && !parsed.data.OPENAI_MOCK) {
    throw new Error(
      "OPENAI_API_KEY is required unless OPENAI_MOCK=true. Set it in your .env file."
    );
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}
