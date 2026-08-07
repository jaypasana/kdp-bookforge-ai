import { NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/validation/auth";
import { resetPassword, AuthServiceError } from "@/lib/services/auth-service";
import { rateLimit, clientIpFromHeaders } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = clientIpFromHeaders(request.headers);
  const { allowed } = rateLimit(`reset-password:${ip}`, {
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  try {
    await resetPassword(parsed.data.token, parsed.data.password);
    return NextResponse.json({ message: "Password updated. You can now log in." });
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("reset-password error", error);
    return NextResponse.json({ error: "Unable to reset password right now." }, { status: 500 });
  }
}
