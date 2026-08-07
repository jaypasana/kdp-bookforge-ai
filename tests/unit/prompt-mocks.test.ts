import { describe, expect, it } from "vitest";
import * as bookDiscovery from "@/lib/prompts/book-discovery";
import * as outlineGenerator from "@/lib/prompts/outline-generator";
import * as chapterBrief from "@/lib/prompts/chapter-brief";
import * as chapterWriter from "@/lib/prompts/chapter-writer";
import * as chapterReviewer from "@/lib/prompts/chapter-reviewer";
import * as continuityReviewer from "@/lib/prompts/continuity-reviewer";
import * as frontMatter from "@/lib/prompts/front-matter";
import * as backMatter from "@/lib/prompts/back-matter";
import * as kdpPackage from "@/lib/prompts/kdp-package";
import * as marketingPackage from "@/lib/prompts/marketing-package";
import * as docxFormatter from "@/lib/prompts/docx-formatter";
import * as finalQualityReview from "@/lib/prompts/final-quality-review";

/**
 * Every prompt module pairs a Zod schema with a mockResponse used when
 * OPENAI_MOCK=true. If the mock ever drifts from its own schema (e.g. an
 * array minimum gets bumped but the fixture doesn't), OPENAI_MOCK mode
 * breaks for everyone testing locally — catch that here instead of at
 * runtime deep inside the Inngest pipeline.
 */
const modules: Array<{ name: string; schema: { parse: (v: unknown) => unknown }; mock: unknown }> = [
  { name: "book-discovery", schema: bookDiscovery.bookDiscoverySchema, mock: bookDiscovery.bookDiscoveryMockResponse },
  { name: "outline-generator", schema: outlineGenerator.outlineSchema, mock: outlineGenerator.outlineMockResponse },
  { name: "chapter-brief", schema: chapterBrief.chapterBriefSchema, mock: chapterBrief.chapterBriefMockResponse },
  { name: "chapter-writer", schema: chapterWriter.chapterSectionSchema, mock: chapterWriter.chapterWriterMockResponse },
  { name: "chapter-reviewer", schema: chapterReviewer.chapterReviewSchema, mock: chapterReviewer.chapterReviewMockResponse },
  {
    name: "continuity-reviewer",
    schema: continuityReviewer.bookBibleSchema,
    mock: continuityReviewer.continuityReviewerMockResponse,
  },
  { name: "front-matter", schema: frontMatter.frontMatterSchema, mock: frontMatter.frontMatterMockResponse },
  { name: "back-matter", schema: backMatter.backMatterSchema, mock: backMatter.backMatterMockResponse },
  { name: "kdp-package", schema: kdpPackage.kdpPackageSchema, mock: kdpPackage.kdpPackageMockResponse },
  {
    name: "marketing-package",
    schema: marketingPackage.marketingPackageSchema,
    mock: marketingPackage.marketingPackageMockResponse,
  },
  { name: "docx-formatter", schema: docxFormatter.docxFormatterSchema, mock: docxFormatter.docxFormatterMockResponse },
  {
    name: "final-quality-review",
    schema: finalQualityReview.finalQualityReviewSchema,
    mock: finalQualityReview.finalQualityReviewMockResponse,
  },
];

describe("prompt mock responses satisfy their own schemas", () => {
  it.each(modules)("$name", ({ schema, mock }) => {
    expect(() => schema.parse(mock)).not.toThrow();
  });
});
