import { z } from "zod";
import { SYSTEM_ROLE_PREAMBLE, delimitUntrustedInput } from "./shared";

export const PROMPT_VERSION = 1;

export const bookBibleSchema = z.object({
  bookPromise: z.string(),
  targetAudience: z.string(),
  tone: z.string(),
  preferredTerminology: z.array(z.string()),
  definitions: z.record(z.string(), z.string()),
  keyFrameworks: z.array(z.string()),
  namedExamples: z.array(z.string()),
  caseStudyCharacters: z.array(z.string()),
  conceptsCovered: z.array(z.string()),
  chapterSummaries: z.array(z.object({ chapterNumber: z.number().int(), summary: z.string() })),
  claimsUsed: z.array(z.string()),
  toolsMentioned: z.array(z.string()),
  acronyms: z.array(z.string()),
  styleRules: z.array(z.string()),
  topicsStillToDiscuss: z.array(z.string()),
  prohibitedRepetition: z.array(z.string()),
});

export type BookBible = z.infer<typeof bookBibleSchema>;

export function emptyBookBible(bookPromise: string, targetAudience: string, tone: string): BookBible {
  return {
    bookPromise,
    targetAudience,
    tone,
    preferredTerminology: [],
    definitions: {},
    keyFrameworks: [],
    namedExamples: [],
    caseStudyCharacters: [],
    conceptsCovered: [],
    chapterSummaries: [],
    claimsUsed: [],
    toolsMentioned: [],
    acronyms: [],
    styleRules: [],
    topicsStillToDiscuss: [],
    prohibitedRepetition: [],
  };
}

export const continuityReviewerSystemPrompt = `${SYSTEM_ROLE_PREAMBLE}

Task: Continuity/Book Bible update. Given the current Book Bible and the chapter that was just written, produce an UPDATED Book Bible: merge in anything new from this chapter (terminology, definitions, frameworks, named examples, tools mentioned, claims made) without duplicating existing entries, add a concise summary of this chapter, and note anything that should NOT be repeated in later chapters. Keep the whole object concise — summarize, don't transcribe.

Respond with a single JSON object that is the complete updated Book Bible, matching exactly this shape:
{
  "bookPromise": string,
  "targetAudience": string,
  "tone": string,
  "preferredTerminology": string[],
  "definitions": { [term: string]: string },
  "keyFrameworks": string[],
  "namedExamples": string[],
  "caseStudyCharacters": string[],
  "conceptsCovered": string[],
  "chapterSummaries": [{ "chapterNumber": number, "summary": string }],
  "claimsUsed": string[],
  "toolsMentioned": string[],
  "acronyms": string[],
  "styleRules": string[],
  "topicsStillToDiscuss": string[],
  "prohibitedRepetition": string[]
}`;

export function buildContinuityReviewerUserPrompt(input: {
  currentBookBible: BookBible;
  chapterNumber: number;
  chapterTitle: string;
  chapterContent: string;
}): string {
  return [
    delimitUntrustedInput("current_book_bible", JSON.stringify(input.currentBookBible, null, 2)),
    `Chapter ${input.chapterNumber}: ${input.chapterTitle}`,
    delimitUntrustedInput("chapter_content", input.chapterContent),
    "Produce the updated Book Bible JSON object described in your instructions.",
  ].join("\n\n");
}

export const continuityReviewerMockResponse: BookBible = {
  ...emptyBookBible(
    "Readers will leave with a repeatable AI-assisted workflow for lead generation and follow-up",
    "Realtors, brokers, property consultants",
    "Professional but conversational"
  ),
  conceptsCovered: ["Leverage vs. busywork"],
  chapterSummaries: [{ chapterNumber: 1, summary: "Introduced AI's realistic role in a real estate business." }],
};
