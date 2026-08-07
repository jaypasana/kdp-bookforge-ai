import { z } from "zod";
import { SYSTEM_ROLE_PREAMBLE, delimitUntrustedInput } from "./shared";
import type { BookDiscovery } from "./book-discovery";

export const PROMPT_VERSION = 1;

export const kdpPackageSchema = z.object({
  positioning: z.object({
    idealCustomerProfile: z.string(),
    painPoints: z.array(z.string()),
    goals: z.array(z.string()),
    purchaseMotivation: z.string(),
    bookPromise: z.string(),
    uniqueSellingProposition: z.string(),
    differentiationStrategy: z.string(),
  }),
  titles: z.array(z.string()).length(10),
  subtitles: z.array(z.string()).length(10),
  recommendedTitle: z.string(),
  recommendedSubtitle: z.string(),
  recommendationRationale: z.string(),
  description: z.object({
    plainText: z.string(),
    html: z.string(),
  }),
  keywords: z.object({
    primary: z.string(),
    secondary: z.array(z.string()),
    longTail: z.array(z.string()),
    readerIntentPhrases: z.array(z.string()),
    backendKeywords: z.array(z.string()).length(7),
    avoid: z.array(z.string()),
    disclaimer: z.literal(
      "Keyword hypotheses requiring marketplace validation"
    ),
  }),
  categories: z.array(
    z.object({
      name: z.string(),
      relevance: z.string(),
      readerIntentFit: z.string(),
      competitionAssumption: z.string(),
      validationNote: z.literal(
        "Verify current availability and competition directly in KDP before publishing"
      ),
    })
  ),
  pricing: z.object({
    kindleLaunchPrice: z.string(),
    kindleRegularPrice: z.string(),
    paperback: z.string(),
    hardcover: z.string().optional(),
    promotionalPrice: z.string().optional(),
    rationale: z.string(),
    royaltyConsiderations: z.string(),
    competitorValidationChecklist: z.array(z.string()),
    internationalPricingReminder: z.string(),
  }),
});

export type KdpPackage = z.infer<typeof kdpPackageSchema>;

export const kdpPackageSystemPrompt = `${SYSTEM_ROLE_PREAMBLE}

Task: Amazon KDP optimization package — positioning, titles, description, keywords, categories, and pricing. Never use misleading claims, unauthorized trademarks, competitor author names, "bestseller" language, keyword stuffing, or unverifiable superlatives. Label keyword output exactly as "Keyword hypotheses requiring marketplace validation" and every category's validationNote exactly as "Verify current availability and competition directly in KDP before publishing" — do not claim live marketplace data you don't have. Do not treat pricing figures as permanent platform policy.

Respond with a single JSON object matching exactly this shape:
{
  "positioning": { "idealCustomerProfile": string, "painPoints": string[], "goals": string[], "purchaseMotivation": string, "bookPromise": string, "uniqueSellingProposition": string, "differentiationStrategy": string },
  "titles": string[10],
  "subtitles": string[10],
  "recommendedTitle": string,
  "recommendedSubtitle": string,
  "recommendationRationale": string,
  "description": { "plainText": string, "html": string },
  "keywords": { "primary": string, "secondary": string[], "longTail": string[], "readerIntentPhrases": string[], "backendKeywords": string[7], "avoid": string[], "disclaimer": "Keyword hypotheses requiring marketplace validation" },
  "categories": [{ "name": string, "relevance": string, "readerIntentFit": string, "competitionAssumption": string, "validationNote": "Verify current availability and competition directly in KDP before publishing" }],
  "pricing": { "kindleLaunchPrice": string, "kindleRegularPrice": string, "paperback": string, "hardcover": string, "promotionalPrice": string, "rationale": string, "royaltyConsiderations": string, "competitorValidationChecklist": string[], "internationalPricingReminder": string }
}`;

export function buildKdpPackageUserPrompt(input: {
  title: string;
  subtitle?: string;
  discovery: BookDiscovery;
}): string {
  return [
    delimitUntrustedInput(
      "book_context",
      JSON.stringify({ title: input.title, subtitle: input.subtitle, discovery: input.discovery }, null, 2)
    ),
    "Produce the KDP package JSON object described in your instructions.",
  ].join("\n\n");
}

export const kdpPackageMockResponse: KdpPackage = {
  positioning: {
    idealCustomerProfile: "Independent real estate agents and small teams",
    painPoints: ["Not enough time for follow-up", "Inconsistent lead flow"],
    goals: ["Save time", "Close more deals"],
    purchaseMotivation: "Wants a practical system, not another app recommendation list",
    bookPromise: "A repeatable AI-assisted workflow for lead generation and follow-up",
    uniqueSellingProposition: "Tool-agnostic system rather than a list of apps",
    differentiationStrategy: "Focuses on workflow design before tool selection",
  },
  titles: Array.from({ length: 10 }, (_, i) => `AI for Real Estate Agents ${i + 1}`),
  subtitles: Array.from({ length: 10 }, (_, i) => `A Practical Playbook ${i + 1}`),
  recommendedTitle: "AI for Real Estate Agents",
  recommendedSubtitle: "A Practical Playbook for Saving Time, Generating Leads, and Closing More Deals",
  recommendationRationale: "Clear, keyword-relevant, and matches search intent without overclaiming.",
  description: {
    plainText: "Stop chasing leads and start closing them...",
    html: "<p>Stop chasing leads and start closing them...</p>",
  },
  keywords: {
    primary: "ai for real estate agents",
    secondary: ["real estate automation", "ai lead generation"],
    longTail: ["how real estate agents can use ai to save time"],
    readerIntentPhrases: ["ai tools for realtors"],
    backendKeywords: ["realtor", "broker", "crm", "automation", "leads", "follow up", "marketing"],
    avoid: ["guaranteed income", "get rich"],
    disclaimer: "Keyword hypotheses requiring marketplace validation",
  },
  categories: [
    {
      name: "Business & Money > Real Estate",
      relevance: "Direct topical match",
      readerIntentFit: "High",
      competitionAssumption: "Moderate",
      validationNote: "Verify current availability and competition directly in KDP before publishing",
    },
  ],
  pricing: {
    kindleLaunchPrice: "$2.99",
    kindleRegularPrice: "$6.99",
    paperback: "$14.99",
    rationale: "Launch price maximizes early visibility; regular price matches category norms",
    royaltyConsiderations: "70% royalty tier applies between $2.99–$9.99 on Kindle",
    competitorValidationChecklist: ["Check top 20 category bestsellers' current pricing"],
    internationalPricingReminder: "Review territory-specific pricing in KDP before publishing",
  },
};
