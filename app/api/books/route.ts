import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createBookProjectSchema } from "@/lib/validation/book-project";
import { createBookProject } from "@/lib/services/book-project-service";
import { inngest } from "@/lib/inngest/client";
import { logAudit } from "@/lib/services/audit-service";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createBookProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  let project;
  try {
    project = await createBookProject(session.user.id, parsed.data);
  } catch (error) {
    console.error("create book project error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create book project." },
      { status: 400 }
    );
  }

  await logAudit({
    userId: session.user.id,
    action: "book_project.created",
    entityType: "BookProject",
    entityId: project.id,
  });

  // The project row already exists at this point — a dispatch failure (e.g.
  // the Inngest Dev Server isn't running locally) should not look like the
  // whole request failed. Record it on the project so the Generation Queue
  // / Retry action (Phase 4) can pick it back up, but still return success.
  try {
    await inngest.send({
      name: "book/generate.requested",
      data: { bookProjectId: project.id },
    });
  } catch (error) {
    console.error("inngest dispatch error", error);
    const { prisma } = await import("@/lib/db/prisma");
    await prisma.bookProject.update({
      where: { id: project.id },
      data: {
        errorMessage:
          "Generation could not be queued. If you're running locally, start the Inngest Dev Server (`npm run inngest:dev`) and retry from the project page.",
      },
    });
  }

  return NextResponse.json({ project }, { status: 201 });
}
