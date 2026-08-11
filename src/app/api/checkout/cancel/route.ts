import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorized, parseJsonBody } from "@/lib/api-auth";
import { cancelPendingOrder } from "@/lib/order-fulfillment";
import { prisma } from "@/lib/prisma";

type CancelBody = {
  orderId?: string;
  sessionId?: string;
};

export async function POST(request: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const body = await parseJsonBody<CancelBody>(request);
  if (!body?.orderId && !body?.sessionId) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  let order =
    body.orderId != null
      ? await prisma.order.findUnique({ where: { id: body.orderId } })
      : body.sessionId
        ? await prisma.order.findUnique({
            where: { stripeSessionId: body.sessionId },
          })
        : null;

  if (!order) {
    return NextResponse.json({ ok: true });
  }

  if (order.userId !== session.user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const cancelledId = await cancelPendingOrder({
    orderId: body.orderId,
    stripeSessionId: body.sessionId,
  });

  return NextResponse.json({ ok: true, cancelled: cancelledId != null });
}
