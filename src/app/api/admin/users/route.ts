import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAdmin, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}
