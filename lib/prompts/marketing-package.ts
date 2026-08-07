import { z } from "zod";
import { SYSTEM_ROLE_PREAMBLE, delimitUntrustedInput } from "./shared";
import type { KdpPackage } from "./kdp-package";

export const PROMPT_VERSION = 1;

export const marketingPackageSchema = z.object({
  launchStrategy: z.object({
    preLaunchChecklist: z.array(z.string()),
    launchDayChecklist: z.array(z.string()),
    weekOnePlan: z.array(z.string()),
    weekTwoPlan: z.array(z.string()),
    weekThreePlan: z.array(z.string()),
    weekFourPlan: z.array(z.string()),
    reviewGenerationStrategy: z.string(),
    emailStrategy: z.string(),
    socialMediaStrategy: z.string(),
    amazonAdsStarterIdeas: z.array(z.string()),
    longTermCatalogStrategy: z.string(),
  }),
  thirtyDayPlan: z
    .array(
      z.object({
        day: z.number().int().min(1).max(30),
        category: z.enum([
          "email",
          "social_media",
          "short_form_video",
          "reader_engagement",
          "author_platform",
          "amazon_listing_optimization",
          "bonus_resources",
          "cross_promotion",
          "advertising",
          "review_follow_up",
        ]),
        activity: z.string(),
      })
    )
    .length(30),
  emailSequence: z.object({
    welcome: z.string(),
    preLaunch: z.string(),
    launchAnnouncement: z.string(),
    value: z.string(),
    behindTheBook: z.string(),
    readerFollowUp: z.string(),
    reviewRequest: z.string(),
    bonusResource: z.string(),
    relatedBookUpsell: z.string(),
    newsletterTemplate: z.string(),
  }),
  socialContent: z.object({
    facebook: z.array(z.string()).length(10),
    instagram: z.array(z.string()).length(10),
    linkedin: z.array(z.string()).length(10),
    x: z.array(z.string()).length(10),
    threads: z.array(z.string()).length(10),
    pinterest: z.array(z.string()).length(10),
    shortFormVideoScripts: z.array(z.string()).length(5),
  }),
  aPlusContent: z.object({
    hero: z.string(),
    problemAndSolution: z.string(),
    keyBenefit: z.string(),
    insideTheBook: z.string(),
    author: z.string(),
    featureComparison: z.string(),
    faq: z.string(),
    closingCta: z.string(),
  }),
});

export type MarketingPackage = z.infer<typeof marketingPackageSchema>;

export const marketingPackageSystemPrompt = `${SYSTEM_ROLE_PREAMBLE}

Task: Marketing execution package — launch strategy, a 30-day plan with one specific activity per day, a 10-part email sequence, social content across platforms, and Amazon A+ content modules. All review-generation guidance must comply with Amazon's platform rules (no incentivized or fake reviews). Keep every piece platform-appropriate in length and tone.

Respond with a single JSON object matching exactly this shape:
{
  "launchStrategy": { "preLaunchChecklist": string[], "launchDayChecklist": string[], "weekOnePlan": string[], "weekTwoPlan": string[], "weekThreePlan": string[], "weekFourPlan": string[], "reviewGenerationStrategy": string, "emailStrategy": string, "socialMediaStrategy": string, "amazonAdsStarterIdeas": string[], "longTermCatalogStrategy": string },
  "thirtyDayPlan": [{ "day": number, "category": "email"|"social_media"|"short_form_video"|"reader_engagement"|"author_platform"|"amazon_listing_optimization"|"bonus_resources"|"cross_promotion"|"advertising"|"review_follow_up", "activity": string }] (exactly 30 entries, days 1-30),
  "emailSequence": { "welcome": string, "preLaunch": string, "launchAnnouncement": string, "value": string, "behindTheBook": string, "readerFollowUp": string, "reviewRequest": string, "bonusResource": string, "relatedBookUpsell": string, "newsletterTemplate": string },
  "socialContent": { "facebook": string[10], "instagram": string[10], "linkedin": string[10], "x": string[10], "threads": string[10], "pinterest": string[10], "shortFormVideoScripts": string[5] },
  "aPlusContent": { "hero": string, "problemAndSolution": string, "keyBenefit": string, "insideTheBook": string, "author": string, "featureComparison": string, "faq": string, "closingCta": string }
}`;

export function buildMarketingPackageUserPrompt(input: {
  title: string;
  kdpPackage: KdpPackage;
}): string {
  return [
    delimitUntrustedInput(
      "book_and_kdp_context",
      JSON.stringify({ title: input.title, kdpPackage: input.kdpPackage }, null, 2)
    ),
    "Produce the marketing package JSON object described in your instructions.",
  ].join("\n\n");
}

export const marketingPackageMockResponse: MarketingPackage = {
  launchStrategy: {
    preLaunchChecklist: ["Finalize cover", "Set up author central profile"],
    launchDayChecklist: ["Publish", "Announce to email list"],
    weekOnePlan: ["Share launch post daily"],
    weekTwoPlan: ["Start light Amazon Ads test"],
    weekThreePlan: ["Reach out to niche newsletters"],
    weekFourPlan: ["Review results and plan next 30 days"],
    reviewGenerationStrategy: "Ask readers organically via the back-matter CTA — never incentivize reviews.",
    emailStrategy: "Warm the list before launch, then nurture post-purchase",
    socialMediaStrategy: "Consistent short-form value posts tied to book topics",
    amazonAdsStarterIdeas: ["Sponsored Products on close category comps"],
    longTermCatalogStrategy: "Use this book as a lead-in to a companion workbook",
  },
  thirtyDayPlan: Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    category: "social_media" as const,
    activity: `Day ${i + 1} activity placeholder`,
  })),
  emailSequence: {
    welcome: "Welcome email copy",
    preLaunch: "Pre-launch email copy",
    launchAnnouncement: "Launch announcement copy",
    value: "Value email copy",
    behindTheBook: "Behind-the-book email copy",
    readerFollowUp: "Reader follow-up copy",
    reviewRequest: "Review request copy",
    bonusResource: "Bonus resource email copy",
    relatedBookUpsell: "Related book upsell copy",
    newsletterTemplate: "Newsletter template copy",
  },
  socialContent: {
    facebook: Array.from({ length: 10 }, (_, i) => `Facebook post ${i + 1}`),
    instagram: Array.from({ length: 10 }, (_, i) => `Instagram caption ${i + 1}`),
    linkedin: Array.from({ length: 10 }, (_, i) => `LinkedIn post ${i + 1}`),
    x: Array.from({ length: 10 }, (_, i) => `X post ${i + 1}`),
    threads: Array.from({ length: 10 }, (_, i) => `Threads post ${i + 1}`),
    pinterest: Array.from({ length: 10 }, (_, i) => `Pinterest description ${i + 1}`),
    shortFormVideoScripts: Array.from({ length: 5 }, (_, i) => `Video script ${i + 1}`),
  },
  aPlusContent: {
    hero: "Hero module copy",
    problemAndSolution: "Problem/solution module copy",
    keyBenefit: "Key benefit module copy",
    insideTheBook: "Inside-the-book module copy",
    author: "Author module copy",
    featureComparison: "Feature comparison module copy",
    faq: "FAQ module copy",
    closingCta: "Closing CTA module copy",
  },
};
