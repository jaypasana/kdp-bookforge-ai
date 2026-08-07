import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validation/auth";
import { registerUser, AuthServiceError } from "@/lib/services/auth-service";
import { rateLimit, clientIpFromHeaders } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = clientIpFromHeaders(request.headers);
  const { allowed } = rateLimit(`register:${ip}`, { limit: 10, windowMs: 60 * 60 * 1000 });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many registration attempts. Try again later." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const user = await registerUser(parsed.data);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error("register error", error);
    return NextResponse.json({ error: "Unable to register right now." }, { status: 500 });
  }
}
