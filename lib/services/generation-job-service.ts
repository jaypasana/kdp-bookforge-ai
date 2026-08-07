import { prisma } from "@/lib/db/prisma";
import type { BookProjectStatus, JobStatus } from "@prisma/client";

export async function startJob(bookProjectId: string, jobType: string) {
  return prisma.generationJob.create({
    data: { bookProjectId, jobType, status: "RUNNING", startedAt: new Date() },
  });
}

export async function completeJob(jobId: string, progress = 100) {
  return prisma.generationJob.update({
    where: { id: jobId },
    data: { status: "SUCCEEDED", progress, completedAt: new Date() },
  });
}

export async function failJob(jobId: string, errorMessage: string) {
  return prisma.generationJob.update({
    where: { id: jobId },
    data: { status: "FAILED" as JobStatus, errorMessage, completedAt: new Date() },
  });
}

export async function setProjectStatus(
  bookProjectId: string,
  status: BookProjectStatus,
  extra: { progress?: number; errorMessage?: string | null } = {}
) {
  return prisma.bookProject.update({
    where: { id: bookProjectId },
    data: {
      status,
      ...(extra.progress !== undefined ? { progress: extra.progress } : {}),
      errorMessage: extra.errorMessage ?? null,
      ...(status === "APPROVED" || status === "READY_FOR_REVIEW"
        ? { completedAt: new Date() }
        : {}),
    },
  });
}
