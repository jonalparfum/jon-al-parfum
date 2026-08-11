import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  unauthorized,
  parseJsonBody,
} from "@/lib/api-auth";
import { slugify } from "@/lib/product-utils";

type RouteParams = { params: Promise<{ id: string }> };

type SubcategoryBody = {
  name?: string;
  slug?: string;
  description?: string | null;
  categoryId?: string;
};

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const { id } = await params;
  const body = await parseJsonBody<SubcategoryBody>(request);
  if (!body) {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const subcategory = await prisma.subcategory.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.name !== undefined &&
        body.slug === undefined && { slug: slugify(body.name) }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.categoryId !== undefined && { categoryId: body.categoryId }),
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      _count: { select: { products: true } },
    },
  });

  return NextResponse.json(subcategory);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const { id } = await params;

  const count = await prisma.product.count({ where: { subcategoryId: id } });
  if (count > 0) {
    return NextResponse.json(
      { error: "No se puede eliminar una subcategoría con productos" },
      { status: 400 }
    );
  }

  await prisma.subcategory.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
