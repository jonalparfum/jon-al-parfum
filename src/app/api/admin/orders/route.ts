import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAdmin, unauthorized } from "@/lib/api-auth";
import { paidOrderWhere } from "@/lib/admin-orders";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const orders = await prisma.order.findMany({
    where: paidOrderWhere,
    include: {
      user: { select: { name: true, email: true } },
      items: {
        include: { product: { select: { name: true, image: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
