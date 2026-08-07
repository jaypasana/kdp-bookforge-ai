import { prisma } from "@/lib/db/prisma";
import { emptyBookBible, type BookBible } from "@/lib/prompts/continuity-reviewer";

export async function getOrCreateBookBible(
  bookProjectId: string,
  seed: { bookPromise: string; targetAudience: string; tone: string }
): Promise<BookBible> {
  const existing = await prisma.bookBible.findUnique({ where: { bookProjectId } });
  if (existing) return existing.structuredData as unknown as BookBible;

  const initial = emptyBookBible(seed.bookPromise, seed.targetAudience, seed.tone);
  await prisma.bookBible.create({
    data: { bookProjectId, structuredData: initial as never },
  });
  return initial;
}

export async function updateBookBible(bookProjectId: string, updated: BookBible) {
  await prisma.bookBible.update({
    where: { bookProjectId },
    data: { structuredData: updated as never },
  });
}
