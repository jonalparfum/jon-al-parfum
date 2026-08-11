import type { NextRequest } from "next/server";
import { handlers } from "@/lib/auth";
import {
  AUTH_LIMITS,
  consumeRateLimit,
  getClientIp,
  rateLimitResponse,
} from "@/lib/rate-limit";

const { GET } = handlers;

async function POST(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.endsWith("/callback/credentials")) {
    const ip = getClientIp(req);
    const ipLimit = await consumeRateLimit(
      `auth:login:ip:${ip}`,
      AUTH_LIMITS.loginIp.limit,
      AUTH_LIMITS.loginIp.windowSeconds
    );

    if (!ipLimit.ok) {
      return rateLimitResponse(ipLimit.retryAfterSeconds);
    }
  }

  return handlers.POST(req);
}

export { GET, POST };
