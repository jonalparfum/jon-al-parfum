import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}

export async function isRateLimited(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  try {
    const now = new Date();
    const entry = await prisma.rateLimitEntry.findUnique({
      where: { key },
    });

    if (!entry || entry.expiresAt <= now) {
      return false;
    }

    return entry.count >= limit;
  } catch (error) {
    console.error("[rate-limit] peek failed:", error);
    return false;
  }
}

export async function consumeRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + windowSeconds * 1000);

    const entry = await prisma.rateLimitEntry.findUnique({
      where: { key },
    });

    if (!entry || entry.expiresAt <= now) {
      await prisma.rateLimitEntry.upsert({
        where: { key },
        create: { key, count: 1, expiresAt },
        update: { count: 1, expiresAt },
      });
      return { ok: true };
    }

    if (entry.count >= limit) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((entry.expiresAt.getTime() - now.getTime()) / 1000)
      );
      return { ok: false, retryAfterSeconds };
    }

    await prisma.rateLimitEntry.update({
      where: { key },
      data: { count: { increment: 1 } },
    });

    return { ok: true };
  } catch (error) {
    console.error("[rate-limit] check failed:", error);
    return { ok: true };
  }
}

export function rateLimitResponse(retryAfterSeconds: number) {
  const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
  return NextResponse.json(
    {
      error: `Demasiados intentos. Espera ${minutes} minuto${minutes === 1 ? "" : "s"} e inténtalo de nuevo.`,
    },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    }
  );
}

export const AUTH_LIMITS = {
  loginIp: { limit: 10, windowSeconds: 15 * 60 },
  loginEmail: { limit: 5, windowSeconds: 15 * 60 },
  registerIp: { limit: 5, windowSeconds: 60 * 60 },
} as const;
