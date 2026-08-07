import { z } from "zod";
import { SYSTEM_ROLE_PREAMBLE, delimitUntrustedInput } from "./shared";

export const PROMPT_VERSION = 1;

export const DISCLAIMER_CATEGORIES = [
  "general_educational",
  "business",
  "financial",
  "legal",
  "medical_or_health",
  "technology",
  "professional_services",
  "results_and_earnings",
  "affiliate_disclosure",
] as const;

export const frontMatterSchema = z.object({
  dedication: z.string().optional(),
  acknowledgments: z.string().optional(),
  introduction: z.string(),
  howToUseThisBook: z.string(),
  disclaimer: z
    .object({
      category: z.enum(DISCLAIMER_CATEGORIES),
      text: z.string(),
    })
    .optional(),
});

export type FrontMatter = z.infer<typeof frontMatterSchema>;

export const frontMatterSystemPrompt = `${SYSTEM_ROLE_PREAMBLE}

Task: Front matter. Write the Introduction (hooks the reader, states the book's promise) and a short "How to Use This Book" section. Include a dedication and acknowledgments only if they fit naturally for this book type — otherwise omit them. Include a disclaimer only if the book discovery flagged one as required; pick the single most relevant category and write plain, honest disclaimer language that does not imply it replaces advice from a qualified professional.

Respond with a single JSON object matching exactly this shape:
{
  "dedication": string (omit if not applicable),
  "acknowledgments": string (omit if not applicable),
  "introduction": string,
  "howToUseThisBook": string,
  "disclaimer": { "category": string, "text": string } (omit if no disclaimer is needed)
}`;

export function buildFrontMatterUserPrompt(input: {
  title: string;
  subtitle?: string;
  bookPromise: string;
  disclaimerRequired: boolean;
  disclaimerReason?: string;
}): string {
  return [
    delimitUntrustedInput(
      "book_context",
      JSON.stringify(
        {
          title: input.title,
          subtitle: input.subtitle,
          bookPromise: input.bookPromise,
          disclaimerRequired: input.disclaimerRequired,
          disclaimerReason: input.disclaimerReason,
        },
        null,
        2
      )
    ),
    "Produce the front matter JSON object described in your instructions.",
  ].join("\n\n");
}

export const frontMatterMockResponse: FrontMatter = {
  introduction:
    "If you're a real estate professional wondering whether AI is worth the hype, this book is for you...",
  howToUseThisBook:
    "Each chapter builds on the last. Read in order the first time through, then use it as a reference afterward.",
  disclaimer: {
    category: "business",
    text: "This book provides general business and marketing education. It is not legal, financial, or fair-housing compliance advice — consult a qualified professional for guidance specific to your market and brokerage.",
  },
};
