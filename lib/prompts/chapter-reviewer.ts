import { z } from "zod";
import { SYSTEM_ROLE_PREAMBLE, delimitUntrustedInput } from "./shared";

export const PROMPT_VERSION = 1;

export const CHAPTER_SCORE_DIMENSIONS = [
  "clarity",
  "depth",
  "practicalValue",
  "organization",
  "audienceFit",
  "originality",
  "readability",
  "exampleQuality",
  "actionability",
  "repetitionControl",
  "toneConsistency",
  "transitionQuality",
] as const;

const scoreShape = Object.fromEntries(
  CHAPTER_SCORE_DIMENSIONS.map((d) => [d, z.number().int().min(1).max(100)])
) as Record<(typeof CHAPTER_SCORE_DIMENSIONS)[number], z.ZodNumber>;

export const chapterReviewSchema = z.object({
  scores: z.object(scoreShape),
  overallScore: z.number().int().min(1).max(100),
  weaknesses: z.array(z.string()),
  revisionInstructions: z.array(z.string()),
});

export type ChapterReview = z.infer<typeof chapterReviewSchema>;

export const MINIMUM_PASSING_SCORE = 85;
export const MAX_AUTOMATIC_REVISIONS = 2;

export const chapterReviewerSystemPrompt = `${SYSTEM_ROLE_PREAMBLE}

Task: Chapter quality review. Score the chapter from 1-100 on each dimension listed, then compute an overall score. If overallScore is below ${MINIMUM_PASSING_SCORE}, list the exact weaknesses and give specific, actionable revision instructions targeting only the weak sections — do not ask for a full rewrite unless the chapter is fundamentally broken.

Respond with a single JSON object matching exactly this shape:
{
  "scores": { ${CHAPTER_SCORE_DIMENSIONS.map((d) => `"${d}": number`).join(", ")} },
  "overallScore": number,
  "weaknesses": string[],
  "revisionInstructions": string[]
}`;

export function buildChapterReviewerUserPrompt(input: {
  chapterTitle: string;
  chapterContent: string;
  tone: string;
}): string {
  return [
    `Chapter title: ${input.chapterTitle}`,
    `Expected tone: ${input.tone}`,
    delimitUntrustedInput("chapter_content", input.chapterContent),
    "Produce the review JSON object described in your instructions.",
  ].join("\n\n");
}

export const chapterReviewMockResponse: ChapterReview = {
  scores: {
    clarity: 90,
    depth: 88,
    practicalValue: 92,
    organization: 90,
    audienceFit: 89,
    originality: 91,
    readability: 93,
    exampleQuality: 87,
    actionability: 90,
    repetitionControl: 94,
    toneConsistency: 92,
    transitionQuality: 88,
  },
  overallScore: 90,
  weaknesses: [],
  revisionInstructions: [],
};
