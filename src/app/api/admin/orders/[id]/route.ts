import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorized, parseJsonBody } from "@/lib/api-auth";
import { OrderStatus } from "@prisma/client";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const { id } = await params;
  const body = await parseJsonBody<{ status: OrderStatus }>(request);

  if (!body?.status) {
    return NextResponse.json({ error: "Estado requerido" }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status: body.status },
  });

  return NextResponse.json(order);
}
