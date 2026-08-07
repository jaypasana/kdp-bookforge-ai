import { prisma } from "@/lib/db/prisma";
import type { AuthorProfileInput } from "@/lib/validation/author-profile";

export function listAuthorProfiles(userId: string) {
  return prisma.authorProfile.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
}

export function getAuthorProfile(userId: string, id: string) {
  return prisma.authorProfile.findFirst({ where: { id, userId } });
}

export async function createAuthorProfile(userId: string, input: AuthorProfileInput) {
  const existingCount = await prisma.authorProfile.count({ where: { userId } });

  return prisma.authorProfile.create({
    data: {
      userId,
      authorName: input.authorName,
      penName: input.penName || undefined,
      shortBio: input.shortBio,
      longBio: input.longBio,
      website: input.website || undefined,
      email: input.email || undefined,
      authorTagline: input.authorTagline || undefined,
      publisherName: input.publisherName || undefined,
      copyrightHolder: input.copyrightHolder || undefined,
      defaultCTA: input.defaultCTA || undefined,
      bonusResourceUrl: input.bonusResourceUrl || undefined,
      isDefault: existingCount === 0,
    },
  });
}

export async function updateAuthorProfile(
  userId: string,
  id: string,
  input: AuthorProfileInput
) {
  const existing = await getAuthorProfile(userId, id);
  if (!existing) throw new Error("Author profile not found");

  return prisma.authorProfile.update({
    where: { id },
    data: {
      authorName: input.authorName,
      penName: input.penName || null,
      shortBio: input.shortBio,
      longBio: input.longBio,
      website: input.website || null,
      email: input.email || null,
      authorTagline: input.authorTagline || null,
      publisherName: input.publisherName || null,
      copyrightHolder: input.copyrightHolder || null,
      defaultCTA: input.defaultCTA || null,
      bonusResourceUrl: input.bonusResourceUrl || null,
    },
  });
}

export async function setDefaultAuthorProfile(userId: string, id: string) {
  const existing = await getAuthorProfile(userId, id);
  if (!existing) throw new Error("Author profile not found");

  await prisma.$transaction([
    prisma.authorProfile.updateMany({
      where: { userId },
      data: { isDefault: false },
    }),
    prisma.authorProfile.update({
      where: { id },
      data: { isDefault: true },
    }),
  ]);
}

export async function deleteAuthorProfile(userId: string, id: string) {
  const existing = await getAuthorProfile(userId, id);
  if (!existing) throw new Error("Author profile not found");

  const usedByProject = await prisma.bookProject.findFirst({
    where: { authorProfileId: id },
  });
  if (usedByProject) {
    throw new Error("This author profile is used by a book project and cannot be deleted.");
  }

  await prisma.authorProfile.delete({ where: { id } });

  if (existing.isDefault) {
    const next = await prisma.authorProfile.findFirst({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    if (next) {
      await prisma.authorProfile.update({
        where: { id: next.id },
        data: { isDefault: true },
      });
    }
  }
}
