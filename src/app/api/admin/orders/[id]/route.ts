import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorized, parseJsonBody } from "@/lib/api-auth";
import { updateOrderStatus } from "@/lib/order-fulfillment";
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

  try {
    const order = await updateOrderStatus(id, body.status);
    return NextResponse.json(order);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al actualizar pedido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
