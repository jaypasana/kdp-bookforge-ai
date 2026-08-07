import { describe, expect, it } from "vitest";
import { slugify, uniqueSlug } from "@/lib/slug";

describe("slugify", () => {
  it("converts a title into a lowercase hyphenated slug", () => {
    expect(slugify("AI for Real Estate Agents")).toBe("ai-for-real-estate-agents");
  });

  it("strips punctuation and collapses whitespace", () => {
    expect(slugify("  The #1 Guide: Selling, Fast!  ")).toBe("the-1-guide-selling-fast");
  });

  it("falls back to 'book' for empty/unsafe input", () => {
    expect(slugify("!!!")).toBe("book");
  });
});

describe("uniqueSlug", () => {
  it("appends a random suffix to the base slug", () => {
    const slug = uniqueSlug("My Book Title");
    expect(slug).toMatch(/^my-book-title-[a-z0-9]{5}$/);
  });
});
