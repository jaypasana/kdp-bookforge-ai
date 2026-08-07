import { inngest } from "@/lib/inngest/client";
import { prisma } from "@/lib/db/prisma";
import { generateStructured } from "@/lib/openai/generate-structured";
import {
  chapterBriefSchema,
  chapterBriefSystemPrompt,
  buildChapterBriefUserPrompt,
  chapterBriefMockResponse,
} from "@/lib/prompts/chapter-brief";
import {
  chapterSectionSchema,
  chapterWriterSystemPrompt,
  buildChapterWriterUserPrompt,
  chapterWriterMockResponse,
  CHAPTER_WRITING_STAGES,
} from "@/lib/prompts/chapter-writer";
import {
  chapterReviewSchema,
  chapterReviewerSystemPrompt,
  buildChapterReviewerUserPrompt,
  chapterReviewMockResponse,
} from "@/lib/prompts/chapter-reviewer";
import {
  continuityReviewerSystemPrompt,
  buildContinuityReviewerUserPrompt,
  continuityReviewerMockResponse,
  bookBibleSchema,
} from "@/lib/prompts/continuity-reviewer";
import { updateBookBible } from "@/lib/services/book-bible-service";
import {
  saveChapterBrief,
  saveChapterSections,
  recordChapterReview,
  markChapterStatus,
  assembleChapterContent,
} from "@/lib/services/chapter-service";
import { startJob, completeJob, failJob } from "@/lib/services/generation-job-service";
import { recalculateTotalWords, recalculateActualCost } from "@/lib/services/book-project-service";
import type { ChapterPlan } from "@/lib/prompts/outline-generator";

/**
 * Standalone chapter regeneration, triggered from the UI's "Retry chapter"
 * / "Regenerate chapter" action (spec sections 22 & 24). Independent of the
 * main generate-book-project run so a single chapter can be redone after
 * the manuscript is otherwise complete, without re-running the whole book.
 */
