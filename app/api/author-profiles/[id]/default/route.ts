import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { setDefaultAuthorProfile } from "@/lib/services/author-profile-service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await setDefaultAuthorProfile(session.user.id, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to set default profile." },
      { status: 400 }
    );
  }
}
