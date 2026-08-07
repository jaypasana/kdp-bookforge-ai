import { z } from "zod";
import { SYSTEM_ROLE_PREAMBLE, delimitUntrustedInput } from "./shared";

export const PROMPT_VERSION = 1;

export const finalQualityReviewSchema = z.object({
  overallScore: z.number().int().min(1).max(100),
  bookPromiseFulfilled: z.boolean(),
  sectionScores: z.array(z.object({ section: z.string(), score: z.number().int().min(1).max(100) })),
  issuesFound: z.array(
    z.object({
      category: z.enum([
        "logical_progression",
        "chapter_balance",
        "missing_topic",
        "repetition",
        "contradiction",
        "terminology_consistency",
        "tone_consistency",
        "duplicate_case_study",
        "weak_transition",
        "unsupported_claim",
        "incomplete_exercise",
        "missing_front_matter",
        "missing_back_matter",
        "formatting_readiness",
      ]),
      description: z.string(),
      location: z.string().optional(),
    })
  ),
  automaticFixesRecommended: z.array(z.string()),
  itemsRequiringHumanReview: z.array(z.string()),
});

export type FinalQualityReview = z.infer<typeof finalQualityReviewSchema>;

export const finalQualityReviewSystemPrompt = `${SYSTEM_ROLE_PREAMBLE}

Task: Full-manuscript quality review. Check whether the book promise is fulfilled, whether chapters progress logically and are reasonably balanced, and scan for repetition, contradictions, inconsistent terminology or tone, duplicate case studies, weak transitions, unsupported factual claims, incomplete exercises, and missing front/back matter. This manuscript must never be described as "KDP Ready" — only as having passed this internal review; publishing readiness always requires human approval of the compliance checklist.

Respond with a single JSON object matching exactly this shape:
{
  "overallScore": number,
  "bookPromiseFulfilled": boolean,
  "sectionScores": [{ "section": string, "score": number }],
  "issuesFound": [{ "category": string, "description": string, "location": string }],
  "automaticFixesRecommended": string[],
  "itemsRequiringHumanReview": string[]
}`;

export function buildFinalQualityReviewUserPrompt(input: {
  bookPromise: string;
  chapterSummaries: Array<{ chapterNumber: number; title: string; summary: string }>;
  hasFrontMatter: boolean;
  hasBackMatter: boolean;
}): string {
  return [
    delimitUntrustedInput(
      "manuscript_overview",
      JSON.stringify(
        {
          bookPromise: input.bookPromise,
          chapters: input.chapterSummaries,
          hasFrontMatter: input.hasFrontMatter,
          hasBackMatter: input.hasBackMatter,
        },
        null,
        2
      )
    ),
    "Produce the final quality review JSON object described in your instructions.",
  ].join("\n\n");
}

export const finalQualityReviewMockResponse: FinalQualityReview = {
  overallScore: 91,
  bookPromiseFulfilled: true,
  sectionScores: [{ section: "Chapter 1", score: 90 }],
  issuesFound: [],
  automaticFixesRecommended: [],
  itemsRequiringHumanReview: [
    "Verify all statistics and examples before publishing",
    "Confirm disclaimer language with a qualified professional if needed",
  ],
};
