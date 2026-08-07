import { z } from "zod";
import { SYSTEM_ROLE_PREAMBLE, delimitUntrustedInput } from "./shared";
import type { BookDiscovery } from "./book-discovery";

export const PROMPT_VERSION = 1;

export const chapterPlanSchema = z.object({
  chapterNumber: z.number().int().min(1),
  chapterTitle: z.string(),
  chapterGoal: z.string(),
  chapterSummary: z.string(),
  learningObjectives: z.array(z.string()),
  mainTopics: z.array(z.string()),
  subtopics: z.array(z.string()),
  practicalExamples: z.array(z.string()),
  suggestedCaseStudy: z.string().optional(),
  stepByStepProcess: z.array(z.string()),
  commonMistakes: z.array(z.string()),
  proTips: z.array(z.string()),
  faqs: z.array(z.string()),
  exercises: z.array(z.string()),
  reflectionQuestions: z.array(z.string()),
  actionChecklist: z.array(z.string()),
  keyTakeaways: z.array(z.string()),
  transitionToNext: z.string().optional(),
  targetWordCount: z.number().int().min(500),
});

export type ChapterPlan = z.infer<typeof chapterPlanSchema>;

export const outlineSchema = z.object({
  chapters: z.array(chapterPlanSchema).min(3),
  totalEstimatedWordCount: z.number().int(),
});

export type Outline = z.infer<typeof outlineSchema>;

export const outlineGeneratorSystemPrompt = `${SYSTEM_ROLE_PREAMBLE}

Task: Table of contents / outline generation. Design a logical chapter sequence that moves the reader from beginner to advanced, where every chapter contributes something unique. Reject your own draft internally and revise before responding if it contains duplicate chapter concepts, weak progression, chapters that could be merged, generic filler sections, unsupported promises, or titles unrelated to the book promise.

Respond with a single JSON object matching exactly this shape:
{
  "chapters": [{
    "chapterNumber": number,
    "chapterTitle": string,
    "chapterGoal": string,
    "chapterSummary": string,
    "learningObjectives": string[],
    "mainTopics": string[],
    "subtopics": string[],
    "practicalExamples": string[],
    "suggestedCaseStudy": string,
    "stepByStepProcess": string[],
    "commonMistakes": string[],
    "proTips": string[],
    "faqs": string[],
    "exercises": string[],
    "reflectionQuestions": string[],
    "actionChecklist": string[],
    "keyTakeaways": string[],
    "transitionToNext": string,
    "targetWordCount": number
  }],
  "totalEstimatedWordCount": number
}`;

export function buildOutlineGeneratorUserPrompt(input: {
  discovery: BookDiscovery;
  chapterCount: number;
  wordsPerChapter: number;
}): string {
  return [
    delimitUntrustedInput("book_discovery", JSON.stringify(input.discovery, null, 2)),
    `Target chapter count: ${input.chapterCount}`,
    `Target words per chapter: ${input.wordsPerChapter}`,
    "Produce the outline JSON object described in your instructions.",
  ].join("\n\n");
}

function mockChapter(chapterNumber: number): ChapterPlan {
  return {
    chapterNumber,
    chapterTitle: `Mock Chapter ${chapterNumber}`,
    chapterGoal: "Build buy-in and set expectations",
    chapterSummary: "Introduces where AI fits into a real estate business and what it won't do.",
    learningObjectives: ["Understand realistic AI use cases in real estate"],
    mainTopics: ["AI hype vs. reality", "Where AI creates the most leverage"],
    subtopics: ["Lead gen", "Follow-up", "Marketing content"],
    practicalExamples: ["A solo agent automating open-house follow-ups"],
    suggestedCaseStudy: "A two-agent team cutting follow-up time by 70%",
    stepByStepProcess: ["Audit current workflow", "Identify the highest-leverage bottleneck"],
    commonMistakes: ["Trying to automate everything at once"],
    proTips: ["Start with one workflow before expanding"],
    faqs: ["Do I need to be technical to use this?"],
    exercises: ["List your three most time-consuming weekly tasks"],
    reflectionQuestions: ["Where do leads currently fall through the cracks?"],
    actionChecklist: ["Pick one workflow to automate first"],
    keyTakeaways: ["AI amplifies an existing process — it doesn't replace strategy"],
    transitionToNext: "Next, we'll map your lead sources before adding any tools.",
    targetWordCount: 4000,
  };
}

export const outlineMockResponse: Outline = {
  // outlineSchema requires at least 3 chapters — keep this in sync with that minimum.
  chapters: [1, 2, 3].map(mockChapter),
  totalEstimatedWordCount: 12000,
};
