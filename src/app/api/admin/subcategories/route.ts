import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  unauthorized,
  parseJsonBody,
} from "@/lib/api-auth";
import { slugify } from "@/lib/product-utils";

type SubcategoryBody = {
  name: string;
  slug?: string;
  description?: string;
  categoryId: string;
};

export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const categoryId = request.nextUrl.searchParams.get("categoryId");

  const subcategories = await prisma.subcategory.findMany({
    where: categoryId ? { categoryId } : undefined,
    include: {
      category: { select: { id: true, name: true, slug: true } },
      _count: { select: { products: true } },
    },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  });

  return NextResponse.json(subcategories);
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const body = await parseJsonBody<SubcategoryBody>(request);
  if (!body?.name || !body.categoryId) {
    return NextResponse.json(
      { error: "Nombre y categoría son obligatorios" },
      { status: 400 }
    );
  }

  const subcategory = await prisma.subcategory.create({
    data: {
      name: body.name,
      slug: body.slug || slugify(body.name),
      description: body.description || null,
      categoryId: body.categoryId,
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      _count: { select: { products: true } },
    },
  });

  return NextResponse.json(subcategory, { status: 201 });
}
