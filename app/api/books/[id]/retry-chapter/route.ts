import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { inngest } from "@/lib/inngest/client";
import { logAudit } from "@/lib/services/audit-service";

const bodySchema = z.object({ chapterNumber: z.number().int().min(1) });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await prisma.bookProject.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const chapter = await prisma.chapter.findUnique({
    where: {
      bookProjectId_chapterNumber: { bookProjectId: id, chapterNumber: parsed.data.chapterNumber },
    },
  });
  if (!chapter) return NextResponse.json({ error: "Chapter not found." }, { status: 404 });
  if (chapter.locked) {
    return NextResponse.json({ error: "This chapter is locked and cannot be regenerated." }, { status: 409 });
  }

  await inngest.send({
    name: "book/chapter.retry",
    data: { bookProjectId: id, chapterNumber: parsed.data.chapterNumber },
  });

  await logAudit({
    userId: session.user.id,
    action: "chapter.retry_requested",
    entityType: "Chapter",
    entityId: chapter.id,
  });

  return NextResponse.json({ ok: true });
}
