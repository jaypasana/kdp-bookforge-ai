import { inngest } from "@/lib/inngest/client";
import { prisma } from "@/lib/db/prisma";
import { generateStructured } from "@/lib/openai/generate-structured";
import {
  bookDiscoverySchema,
  bookDiscoverySystemPrompt,
  buildBookDiscoveryUserPrompt,
  bookDiscoveryMockResponse,
  PROMPT_VERSION as DISCOVERY_PROMPT_VERSION,
} from "@/lib/prompts/book-discovery";
import {
  outlineSchema,
  outlineGeneratorSystemPrompt,
  buildOutlineGeneratorUserPrompt,
  outlineMockResponse,
} from "@/lib/prompts/outline-generator";
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
  MINIMUM_PASSING_SCORE,
  MAX_AUTOMATIC_REVISIONS,
} from "@/lib/prompts/chapter-reviewer";
import {
  continuityReviewerSystemPrompt,
  buildContinuityReviewerUserPrompt,
  continuityReviewerMockResponse,
  bookBibleSchema,
} from "@/lib/prompts/continuity-reviewer";
import {
  frontMatterSchema,
  frontMatterSystemPrompt,
  buildFrontMatterUserPrompt,
  frontMatterMockResponse,
} from "@/lib/prompts/front-matter";
import {
  backMatterSchema,
  backMatterSystemPrompt,
  buildBackMatterUserPrompt,
  backMatterMockResponse,
} from "@/lib/prompts/back-matter";
import {
  kdpPackageSchema,
  kdpPackageSystemPrompt,
  buildKdpPackageUserPrompt,
  kdpPackageMockResponse,
} from "@/lib/prompts/kdp-package";
import {
  marketingPackageSchema,
  marketingPackageSystemPrompt,
  buildMarketingPackageUserPrompt,
  marketingPackageMockResponse,
} from "@/lib/prompts/marketing-package";
import {
  finalQualityReviewSchema,
  finalQualityReviewSystemPrompt,
  buildFinalQualityReviewUserPrompt,
  finalQualityReviewMockResponse,
} from "@/lib/prompts/final-quality-review";
import { getOrCreateBookBible, updateBookBible } from "@/lib/services/book-bible-service";
import {
  upsertChapterFromPlan,
  saveChapterBrief,
  saveChapterSections,
  recordChapterReview,
  markChapterStatus,
  incrementRevisionAttempt,
  assembleChapterContent,
} from "@/lib/services/chapter-service";
import { startJob, completeJob, failJob, setProjectStatus } from "@/lib/services/generation-job-service";
import { recalculateTotalWords } from "@/lib/services/book-project-service";

const OUTLINE_APPROVAL_TIMEOUT = "7d";

