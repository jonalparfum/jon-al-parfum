import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth, requireAdmin, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: { product: { select: { name: true, image: true, slug: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
