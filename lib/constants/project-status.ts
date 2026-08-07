import type { BookProjectStatus } from "@prisma/client";

/** Statuses during which the background generation pipeline is actively running. */
export const IN_PROGRESS_STATUSES = new Set<BookProjectStatus>([
  "PLANNING",
  "OUTLINE_GENERATION",
  "AWAITING_OUTLINE_APPROVAL",
  "GENERATING_CHAPTERS",
  "QUALITY_REVIEW",
  "GENERATING_KDP_PACKAGE",
  "COMPILING_DOCX",
]);
