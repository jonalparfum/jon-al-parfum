import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorized, parseJsonBody } from "@/lib/api-auth";
import {
  normalizeShipping,
  shippingToUserFields,
  validateShipping,
  type ShippingInput,
} from "@/lib/shipping";

export async function GET() {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      shippingPhone: true,
      shippingStreet: true,
      shippingColony: true,
      shippingCity: true,
      shippingState: true,
      shippingZip: true,
      shippingNotes: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    profile: {
      name: user.name,
      email: user.email,
      shippingName: user.name ?? "",
      shippingPhone: user.shippingPhone ?? "",
      shippingStreet: user.shippingStreet ?? "",
      shippingColony: user.shippingColony ?? "",
      shippingCity: user.shippingCity ?? "",
      shippingState: user.shippingState ?? "",
      shippingZip: user.shippingZip ?? "",
      shippingNotes: user.shippingNotes ?? "",
    },
  });
}

type ProfileBody = Partial<ShippingInput> & { name?: string };

export async function PATCH(request: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const body = await parseJsonBody<ProfileBody>(request);
  if (!body) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const shippingInput: ShippingInput = {
    shippingName: body.shippingName ?? body.name ?? "",
    shippingPhone: body.shippingPhone ?? "",
    shippingStreet: body.shippingStreet ?? "",
    shippingColony: body.shippingColony,
    shippingCity: body.shippingCity ?? "",
    shippingState: body.shippingState ?? "",
    shippingZip: body.shippingZip ?? "",
    shippingNotes: body.shippingNotes,
  };

  const validationError = validateShipping(shippingInput);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const normalized = normalizeShipping(shippingInput);

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: normalized.shippingName,
      ...shippingToUserFields(normalized),
    },
    select: {
      name: true,
      email: true,
      shippingPhone: true,
      shippingStreet: true,
      shippingColony: true,
      shippingCity: true,
      shippingState: true,
      shippingZip: true,
      shippingNotes: true,
    },
  });

  return NextResponse.json({ profile: user });
}
