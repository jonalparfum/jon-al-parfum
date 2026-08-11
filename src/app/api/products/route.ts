import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { toProductDTO } from "@/lib/product-utils";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("categoria");
  const featured = request.nextUrl.searchParams.get("featured");

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(category && category !== "all"
        ? { category: { slug: category } }
        : {}),
      ...(featured === "true" ? { featured: true } : {}),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products.map(toProductDTO));
}
