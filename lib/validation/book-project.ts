import { z } from "zod";
import { BOOK_TYPES, READER_LEVELS, TONES, POINTS_OF_VIEW } from "@/lib/constants/book-options";

export const createBookProjectSchema = z.object({
  // Step 1 — Book Idea
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(300),
  subtitle: z.string().trim().max(300).optional().or(z.literal("")),
  niche: z.string().trim().max(300).optional().or(z.literal("")),
  bookType: z.enum(BOOK_TYPES).optional(),
  shortDescription: z.string().trim().max(2000).optional().or(z.literal("")),
  targetAudience: z.string().trim().max(500).optional().or(z.literal("")),
  readerLevel: z.enum(READER_LEVELS).optional(),
  primaryReaderProblem: z.string().trim().max(1000).optional().or(z.literal("")),
  desiredTransformation: z.string().trim().max(1000).optional().or(z.literal("")),

  // Step 2 — Book Settings
  language: z.string().trim().min(1).default("English"),
  tone: z.enum(TONES).default(TONES[0]),
  pointOfView: z.enum(POINTS_OF_VIEW).default(POINTS_OF_VIEW[0]),
  // Plain z.number() (not z.coerce) so the pre-parse form type stays `number`
  // instead of `unknown` — the form always supplies numbers via
  // `valueAsNumber`, and the API route sends real numbers too.
  targetWordCount: z.number().int().min(10000).max(150000).default(50000),
  chapterCount: z.number().int().min(3).max(40).default(12),
  wordsPerChapter: z.number().int().min(500).max(10000).default(4000),
  includeCaseStudies: z.boolean().default(true),
  includeExercises: z.boolean().default(true),
  includeWorksheets: z.boolean().default(false),
  includeReflection: z.boolean().default(true),
  includeChecklists: z.boolean().default(true),
  includeFAQs: z.boolean().default(true),
  includeGlossary: z.boolean().default(false),
  includeBonusResources: z.boolean().default(true),
  includeCitations: z.boolean().default(false),
  includeKdpPackage: z.boolean().default(true),

  // Step 3 — Author profile
  authorProfileId: z.string().min(1, "Select an author profile"),

  // Step 4 — Generation plan
  fullAutopilot: z.boolean().default(false),
  researchMode: z.boolean().default(false),
});

/** Parsed/output shape — all defaulted fields are guaranteed present. Used server-side after validation. */
export type CreateBookProjectInput = z.infer<typeof createBookProjectSchema>;

/** Pre-parse form shape — defaulted fields are still optional. Used as the react-hook-form generic. */
export type CreateBookProjectFormInput = z.input<typeof createBookProjectSchema>;
