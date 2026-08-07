import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validation/auth";
import { changePassword, AuthServiceError } from "@/lib/services/auth-service";
import { rateLimit, clientIpFromHeaders } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ip = clientIpFromHeaders(request.headers);
  const { allowed } = rateLimit(`change-password:${session.user.id}:${ip}`, {
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  try {
    await changePassword(session.user.id, parsed.data.currentPassword, parsed.data.newPassword);
    return NextResponse.json({ message: "Password updated." });
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("change-password error", error);
    return NextResponse.json({ error: "Unable to change password right now." }, { status: 500 });
  }
}
