import { z } from "zod";

export const authorProfileSchema = z.object({
  authorName: z.string().trim().min(1, "Author name is required").max(200),
  penName: z.string().trim().max(200).optional().or(z.literal("")),
  shortBio: z.string().trim().min(1, "Short bio is required").max(600),
  longBio: z.string().trim().min(1, "Long bio is required").max(4000),
  website: z.url().optional().or(z.literal("")),
  email: z.email().optional().or(z.literal("")),
  authorTagline: z.string().trim().max(300).optional().or(z.literal("")),
  publisherName: z.string().trim().max(200).optional().or(z.literal("")),
  copyrightHolder: z.string().trim().max(200).optional().or(z.literal("")),
  defaultCTA: z.string().trim().max(1000).optional().or(z.literal("")),
  bonusResourceUrl: z.url().optional().or(z.literal("")),
});

export type AuthorProfileInput = z.infer<typeof authorProfileSchema>;
