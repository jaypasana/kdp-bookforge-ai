import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { logAudit } from "@/lib/services/audit-service";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await prisma.bookProject.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.bookProject.delete({ where: { id } });

  await logAudit({
    userId: session.user.id,
    action: "book_project.deleted",
    entityType: "BookProject",
    entityId: id,
  });

  return NextResponse.json({ ok: true });
}
