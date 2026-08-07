import { prisma } from "@/lib/db/prisma";
import { slugify, uniqueSlug } from "@/lib/slug";
import { estimateGenerationCost } from "@/lib/cost-estimator";
import type { CreateBookProjectInput } from "@/lib/validation/book-project";

async function generateUniqueSlug(title: string) {
  const base = slugify(title);
  const existing = await prisma.bookProject.findUnique({ where: { slug: base } });
  return existing ? uniqueSlug(title) : base;
}

export async function createBookProject(userId: string, input: CreateBookProjectInput) {
  const authorProfile = await prisma.authorProfile.findFirst({
    where: { id: input.authorProfileId, userId },
  });
  if (!authorProfile) {
    throw new Error("Author profile not found");
  }

  const slug = await generateUniqueSlug(input.title);
  const { estimatedCostUsd } = estimateGenerationCost(input.targetWordCount);

  return prisma.bookProject.create({
    data: {
      userId,
      authorProfileId: input.authorProfileId,
      title: input.title,
      subtitle: input.subtitle || undefined,
      slug,
      niche: input.niche || undefined,
      targetAudience: input.targetAudience || undefined,
      bookType: input.bookType,
      language: input.language,
      tone: input.tone,
      pointOfView: input.pointOfView,
      targetWordCount: input.targetWordCount,
      chapterCount: input.chapterCount,
      wordsPerChapter: input.wordsPerChapter,
      readingLevel: input.readerLevel,
      includeCaseStudies: input.includeCaseStudies,
      includeExercises: input.includeExercises,
      includeWorksheets: input.includeWorksheets,
      includeReflection: input.includeReflection,
      includeChecklists: input.includeChecklists,
      includeFAQs: input.includeFAQs,
      includeGlossary: input.includeGlossary,
      includeBonusResources: input.includeBonusResources,
      includeCitations: input.includeCitations,
      includeKdpPackage: input.includeKdpPackage,
      fullAutopilot: input.fullAutopilot,
      researchMode: input.researchMode,
      estimatedCost: estimatedCostUsd,
      status: "SETUP",
    },
  });
}

export function listBookProjects(userId: string) {
  return prisma.bookProject.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

export function getBookProject(userId: string, id: string) {
  return prisma.bookProject.findFirst({
    where: { id, userId },
    include: {
      authorProfile: true,
      chapters: { orderBy: { chapterNumber: "asc" } },
      outlines: { orderBy: { version: "desc" }, take: 1 },
      kdpPackage: true,
      jobs: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
}

export async function getDashboardStats(userId: string) {
  const [total, draft, generating, completed, failed, wordsAgg, costAgg, recent] =
    await Promise.all([
      prisma.bookProject.count({ where: { userId } }),
      prisma.bookProject.count({ where: { userId, status: "SETUP" } }),
      prisma.bookProject.count({
        where: {
          userId,
          status: {
            in: [
              "PLANNING",
              "OUTLINE_GENERATION",
              "GENERATING_CHAPTERS",
              "QUALITY_REVIEW",
              "GENERATING_KDP_PACKAGE",
              "COMPILING_DOCX",
            ],
          },
        },
      }),
      prisma.bookProject.count({
        where: { userId, status: { in: ["READY_FOR_REVIEW", "APPROVED"] } },
      }),
      prisma.bookProject.count({ where: { userId, status: "FAILED" } }),
      prisma.bookProject.aggregate({ where: { userId }, _sum: { totalWords: true } }),
      prisma.apiUsage.aggregate({ where: { userId }, _sum: { estimatedCost: true } }),
      prisma.bookProject.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 6,
      }),
    ]);

  return {
    total,
    draft,
    generating,
    completed,
    failed,
    totalWords: wordsAgg._sum.totalWords ?? 0,
    estimatedTotalCost: costAgg._sum.estimatedCost ?? 0,
    recent,
  };
}

export async function recalculateTotalWords(bookProjectId: string) {
  const agg = await prisma.chapter.aggregate({
    where: { bookProjectId },
    _sum: { actualWordCount: true },
  });
  await prisma.bookProject.update({
    where: { id: bookProjectId },
    data: { totalWords: agg._sum.actualWordCount ?? 0 },
  });
}

export async function recalculateActualCost(bookProjectId: string) {
  const agg = await prisma.apiUsage.aggregate({
    where: { bookProjectId },
    _sum: { estimatedCost: true },
  });
  await prisma.bookProject.update({
    where: { id: bookProjectId },
    data: { actualCost: agg._sum.estimatedCost ?? 0 },
  });
}
