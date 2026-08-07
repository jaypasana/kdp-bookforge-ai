import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { logAudit } from "@/lib/services/audit-service";

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

export class AuthServiceError extends Error {}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AuthServiceError("An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
    },
  });

  // Every user needs at least one author profile to create a book — seed a
  // minimal default they can flesh out later from Brand Profiles.
  await prisma.authorProfile.create({
    data: {
      userId: user.id,
      authorName: input.name,
      shortBio: `${input.name} is an author using KDP BookForge AI to publish practical, reader-focused nonfiction.`,
      longBio: `${input.name} is an author using KDP BookForge AI to publish practical, reader-focused nonfiction. Edit this bio from the Brand Profiles page.`,
      copyrightHolder: input.name,
      isDefault: true,
    },
  });

  await logAudit({ userId: user.id, action: "user.register" });

  return { id: user.id, email: user.email, name: user.name };
}

/**
 * Creates a password reset token. Returns the raw token so the caller can
 * build a reset link. In this version there is no transactional email
 * provider wired up — see README "Password reset" section for how to plug
 * one in. Never log or return the token to a party other than the
 * requesting user's verified email address.
 */
export async function createPasswordResetToken(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Do not reveal whether the account exists.
  if (!user) return null;

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expires },
  });

  await logAudit({ userId: user.id, action: "user.password_reset_requested" });

  return token;
}

export async function resetPassword(token: string, newPassword: string) {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expires < new Date()) {
    throw new AuthServiceError("This reset link is invalid or has expired.");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  await logAudit({ userId: resetToken.userId, action: "user.password_reset_completed" });
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.passwordHash) {
    throw new AuthServiceError("This account has no password set.");
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    throw new AuthServiceError("Current password is incorrect.");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  await logAudit({ userId, action: "user.password_changed" });
}