export const generateBookProject = inngest.createFunction(
  {
    id: "generate-book-project",
    retries: 2,
    cancelOn: [
      {
        event: "book/generation.cancelled",
        if: "event.data.bookProjectId == async.data.bookProjectId",
      },
    ],
    onFailure: async ({ event }) => {
      const bookProjectId = event.data.event.data.bookProjectId as string;
      await setProjectStatus(bookProjectId, "FAILED", {
        errorMessage:
          "Generation failed after multiple retries. Check the Generation Queue for details, then retry from the project page.",
      });
    },
  },
  { event: "book/generate.requested" },
  async ({ event, step }) => {
    const { bookProjectId } = event.data;

    const project = await step.run("load-project", async () => {
      return prisma.bookProject.findUniqueOrThrow({
        where: { id: bookProjectId },
        include: { authorProfile: true },
      });
    });

    const userId = project.userId;

    // -----------------------------------------------------------------
    // Stage 1: Discovery
    // -----------------------------------------------------------------
    await step.run("set-status-planning", () => setProjectStatus(bookProjectId, "PLANNING", { progress: 5 }));

    const discovery = await step.run("discovery", async () => {
      const job = await startJob(bookProjectId, "discovery");
      try {
        const result = await generateStructured({
          taskType: "book-discovery",
          modelTask: "primary",
          systemPrompt: bookDiscoverySystemPrompt,
          userPrompt: buildBookDiscoveryUserPrompt({
            title: project.title,
            notes: project.subtitle ?? undefined,
            overrides: {
              niche: project.niche ?? undefined,
              bookType: project.bookType ?? undefined,
              targetAudience: project.targetAudience ?? undefined,
              readerLevel: project.readingLevel ?? undefined,
            },
          }),
          schema: bookDiscoverySchema,
          mockResponse: bookDiscoveryMockResponse,
          userId,
          bookProjectId,
        });

        await prisma.bookDiscovery.create({
          data: {
            bookProjectId,
            structuredData: result as never,
            promptVersion: String(DISCOVERY_PROMPT_VERSION),
            model: "primary",
          },
        });

        await prisma.bookProject.update({
          where: { id: bookProjectId },
          data: {
            niche: project.niche ?? result.niche,
            bookType: project.bookType ?? result.bookType,
            targetAudience: project.targetAudience ?? result.targetAudience.join(", "),
            readingLevel: project.readingLevel ?? result.readerLevel,
          },
        });

        await completeJob(job.id);
        return result;
      } catch (error) {
        await failJob(job.id, error instanceof Error ? error.message : String(error));
        throw error;
      }
    });

    // -----------------------------------------------------------------
    // Stage 2: Outline
    // -----------------------------------------------------------------
    await step.run("set-status-outline", () =>
      setProjectStatus(bookProjectId, "OUTLINE_GENERATION", { progress: 15 })
    );

    const outline = await step.run("outline", async () => {
      const job = await startJob(bookProjectId, "outline");
      try {
        const result = await generateStructured({
          taskType: "outline-generator",
          modelTask: "primary",
          systemPrompt: outlineGeneratorSystemPrompt,
          userPrompt: buildOutlineGeneratorUserPrompt({
            discovery,
            chapterCount: project.chapterCount,
            wordsPerChapter: project.wordsPerChapter,
          }),
          schema: outlineSchema,
          mockResponse: outlineMockResponse,
          userId,
          bookProjectId,
        });

        await prisma.outline.create({
          data: {
            bookProjectId,
            structuredData: result as never,
            status: project.fullAutopilot ? "APPROVED" : "AWAITING_APPROVAL",
            approvedAt: project.fullAutopilot ? new Date() : null,
          },
        });

        await completeJob(job.id);
        return result;
      } catch (error) {
        await failJob(job.id, error instanceof Error ? error.message : String(error));
        throw error;
      }
    });

    // -----------------------------------------------------------------
    // Stage 3: Outline approval gate
    // -----------------------------------------------------------------
    if (!project.fullAutopilot) {
      await step.run("set-status-awaiting-approval", () =>
        setProjectStatus(bookProjectId, "AWAITING_OUTLINE_APPROVAL", { progress: 20 })
      );

      const approval = await step.waitForEvent("wait-for-outline-approval", {
        event: "book/outline.approved",
        timeout: OUTLINE_APPROVAL_TIMEOUT,
        if: `event.data.bookProjectId == "${bookProjectId}"`,
      });

      if (!approval) {
        await step.run("mark-approval-timeout", () =>
          setProjectStatus(bookProjectId, "FAILED", {
            errorMessage: "Outline approval was not received within 7 days. Approve the outline to continue.",
          })
        );
        return { status: "awaiting_outline_approval_timed_out" };
      }

      await step.run("mark-outline-approved", async () => {
        const latestOutline = await prisma.outline.findFirst({
          where: { bookProjectId },
          orderBy: { version: "desc" },
        });
        if (latestOutline) {
          await prisma.outline.update({
            where: { id: latestOutline.id },
            data: { status: "APPROVED", approvedAt: new Date() },
          });
        }
      });
    }

    // -----------------------------------------------------------------
    // Stage 4: Chapters
    // -----------------------------------------------------------------
    await step.run("set-status-generating-chapters", () =>
      setProjectStatus(bookProjectId, "GENERATING_CHAPTERS", { progress: 25 })
    );

    const bookAudience = discovery.targetAudience.join(", ");
    await step.run("init-book-bible", () =>
      getOrCreateBookBible(bookProjectId, {
        bookPromise: discovery.bookPromise,
        targetAudience: bookAudience,
        tone: project.tone ?? discovery.recommendedTone,
      })
    );

    const totalChapters = outline.chapters.length;

    for (const chapterPlan of outline.chapters) {
      const chapterNumber = chapterPlan.chapterNumber;

      const chapter = await step.run(`chapter-${chapterNumber}-upsert`, () =>
        upsertChapterFromPlan(bookProjectId, chapterPlan)
      );

      // --- Brief ---
      const brief = await step.run(`chapter-${chapterNumber}-brief`, async () => {
        const job = await startJob(bookProjectId, `chapter:${chapterNumber}:brief`);
        try {
          const currentBible = await prisma.bookBible.findUniqueOrThrow({ where: { bookProjectId } });
          const result = await generateStructured({
            taskType: "chapter-brief",
            modelTask: "primary",
            systemPrompt: chapterBriefSystemPrompt,
            userPrompt: buildChapterBriefUserPrompt({
              chapterPlan,
              bookBible: currentBible.structuredData,
              tone: project.tone ?? discovery.recommendedTone,
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

      // --- Drafting (multi-stage) ---
      const draftSections = await step.run(`chapter-${chapterNumber}-draft`, async () => {
        const job = await startJob(bookProjectId, `chapter:${chapterNumber}:draft`);
        try {
          await markChapterStatus(chapter.id, "REVISING"); // reuse enum value for "in progress"
          const sections: Array<{ heading?: string; content: string }> = [];

          for (const stage of CHAPTER_WRITING_STAGES) {
            const previousSectionsSummary = sections
              .map((s) => s.heading ?? s.content.slice(0, 80))
              .join("\n");

            const section = await generateStructured({
              taskType: `chapter-writer:${stage}`,
              modelTask: "primary",
              systemPrompt: chapterWriterSystemPrompt,
              userPrompt: buildChapterWriterUserPrompt({
                stage,
                chapterPlan,
                brief,
                tone: project.tone ?? discovery.recommendedTone,
                previousSectionsSummary: previousSectionsSummary || undefined,
              }),
              schema: chapterSectionSchema,
              mockResponse: chapterWriterMockResponse,
              userId,
              bookProjectId,
            });
            sections.push(section);
          }

          await saveChapterSections(chapter.id, sections);
          await completeJob(job.id);
          return sections;
        } catch (error) {
          await failJob(job.id, error instanceof Error ? error.message : String(error));
          throw error;
        }
      });

      // --- Review + revision loop ---
      await step.run(`chapter-${chapterNumber}-review-loop`, async () => {
        let sections = draftSections;
        let attempt = 0;

        for (;;) {
          const job = await startJob(bookProjectId, `chapter:${chapterNumber}:review`);
          await markChapterStatus(chapter.id, "REVIEWING");
          const content = assembleChapterContent(
            sections.map((s) => ({ heading: s.heading ?? null, content: s.content }))
          );

          const review = await generateStructured({
            taskType: "chapter-reviewer",
            modelTask: "review",
            systemPrompt: chapterReviewerSystemPrompt,
            userPrompt: buildChapterReviewerUserPrompt({
              chapterTitle: chapterPlan.chapterTitle,
              chapterContent: content,
              tone: project.tone ?? discovery.recommendedTone,
            }),
            schema: chapterReviewSchema,
            mockResponse: chapterReviewMockResponse,
            userId,
            bookProjectId,
          });

          await recordChapterReview(bookProjectId, chapter.id, review.overallScore, review.weaknesses, review.revisionInstructions);
          await completeJob(job.id);

          const passed = review.overallScore >= MINIMUM_PASSING_SCORE;
          if (passed || attempt >= MAX_AUTOMATIC_REVISIONS) {
            await markChapterStatus(chapter.id, "APPROVED");
            break;
          }

          attempt += 1;
          await incrementRevisionAttempt(chapter.id);

          const revisionJob = await startJob(bookProjectId, `chapter:${chapterNumber}:revise:${attempt}`);
          try {
            const revisedSections: Array<{ heading?: string; content: string }> = [];
            for (const stage of CHAPTER_WRITING_STAGES) {
              const previousSectionsSummary = [
                revisedSections.map((s) => s.heading ?? s.content.slice(0, 80)).join("\n"),
                `Revision instructions from reviewer: ${review.revisionInstructions.join("; ")}`,
              ]
                .filter(Boolean)
                .join("\n\n");

              const section = await generateStructured({
                taskType: `chapter-writer:${stage}:revision`,
                modelTask: "primary",
                systemPrompt: chapterWriterSystemPrompt,
                userPrompt: buildChapterWriterUserPrompt({
                  stage,
                  chapterPlan,
                  brief,
                  tone: project.tone ?? discovery.recommendedTone,
                  previousSectionsSummary,
                }),
                schema: chapterSectionSchema,
                mockResponse: chapterWriterMockResponse,
                userId,
                bookProjectId,
              });
              revisedSections.push(section);
            }
            sections = revisedSections;
            await saveChapterSections(chapter.id, sections);
            await completeJob(revisionJob.id);
          } catch (error) {
            await failJob(revisionJob.id, error instanceof Error ? error.message : String(error));
            throw error;
          }
        }
      });

      // --- Continuity update ---
      await step.run(`chapter-${chapterNumber}-continuity`, async () => {
        const job = await startJob(bookProjectId, `chapter:${chapterNumber}:continuity`);
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

      await step.run(`chapter-${chapterNumber}-progress`, async () => {
        await recalculateTotalWords(bookProjectId);
        const progress = 25 + Math.round((chapterNumber / totalChapters) * 45);
        await setProjectStatus(bookProjectId, "GENERATING_CHAPTERS", { progress });
      });
    }

    // -----------------------------------------------------------------
    // Stage 5: Front & back matter
    // -----------------------------------------------------------------
    await step.run("front-matter", async () => {
      const job = await startJob(bookProjectId, "front-matter");
      try {
        const result = await generateStructured({
          taskType: "front-matter",
          modelTask: "primary",
          systemPrompt: frontMatterSystemPrompt,
          userPrompt: buildFrontMatterUserPrompt({
            title: project.title,
            subtitle: project.subtitle ?? undefined,
            bookPromise: discovery.bookPromise,
            disclaimerRequired: discovery.disclaimerRequired,
            disclaimerReason: discovery.disclaimerReason,
          }),
          schema: frontMatterSchema,
          mockResponse: frontMatterMockResponse,
          userId,
          bookProjectId,
        });
        await prisma.bookProject.update({ where: { id: bookProjectId }, data: { frontMatter: result as never } });
        await completeJob(job.id);
      } catch (error) {
        await failJob(job.id, error instanceof Error ? error.message : String(error));
        throw error;
      }
    });

    await step.run("back-matter", async () => {
      const job = await startJob(bookProjectId, "back-matter");
      try {
        const result = await generateStructured({
          taskType: "back-matter",
          modelTask: "primary",
          systemPrompt: backMatterSystemPrompt,
          userPrompt: buildBackMatterUserPrompt({
            title: project.title,
            bookPromise: discovery.bookPromise,
            hasBonusResource: Boolean(project.authorProfile?.bonusResourceUrl),
            defaultCTA: project.authorProfile?.defaultCTA ?? undefined,
          }),
          schema: backMatterSchema,
          mockResponse: backMatterMockResponse,
          userId,
          bookProjectId,
        });

        const bonusUrl = project.authorProfile?.bonusResourceUrl;
        const substituted = JSON.parse(
          JSON.stringify(result).replaceAll(
            "[BONUS_RESOURCE_URL]",
            bonusUrl || "[INSERT BONUS RESOURCE URL]"
          )
        );

        await prisma.bookProject.update({ where: { id: bookProjectId }, data: { backMatter: substituted } });
        await completeJob(job.id);
      } catch (error) {
        await failJob(job.id, error instanceof Error ? error.message : String(error));
        throw error;
      }
    });

    // -----------------------------------------------------------------
    // Stage 6: KDP package + marketing package
    // -----------------------------------------------------------------
    if (project.includeKdpPackage) {
      await step.run("set-status-kdp-package", () =>
        setProjectStatus(bookProjectId, "GENERATING_KDP_PACKAGE", { progress: 80 })
      );

      const kdpPackage = await step.run("kdp-package", async () => {
        const job = await startJob(bookProjectId, "kdp-package");
        try {
          const result = await generateStructured({
            taskType: "kdp-package",
            modelTask: "primary",
            systemPrompt: kdpPackageSystemPrompt,
            userPrompt: buildKdpPackageUserPrompt({
              title: project.title,
              subtitle: project.subtitle ?? undefined,
              discovery,
            }),
            schema: kdpPackageSchema,
            mockResponse: kdpPackageMockResponse,
            userId,
            bookProjectId,
          });
          await completeJob(job.id);
          return result;
        } catch (error) {
          await failJob(job.id, error instanceof Error ? error.message : String(error));
          throw error;
        }
      });

      const marketingPackage = await step.run("marketing-package", async () => {
        const job = await startJob(bookProjectId, "marketing-package");
        try {
          const result = await generateStructured({
            taskType: "marketing-package",
            modelTask: "primary",
            systemPrompt: marketingPackageSystemPrompt,
            userPrompt: buildMarketingPackageUserPrompt({ title: project.title, kdpPackage }),
            schema: marketingPackageSchema,
            mockResponse: marketingPackageMockResponse,
            userId,
            bookProjectId,
          });
          await completeJob(job.id);
          return result;
        } catch (error) {
          await failJob(job.id, error instanceof Error ? error.message : String(error));
          throw error;
        }
      });

      await step.run("save-kdp-package", () =>
        prisma.kdpPackage.upsert({
          where: { bookProjectId },
          create: {
            bookProjectId,
            positioning: kdpPackage.positioning as never,
            titles: kdpPackage.titles as never,
            subtitles: kdpPackage.subtitles as never,
            description: kdpPackage.description as never,
            keywords: kdpPackage.keywords as never,
            categories: kdpPackage.categories as never,
            pricing: kdpPackage.pricing as never,
            launchPlan: marketingPackage.launchStrategy as never,
            marketingPlan: marketingPackage.thirtyDayPlan as never,
            emailSequence: marketingPackage.emailSequence as never,
            socialContent: marketingPackage.socialContent as never,
            aPlusContent: marketingPackage.aPlusContent as never,
          },
          update: {
            positioning: kdpPackage.positioning as never,
            titles: kdpPackage.titles as never,
            subtitles: kdpPackage.subtitles as never,
            description: kdpPackage.description as never,
            keywords: kdpPackage.keywords as never,
            categories: kdpPackage.categories as never,
            pricing: kdpPackage.pricing as never,
            launchPlan: marketingPackage.launchStrategy as never,
            marketingPlan: marketingPackage.thirtyDayPlan as never,
            emailSequence: marketingPackage.emailSequence as never,
            socialContent: marketingPackage.socialContent as never,
            aPlusContent: marketingPackage.aPlusContent as never,
          },
        })
      );
    }

    // -----------------------------------------------------------------
    // Stage 7: Final quality review
    // -----------------------------------------------------------------
    await step.run("final-quality-review", async () => {
      await setProjectStatus(bookProjectId, "QUALITY_REVIEW", { progress: 92 });
      const job = await startJob(bookProjectId, "final-quality-review");
      try {
        const finalBible = await prisma.bookBible.findUniqueOrThrow({ where: { bookProjectId } });
        const chapterSummaries = (finalBible.structuredData as { chapterSummaries?: Array<{ chapterNumber: number; summary: string }> })
          .chapterSummaries ?? [];

        const result = await generateStructured({
          taskType: "final-quality-review",
          modelTask: "review",
          systemPrompt: finalQualityReviewSystemPrompt,
          userPrompt: buildFinalQualityReviewUserPrompt({
            bookPromise: discovery.bookPromise,
            chapterSummaries: outline.chapters.map((c) => ({
              chapterNumber: c.chapterNumber,
              title: c.chapterTitle,
              summary:
                chapterSummaries.find((s) => s.chapterNumber === c.chapterNumber)?.summary ??
                c.chapterSummary,
            })),
            hasFrontMatter: true,
            hasBackMatter: true,
          }),
          schema: finalQualityReviewSchema,
          mockResponse: finalQualityReviewMockResponse,
          userId,
          bookProjectId,
        });

        await prisma.qualityReview.create({
          data: {
            bookProjectId,
            reviewType: "FULL_MANUSCRIPT",
            score: result.overallScore,
            issues: result.issuesFound as never,
            recommendations: result.itemsRequiringHumanReview as never,
            resolved: false,
          },
        });

        await completeJob(job.id);
      } catch (error) {
        await failJob(job.id, error instanceof Error ? error.message : String(error));
        throw error;
      }
    });

    // -----------------------------------------------------------------
    // Done — ready for human review. DOCX compilation happens separately
    // (see the DOCX export phase) once the manuscript is approved.
    // -----------------------------------------------------------------
    await step.run("set-status-ready-for-review", () =>
      setProjectStatus(bookProjectId, "READY_FOR_REVIEW", { progress: 100 })
    );

    return { status: "ready_for_review", bookProjectId };
  }
);
