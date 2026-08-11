import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { parseJsonBody } from "@/lib/api-auth";
import { validatePassword } from "@/lib/password-policy";
import {
  normalizeShipping,
  shippingToUserFields,
  validateShipping,
  type ShippingInput,
} from "@/lib/shipping";
import {
  AUTH_LIMITS,
  consumeRateLimit,
  getClientIp,
  rateLimitResponse,
} from "@/lib/rate-limit";

type RegisterBody = {
  name?: string;
  email?: string;
  password?: string;
  shippingPhone?: string;
  shippingStreet?: string;
  shippingColony?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingZip?: string;
  shippingNotes?: string;
};

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const ipLimit = await consumeRateLimit(
    `auth:register:ip:${ip}`,
    AUTH_LIMITS.registerIp.limit,
    AUTH_LIMITS.registerIp.windowSeconds
  );

  if (!ipLimit.ok) {
    return rateLimitResponse(ipLimit.retryAfterSeconds);
  }

  const body = await parseJsonBody<RegisterBody>(request as never);

  if (!body?.email || !body?.password) {
    return NextResponse.json(
      { error: "Email y contraseña son obligatorios" },
      { status: 400 }
    );
  }

  const passwordError = validatePassword(body.password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  const shippingInput: ShippingInput = {
    shippingName: body.name?.trim() ?? "",
    shippingPhone: body.shippingPhone ?? "",
    shippingStreet: body.shippingStreet ?? "",
    shippingColony: body.shippingColony,
    shippingCity: body.shippingCity ?? "",
    shippingState: body.shippingState ?? "",
    shippingZip: body.shippingZip ?? "",
    shippingNotes: body.shippingNotes,
  };

  const shippingError = validateShipping(shippingInput);
  if (shippingError) {
    return NextResponse.json({ error: shippingError }, { status: 400 });
  }

  const normalizedShipping = normalizeShipping(shippingInput);

  const email = body.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Ya existe una cuenta con este email" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(body.password, 12);

  const user = await prisma.user.create({
    data: {
      name: normalizedShipping.shippingName,
      email,
      passwordHash,
      ...shippingToUserFields(normalizedShipping),
    },
    select: { id: true, email: true, name: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
