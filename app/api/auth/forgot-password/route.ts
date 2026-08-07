import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validation/auth";
import { createPasswordResetToken } from "@/lib/services/auth-service";
import { rateLimit, clientIpFromHeaders } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = clientIpFromHeaders(request.headers);
  const { allowed } = rateLimit(`forgot-password:${ip}`, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const token = await createPasswordResetToken(parsed.data.email);

  // No email provider is wired up yet (see README). In development we return
  // the reset link directly so the flow is testable end-to-end; in production
  // this must be replaced with sending an email and never echoing the token.
  const devResetUrl =
    process.env.NODE_ENV !== "production" && token
      ? `/reset-password?token=${token}`
      : undefined;

  // Always return a generic success response so we don't leak which emails
  // are registered.
  return NextResponse.json({
    message: "If an account exists for that email, a reset link has been generated.",
    ...(devResetUrl ? { devResetUrl } : {}),
  });
}
