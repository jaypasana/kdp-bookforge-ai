import { z } from "zod";
import { SYSTEM_ROLE_PREAMBLE, delimitUntrustedInput } from "./shared";
import type { ChapterPlan } from "./outline-generator";

export const PROMPT_VERSION = 1;

export const chapterBriefSchema = z.object({
  purpose: z.string(),
  readerKnowledgeBefore: z.string(),
  readerKnowledgeAfter: z.string(),
  conceptsToExplain: z.array(z.string()),
  requiredExamples: z.array(z.string()),
  requiredExercises: z.array(z.string()),
  keyTerminology: z.array(z.string()),
  alreadyCoveredEarlier: z.array(z.string()),
  reservedForLater: z.array(z.string()),
  continuityNotes: z.array(z.string()),
  targetWordCount: z.number().int().min(500),
  requiredCallsToAction: z.array(z.string()),
  toneRequirements: z.string(),
  claimsRequiringVerification: z.array(z.string()),
});

export type ChapterBrief = z.infer<typeof chapterBriefSchema>;

export const chapterBriefSystemPrompt = `${SYSTEM_ROLE_PREAMBLE}

Task: Chapter brief. Before a chapter is written, produce an internal planning brief that prevents repetition and improves continuity with the rest of the book. Use the Book Bible (a running record of what's already been said) to identify what this chapter must NOT repeat.

Respond with a single JSON object matching exactly this shape:
{
  "purpose": string,
  "readerKnowledgeBefore": string,
  "readerKnowledgeAfter": string,
  "conceptsToExplain": string[],
  "requiredExamples": string[],
  "requiredExercises": string[],
  "keyTerminology": string[],
  "alreadyCoveredEarlier": string[],
  "reservedForLater": string[],
  "continuityNotes": string[],
  "targetWordCount": number,
  "requiredCallsToAction": string[],
  "toneRequirements": string,
  "claimsRequiringVerification": string[]
}`;

export function buildChapterBriefUserPrompt(input: {
  chapterPlan: ChapterPlan;
  bookBible: unknown;
  tone: string;
}): string {
  return [
    delimitUntrustedInput("chapter_plan", JSON.stringify(input.chapterPlan, null, 2)),
    delimitUntrustedInput("book_bible", JSON.stringify(input.bookBible, null, 2)),
    `Book tone: ${input.tone}`,
    "Produce the chapter brief JSON object described in your instructions.",
  ].join("\n\n");
}

export const chapterBriefMockResponse: ChapterBrief = {
  purpose: "Get the reader to commit to automating one workflow before introducing tools",
  readerKnowledgeBefore: "Knows AI exists but hasn't used it in their business",
  readerKnowledgeAfter: "Can name their highest-leverage automation opportunity",
  conceptsToExplain: ["Leverage vs. busywork"],
  requiredExamples: ["A solo agent automating open-house follow-ups"],
  requiredExercises: ["List your three most time-consuming weekly tasks"],
  keyTerminology: ["Workflow automation", "Lead follow-up cadence"],
  alreadyCoveredEarlier: [],
  reservedForLater: ["Specific tool names and setup steps"],
  continuityNotes: ["This is chapter 1 — no prior content to avoid repeating"],
  targetWordCount: 4000,
  requiredCallsToAction: ["Pick one workflow to automate first"],
  toneRequirements: "Professional but conversational",
  claimsRequiringVerification: [],
};
