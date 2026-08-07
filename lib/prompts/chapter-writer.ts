import { z } from "zod";
import { SYSTEM_ROLE_PREAMBLE, delimitUntrustedInput } from "./shared";
import type { ChapterPlan } from "./outline-generator";
import type { ChapterBrief } from "./chapter-brief";

export const PROMPT_VERSION = 1;

/**
 * A chapter is written in sections (spec section 12) rather than one huge
 * request. Each section stage below produces prose for part of the chapter;
 * the pipeline (Phase 4) calls this repeatedly with a different `stage` and
 * concatenates the results, then runs a chapter-level edit pass.
 */
export const CHAPTER_WRITING_STAGES = [
  "opening_and_concepts",
  "implementation",
  "examples_and_case_study",
  "mistakes_tips_faq",
  "summary_and_exercises",
] as const;
export type ChapterWritingStage = (typeof CHAPTER_WRITING_STAGES)[number];

export const chapterSectionSchema = z.object({
  heading: z.string().optional(),
  content: z.string().min(1),
});
export type ChapterSectionDraft = z.infer<typeof chapterSectionSchema>;

const STAGE_INSTRUCTIONS: Record<ChapterWritingStage, string> = {
  opening_and_concepts:
    "Write the chapter opening (hook the reader, state why this topic matters) and explain the key concepts the reader needs before going further. Do not restate material from earlier chapters — see continuity notes.",
  implementation:
    "Write the step-by-step implementation section: the concrete process the reader follows to apply this chapter's concepts.",
  examples_and_case_study:
    "Write a practical example or realistic case study that shows the concepts and process in action. Use realistic but clearly original scenarios — no real named individuals, no fabricated statistics.",
  mistakes_tips_faq:
    "Write the common mistakes, pro tips, and a short FAQ section for this chapter.",
  summary_and_exercises:
    "Write the chapter summary, action checklist, exercises, reflection questions, key takeaways, and a one-paragraph transition to the next chapter.",
};

export const chapterWriterSystemPrompt = `${SYSTEM_ROLE_PREAMBLE}

Task: Chapter drafting, one section of the chapter at a time. Write professional-but-conversational, original, practical prose. Requirements: clear enough for beginners, valuable enough for intermediate readers, advanced concepts introduced progressively, short readable paragraphs, natural headings, bullet lists only where they genuinely help, plain-language explanations, realistic examples. Do not use filler, fake quotations, fake testimonials, invented research, unsupported statistics, repeated introduction material, excessive recaps, or excessive motivational language. Do not mention being an AI or reference prompts/internal processes. Do not use markdown symbols like #, **, or code fences — write plain prose with clear paragraph breaks; use a line starting with a heading phrase only when a genuine subheading is warranted.

Respond with a single JSON object matching exactly this shape:
{ "heading": string (a short subheading for this section, omit if not needed), "content": string (the prose for this section) }`;

export function buildChapterWriterUserPrompt(input: {
  stage: ChapterWritingStage;
  chapterPlan: ChapterPlan;
  brief: ChapterBrief;
  tone: string;
  previousSectionsSummary?: string;
}): string {
  const parts = [
    delimitUntrustedInput("chapter_plan", JSON.stringify(input.chapterPlan, null, 2)),
    delimitUntrustedInput("chapter_brief", JSON.stringify(input.brief, null, 2)),
    `Tone: ${input.tone}`,
    `This section's job: ${STAGE_INSTRUCTIONS[input.stage]}`,
  ];
  if (input.previousSectionsSummary) {
    parts.push(
      delimitUntrustedInput(
        "already_written_in_this_chapter",
        input.previousSectionsSummary
      )
    );
  }
  parts.push("Produce the section JSON object described in your instructions.");
  return parts.join("\n\n");
}

export const chapterWriterMockResponse: ChapterSectionDraft = {
  heading: "Why AI, Why Now",
  content:
    "Most agents don't need more leads — they need more time to work the leads they already have. That's the gap AI closes: not by replacing your judgment, but by handling the repetitive parts of follow-up, scheduling, and content drafting so you can spend your time where it actually moves deals forward.",
};