export const regenerateChapter = inngest.createFunction(
  { id: "regenerate-chapter", retries: 2 },
  { event: "book/chapter.retry" },
  async ({ event, step }) => {
    const { bookProjectId, chapterNumber } = event.data;

    const { project, chapter, outline, discovery } = await step.run("load-context", async () => {
      const project = await prisma.bookProject.findUniqueOrThrow({
        where: { id: bookProjectId },
        include: { authorProfile: true },
      });
      const chapter = await prisma.chapter.findUniqueOrThrow({
        where: { bookProjectId_chapterNumber: { bookProjectId, chapterNumber } },
      });
      const outline = await prisma.outline.findFirstOrThrow({
        where: { bookProjectId },
        orderBy: { version: "desc" },
      });
      const discovery = await prisma.bookDiscovery.findFirstOrThrow({
        where: { bookProjectId },
        orderBy: { createdAt: "desc" },
      });
      return { project, chapter, outline, discovery };
    });

    const userId = project.userId;
    const outlineData = outline.structuredData as unknown as { chapters: ChapterPlan[] };
    const chapterPlan = outlineData.chapters.find((c) => c.chapterNumber === chapterNumber);
    if (!chapterPlan) throw new Error(`Chapter ${chapterNumber} not found in outline`);

    const discoveryData = discovery.structuredData as unknown as { bookPromise: string; recommendedTone: string };
    const tone = project.tone ?? discoveryData.recommendedTone;

    await step.run("mark-drafting", () => markChapterStatus(chapter.id, "REVISING"));

    const brief = await step.run("brief", async () => {
      const job = await startJob(bookProjectId, `chapter:${chapterNumber}:retry-brief`);
      try {
        const currentBible = await prisma.bookBible.findUniqueOrThrow({ where: { bookProjectId } });
        const result = await generateStructured({
          taskType: "chapter-brief",
          modelTask: "primary",
          systemPrompt: chapterBriefSystemPrompt,
          userPrompt: buildChapterBriefUserPrompt({
            chapterPlan,
            bookBible: currentBible.structuredData,
            tone,
          }),
          schema: chapterBriefSchema,
          mockResponse: chapterBriefMockResponse,
          userId,
          bookProjectId,
        });
        await saveChapterBrief(chapter.id, result);
        await completeJob(job.id);
        return result;
      } catch (error) {
        await failJob(job.id, error instanceof Error ? error.message : String(error));
        throw error;
      }
    });

    const sections = await step.run("draft", async () => {
      const job = await startJob(bookProjectId, `chapter:${chapterNumber}:retry-draft`);
      try {
        const drafted: Array<{ heading?: string; content: string }> = [];
        for (const stage of CHAPTER_WRITING_STAGES) {
          const previousSectionsSummary = drafted.map((s) => s.heading ?? s.content.slice(0, 80)).join("\n");
          const section = await generateStructured({
            taskType: `chapter-writer:${stage}`,
            modelTask: "primary",
            systemPrompt: chapterWriterSystemPrompt,
            userPrompt: buildChapterWriterUserPrompt({
              stage,
              chapterPlan,
              brief,
              tone,
              previousSectionsSummary: previousSectionsSummary || undefined,
            }),
            schema: chapterSectionSchema,
            mockResponse: chapterWriterMockResponse,
            userId,
            bookProjectId,
          });
          drafted.push(section);
        }
        await saveChapterSections(chapter.id, drafted);
        await completeJob(job.id);
        return drafted;
      } catch (error) {
        await failJob(job.id, error instanceof Error ? error.message : String(error));
        throw error;
      }
    });

    await step.run("review", async () => {
      const job = await startJob(bookProjectId, `chapter:${chapterNumber}:retry-review`);
      try {
        const content = assembleChapterContent(sections.map((s) => ({ heading: s.heading ?? null, content: s.content })));
        const review = await generateStructured({
          taskType: "chapter-reviewer",
          modelTask: "review",
          systemPrompt: chapterReviewerSystemPrompt,
          userPrompt: buildChapterReviewerUserPrompt({
            chapterTitle: chapterPlan.chapterTitle,
            chapterContent: content,
            tone,
          }),
          schema: chapterReviewSchema,
          mockResponse: chapterReviewMockResponse,
          userId,
          bookProjectId,
        });
        await recordChapterReview(bookProjectId, chapter.id, review.overallScore, review.weaknesses, review.revisionInstructions);
        await markChapterStatus(chapter.id, "APPROVED");
        await completeJob(job.id);
      } catch (error) {
        await failJob(job.id, error instanceof Error ? error.message : String(error));
        throw error;
      }
    });

    await step.run("continuity", async () => {
      const job = await startJob(bookProjectId, `chapter:${chapterNumber}:retry-continuity`);
      try {
        const chapterWithSections = await prisma.chapter.findUniqueOrThrow({
          where: { id: chapter.id },
          include: { sections: { orderBy: { sectionOrder: "asc" } } },
        });
        const content = assembleChapterContent(chapterWithSections.sections);
        const currentBible = await prisma.bookBible.findUniqueOrThrow({ where: { bookProjectId } });

        const updated = await generateStructured({
          taskType: "continuity-reviewer",
          modelTask: "fast",
          systemPrompt: continuityReviewerSystemPrompt,
          userPrompt: buildContinuityReviewerUserPrompt({
            currentBookBible: currentBible.structuredData as never,
            chapterNumber,
            chapterTitle: chapterPlan.chapterTitle,
            chapterContent: content,
          }),
          schema: bookBibleSchema,
          mockResponse: continuityReviewerMockResponse,
          userId,
          bookProjectId,
        });
        await updateBookBible(bookProjectId, updated);
        await completeJob(job.id);
      } catch (error) {
        await failJob(job.id, error instanceof Error ? error.message : String(error));
        throw error;
      }
    });

    await step.run("recalculate-words", async () => {
      await recalculateTotalWords(bookProjectId);
      await recalculateActualCost(bookProjectId);
    });

    return { status: "chapter_regenerated", chapterNumber };
  }
);
