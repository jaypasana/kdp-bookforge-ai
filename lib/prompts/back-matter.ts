import { z } from "zod";
import { SYSTEM_ROLE_PREAMBLE, delimitUntrustedInput } from "./shared";

export const PROMPT_VERSION = 1;

export const backMatterSchema = z.object({
  conclusion: z.string(),
  finalActionPlan: z.array(z.string()),
  reviewRequest: z.string(),
  callToAction: z.string(),
  bonusResourcesText: z.string().optional(),
  readerCommunityInvitation: z.string().optional(),
  newsletterInvitation: z.string().optional(),
});

export type BackMatter = z.infer<typeof backMatterSchema>;

export const backMatterSystemPrompt = `${SYSTEM_ROLE_PREAMBLE}

Task: Back matter. Write a conclusion that ties the book's promise together, a concrete final action plan (ordered list), a brief and non-pushy review request, and a call-to-action page. Only include bonus-resources / community / newsletter sections if the author profile indicates they have a bonus resource URL, community, or newsletter to invite readers to — otherwise omit those fields. Never invent a URL; the caller will insert the real one from the author profile as a placeholder token like [BONUS_RESOURCE_URL] inside your text where appropriate.

Respond with a single JSON object matching exactly this shape:
{
  "conclusion": string,
  "finalActionPlan": string[],
  "reviewRequest": string,
  "callToAction": string,
  "bonusResourcesText": string (omit if not applicable),
  "readerCommunityInvitation": string (omit if not applicable),
  "newsletterInvitation": string (omit if not applicable)
}`;

export function buildBackMatterUserPrompt(input: {
  title: string;
  bookPromise: string;
  hasBonusResource: boolean;
  defaultCTA?: string;
}): string {
  return [
    delimitUntrustedInput(
      "book_context",
      JSON.stringify(
        {
          title: input.title,
          bookPromise: input.bookPromise,
          hasBonusResource: input.hasBonusResource,
          defaultCTA: input.defaultCTA,
        },
        null,
        2
      )
    ),
    "Produce the back matter JSON object described in your instructions.",
  ].join("\n\n");
}

export const backMatterMockResponse: BackMatter = {
  conclusion:
    "You now have a repeatable system for putting AI to work in your real estate business — one workflow at a time.",
  finalActionPlan: [
    "Pick the one workflow from Chapter 1 you're automating first",
    "Implement it this week using the checklist from that chapter",
    "Revisit Chapter 12 in 30 days to add your second workflow",
  ],
  reviewRequest:
    "If this book helped you, a short honest review helps other agents find it too.",
  callToAction: "Ready to go further? [BONUS_RESOURCE_URL]",
  bonusResourcesText: "Get the prompt template pack and 30-day checklist at [BONUS_RESOURCE_URL].",
};
