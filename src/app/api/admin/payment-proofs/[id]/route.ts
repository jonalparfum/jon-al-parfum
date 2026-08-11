import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorized, parseJsonBody } from "@/lib/api-auth";
import {
  approvePaymentProof,
  rejectPaymentProof,
} from "@/lib/order-fulfillment";

type RouteParams = { params: Promise<{ id: string }> };

type ProofActionBody = {
  action: "approve" | "reject";
  note?: string;
};

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const { id } = await params;
  const body = await parseJsonBody<ProofActionBody>(request);

  if (!body?.action || !["approve", "reject"].includes(body.action)) {
    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  }

  try {
    if (body.action === "approve") {
      const order = await approvePaymentProof(id, body.note);
      return NextResponse.json(order);
    }

    const order = await rejectPaymentProof(id, body.note);
    return NextResponse.json(order);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al procesar comprobante";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
