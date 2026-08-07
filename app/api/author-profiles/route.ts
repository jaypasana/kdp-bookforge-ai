import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { authorProfileSchema } from "@/lib/validation/author-profile";
import { listAuthorProfiles, createAuthorProfile } from "@/lib/services/author-profile-service";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profiles = await listAuthorProfiles(session.user.id);
  return NextResponse.json({ profiles });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = authorProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const profile = await createAuthorProfile(session.user.id, parsed.data);
  return NextResponse.json({ profile }, { status: 201 });
}
