import { z } from "zod";
import { SYSTEM_ROLE_PREAMBLE, delimitUntrustedInput } from "./shared";

export const PROMPT_VERSION = 1;

export const bookDiscoverySchema = z.object({
  interpretedTitle: z.string(),
  proposedSubtitle: z.string(),
  niche: z.string(),
  bookType: z.string(),
  targetAudience: z.array(z.string()).min(1),
  readerLevel: z.string(),
  painPoints: z.array(z.string()).min(1),
  desiredOutcomes: z.array(z.string()).min(1),
  frequentlyAskedQuestions: z.array(z.string()),
  commonMistakes: z.array(z.string()),
  knowledgeGaps: z.array(z.string()),
  uniqueSellingProposition: z.string(),
  bookPromise: z.string(),
  recommendedTone: z.string(),
  recommendedChapterCount: z.number().int().min(3).max(40),
  recommendedWordCount: z.number().int().min(10000).max(150000),
  recommendedBonuses: z.array(z.string()),
  disclaimerRequired: z.boolean(),
  disclaimerReason: z.string().optional(),
  sensitiveTopics: z.array(z.string()),
});

export type BookDiscovery = z.infer<typeof bookDiscoverySchema>;

export const bookDiscoverySystemPrompt = `${SYSTEM_ROLE_PREAMBLE}

Task: Book discovery. From a proposed ebook title and optional notes, infer the niche, ideal reader, their pain points and goals, and the overall book plan. Identify typical information gaps in this niche so the resulting book is more practical, organized, and useful than a generic introductory book in the space. Flag any topics that are time-sensitive, legal, medical, financial, or otherwise require a disclaimer or careful factual verification — do not fabricate a need for one where none exists.

Respond with a single JSON object matching exactly this shape:
{
  "interpretedTitle": string,
  "proposedSubtitle": string,
  "niche": string,
  "bookType": string,
  "targetAudience": string[],
  "readerLevel": string,
  "painPoints": string[],
  "desiredOutcomes": string[],
  "frequentlyAskedQuestions": string[],
  "commonMistakes": string[],
  "knowledgeGaps": string[],
  "uniqueSellingProposition": string,
  "bookPromise": string,
  "recommendedTone": string,
  "recommendedChapterCount": number,
  "recommendedWordCount": number,
  "recommendedBonuses": string[],
  "disclaimerRequired": boolean,
  "disclaimerReason": string (omit if disclaimerRequired is false),
  "sensitiveTopics": string[]
}`;

export function buildBookDiscoveryUserPrompt(input: {
  title: string;
  notes?: string;
  overrides?: Partial<{
    niche: string;
    bookType: string;
    targetAudience: string;
    readerLevel: string;
    primaryReaderProblem: string;
    desiredTransformation: string;
  }>;
}): string {
  const parts = [delimitUntrustedInput("book_title", input.title)];
  if (input.notes) parts.push(delimitUntrustedInput("author_notes", input.notes));
  if (input.overrides) {
    const overrideLines = Object.entries(input.overrides)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
    if (overrideLines) {
      parts.push(
        delimitUntrustedInput(
          "author_overrides",
          `The author has explicitly specified the following — honor these rather than inferring them:\n${overrideLines}`
        )
      );
    }
  }
  parts.push("Produce the book discovery JSON object described in your instructions.");
  return parts.join("\n\n");
}

export const bookDiscoveryMockResponse: BookDiscovery = {
  interpretedTitle: "AI for Real Estate Agents",
  proposedSubtitle: "A Practical Playbook for Saving Time, Generating Leads, and Closing More Deals",
  niche: "Artificial intelligence for real estate professionals",
  bookType: "How-to guide",
  targetAudience: ["Realtors", "Brokers", "Property consultants", "Sales managers", "Real estate teams"],
  readerLevel: "Beginner to intermediate",
  painPoints: [
    "Too much time spent on manual follow-ups",
    "Inconsistent lead generation",
    "Difficulty keeping marketing content fresh",
  ],
  desiredOutcomes: ["Save time on repetitive tasks", "Generate more qualified leads", "Close more deals"],
  frequentlyAskedQuestions: [
    "Which AI tools are worth paying for?",
    "Is AI-generated marketing copy compliant with fair housing rules?",
  ],
  commonMistakes: ["Automating outreach without a human review step", "Ignoring data privacy basics"],
  knowledgeGaps: ["How to integrate AI tools with an existing CRM"],
  uniqueSellingProposition: "A step-by-step, tool-agnostic system rather than a list of app recommendations",
  bookPromise: "Readers will leave with a repeatable AI-assisted workflow for lead generation and follow-up",
  recommendedTone: "Professional but conversational",
  recommendedChapterCount: 12,
  recommendedWordCount: 50000,
  recommendedBonuses: ["Prompt template pack", "30-day implementation checklist"],
  disclaimerRequired: true,
  disclaimerReason: "Covers marketing compliance and business practices, not legal advice",
  sensitiveTopics: ["Fair housing marketing compliance"],
};
