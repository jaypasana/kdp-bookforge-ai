import { describe, expect, it } from "vitest";
import { safeParseJson, extractJsonLoosely } from "@/lib/openai/json-extract";

describe("safeParseJson", () => {
  it("parses valid JSON", () => {
    expect(safeParseJson('{"a":1}')).toEqual({ a: 1 });
  });

  it("returns undefined for invalid JSON", () => {
    expect(safeParseJson("not json")).toBeUndefined();
  });
});

describe("extractJsonLoosely", () => {
  it("extracts JSON from a markdown code fence", () => {
    const raw = 'Here you go:\n```json\n{"a": 1, "b": [1,2]}\n```\nHope that helps!';
    expect(extractJsonLoosely(raw)).toEqual({ a: 1, b: [1, 2] });
  });

  it("extracts a balanced JSON object surrounded by prose", () => {
    const raw = 'Sure, here is the result: {"a": {"nested": true}} — let me know if you need more.';
    expect(extractJsonLoosely(raw)).toEqual({ a: { nested: true } });
  });

  it("extracts a top-level JSON array", () => {
    const raw = "The list is [1, 2, 3] as requested.";
    expect(extractJsonLoosely(raw)).toEqual([1, 2, 3]);
  });

  it("returns undefined when there is no JSON at all", () => {
    expect(extractJsonLoosely("no json here")).toBeUndefined();
  });
});
