import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorized, parseJsonBody } from "@/lib/api-auth";
import { updateOrderStatus, deleteOrder } from "@/lib/order-fulfillment";
import { validateOrderStatus } from "@/lib/product-validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const { id } = await params;
  const body = await parseJsonBody<{ status: string }>(request);

  if (!body?.status || !validateOrderStatus(body.status)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
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

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const { id } = await params;

  try {
    await deleteOrder(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al eliminar pedido";
    const status = message === "Pedido no encontrado" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
