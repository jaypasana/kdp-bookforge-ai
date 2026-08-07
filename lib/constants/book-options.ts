export const BOOK_TYPES = [
  "How-to guide",
  "Business guide",
  "Professional handbook",
  "Self-help book",
  "Educational guide",
  "Workbook-supported guide",
  "Beginner-to-advanced manual",
  "Custom nonfiction",
] as const;

export const READER_LEVELS = [
  "Beginner",
  "Beginner to intermediate",
  "Intermediate",
  "Intermediate to advanced",
  "Advanced",
] as const;

export const TONES = [
  "Professional but conversational",
  "Formal and authoritative",
  "Friendly and encouraging",
  "Direct and no-nonsense",
  "Storytelling and narrative-driven",
] as const;

export const POINTS_OF_VIEW = ["Second person (you)", "First person (I/we)", "Third person"] as const;

export const DEFAULT_BOOK_SETTINGS = {
  language: "English",
  tone: TONES[0],
  pointOfView: POINTS_OF_VIEW[0],
  targetWordCount: 50000,
  chapterCount: 12,
  wordsPerChapter: 4000,
  readingLevel: READER_LEVELS[1],
  includeCaseStudies: true,
  includeExercises: true,
  includeWorksheets: false,
  includeReflection: true,
  includeChecklists: true,
  includeFAQs: true,
  includeGlossary: false,
  includeBonusResources: true,
  includeCitations: false,
  includeKdpPackage: true,
  fullAutopilot: false,
} as const;
