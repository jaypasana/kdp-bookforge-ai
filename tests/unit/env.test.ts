import { describe, expect, it, beforeEach, vi } from "vitest";

describe("getEnv", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("throws a descriptive error when required vars are missing", async () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("AUTH_SECRET", "");
    const { getEnv } = await import("@/lib/env");
    expect(() => getEnv()).toThrow(/Invalid environment configuration/);
  });

  it("parses a valid environment", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://user:pass@localhost:5432/db");
    vi.stubEnv("AUTH_SECRET", "a".repeat(32));
    vi.stubEnv("OPENAI_MOCK", "true");
    const { getEnv } = await import("@/lib/env");
    const env = getEnv();
    expect(env.DATABASE_URL).toContain("postgresql://");
    expect(env.OPENAI_MOCK).toBe(true);
  });

  it("requires OPENAI_API_KEY unless OPENAI_MOCK is true", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://user:pass@localhost:5432/db");
    vi.stubEnv("AUTH_SECRET", "a".repeat(32));
    vi.stubEnv("OPENAI_MOCK", "false");
    vi.stubEnv("OPENAI_API_KEY", "");
    const { getEnv } = await import("@/lib/env");
    expect(() => getEnv()).toThrow(/OPENAI_API_KEY is required/);
  });
});
