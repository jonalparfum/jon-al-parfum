import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { toProductDTO } from "@/lib/product-utils";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const product = await prisma.product.findFirst({
    where: {
      active: true,
      OR: [{ id }, { slug: id }],
    },
    include: { category: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  return NextResponse.json(toProductDTO(product));
}
