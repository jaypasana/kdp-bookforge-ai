import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { inngest } from "@/lib/inngest/client";
import { logAudit } from "@/lib/services/audit-service";
import { IN_PROGRESS_STATUSES } from "@/lib/constants/project-status";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await prisma.bookProject.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!IN_PROGRESS_STATUSES.has(project.status)) {
    return NextResponse.json(
      { error: "This project isn't currently generating." },
      { status: 409 }
    );
  }

  await inngest.send({ name: "book/generation.cancelled", data: { bookProjectId: id } });

  await prisma.bookProject.update({
    where: { id },
    data: { status: "CANCELLED", errorMessage: "Generation stopped by user." },
  });

  await logAudit({
    userId: session.user.id,
    action: "book_project.generation_cancelled",
    entityType: "BookProject",
    entityId: id,
  });

  return NextResponse.json({ ok: true });
}
