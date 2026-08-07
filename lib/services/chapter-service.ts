import { prisma } from "@/lib/db/prisma";
import type { ChapterPlan } from "@/lib/prompts/outline-generator";
import type { ChapterBrief } from "@/lib/prompts/chapter-brief";

export async function upsertChapterFromPlan(bookProjectId: string, plan: ChapterPlan) {
  return prisma.chapter.upsert({
    where: { bookProjectId_chapterNumber: { bookProjectId, chapterNumber: plan.chapterNumber } },
    update: {
      title: plan.chapterTitle,
      summary: plan.chapterSummary,
      targetWordCount: plan.targetWordCount,
      status: "PENDING",
    },
    create: {
      bookProjectId,
      chapterNumber: plan.chapterNumber,
      title: plan.chapterTitle,
      summary: plan.chapterSummary,
      targetWordCount: plan.targetWordCount,
      status: "PENDING",
    },
  });
}

export async function saveChapterBrief(chapterId: string, brief: ChapterBrief) {
  await prisma.chapter.update({
    where: { id: chapterId },
    data: { brief: brief as never, status: "BRIEF_READY" },
  });
}

export async function saveChapterSections(
  chapterId: string,
  sections: Array<{ heading?: string; content: string }>
) {
  await prisma.$transaction([
    prisma.chapterSection.deleteMany({ where: { chapterId, locked: false } }),
    ...sections.map((s, i) =>
      prisma.chapterSection.create({
        data: {
          chapterId,
          sectionOrder: i,
          heading: s.heading,
          content: s.content,
          sourceType: "AI_GENERATED",
        },
      })
    ),
  ]);

  const wordCount = sections.reduce((sum, s) => sum + s.content.trim().split(/\s+/).length, 0);
  await prisma.chapter.update({
    where: { id: chapterId },
    data: { actualWordCount: wordCount, status: "DRAFT_COMPLETE" },
  });
}

export async function recordChapterReview(
  bookProjectId: string,
  chapterId: string,
  score: number,
  issues: unknown,
  recommendations: unknown
) {
  await prisma.$transaction([
    prisma.qualityReview.create({
      data: {
        bookProjectId,
        chapterId,
        reviewType: "CHAPTER",
        score,
        issues: issues as never,
        recommendations: recommendations as never,
        resolved: score >= 85,
      },
    }),
    prisma.chapter.update({ where: { id: chapterId }, data: { score } }),
  ]);
}

export async function markChapterStatus(
  chapterId: string,
  status: "REVIEWING" | "REVISING" | "APPROVED" | "FAILED",
  errorMessage?: string
) {
  await prisma.chapter.update({
    where: { id: chapterId },
    data: { status, errorMessage: errorMessage ?? null },
  });
}

export async function incrementRevisionAttempt(chapterId: string) {
  await prisma.chapter.update({
    where: { id: chapterId },
    data: { revisionAttempts: { increment: 1 } },
  });
}

export async function getChapterWithSections(chapterId: string) {
  return prisma.chapter.findUniqueOrThrow({
    where: { id: chapterId },
    include: { sections: { orderBy: { sectionOrder: "asc" } } },
  });
}

export function assembleChapterContent(sections: Array<{ heading: string | null; content: string }>) {
  return sections
    .map((s) => (s.heading ? `${s.heading}\n\n${s.content}` : s.content))
    .join("\n\n");
}
