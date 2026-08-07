import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { inngest } from "@/lib/inngest/client";
import { logAudit } from "@/lib/services/audit-service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await prisma.bookProject.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (project.status !== "AWAITING_OUTLINE_APPROVAL") {
    return NextResponse.json(
      { error: "This project isn't waiting on outline approval." },
      { status: 409 }
    );
  }

  await inngest.send({ name: "book/outline.approved", data: { bookProjectId: id } });
  await logAudit({
    userId: session.user.id,
    action: "book_project.outline_approved",
    entityType: "BookProject",
    entityId: id,
  });

  return NextResponse.json({ ok: true });
}
