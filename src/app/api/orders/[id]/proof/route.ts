import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { uploadPaymentProof } from "@/lib/file-upload";

type RouteParams = { params: Promise<{ id: string }> };

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "application/pdf",
];

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const { id } = await params;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.userId !== session.user.id) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  if (order.paymentMethod !== "BANK_TRANSFER") {
    return NextResponse.json(
      { error: "Este pedido no es por transferencia" },
      { status: 400 }
    );
  }

  if (order.status !== "PENDING") {
    return NextResponse.json(
      { error: "Este pedido ya fue procesado" },
      { status: 400 }
    );
  }

  if (order.paymentProofStatus === "PENDING_REVIEW") {
    return NextResponse.json(
      { error: "Ya hay un comprobante en revisión para este pedido" },
      { status: 400 }
    );
  }

  if (order.paymentProofStatus === "APPROVED") {
    return NextResponse.json(
      { error: "Este pedido ya fue aprobado" },
      { status: 400 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No se envió archivo" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Formato no permitido. Usa JPG, PNG, WebP o PDF" },
      { status: 400 }
    );
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "El archivo no puede superar 10MB" },
      { status: 400 }
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `${order.id}-${Date.now()}.${ext}`;

  try {
    const { url } = await uploadPaymentProof(file, filename);

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentProofUrl: url,
        paymentProofStatus: "PENDING_REVIEW",
        paymentProofNote: null,
      },
    });

    return NextResponse.json({
      orderId: updated.id,
      paymentProofStatus: updated.paymentProofStatus,
    });
  } catch (error) {
    console.error("Payment proof upload error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo subir el comprobante",
      },
      { status: 500 }
    );
  }
}
