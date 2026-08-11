import { NextResponse } from "next/server";
import { requireAdmin, unauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const orders = await prisma.order.findMany({
    where: {
      paymentMethod: "BANK_TRANSFER",
      paymentProofStatus: "PENDING_REVIEW",
      paymentProofUrl: { not: null },
    },
    include: {
      user: { select: { name: true, email: true } },
      bankAccount: true,
      items: {
        include: {
          product: { select: { name: true, image: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(orders);
}
