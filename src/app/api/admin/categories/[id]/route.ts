import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  unauthorized,
  parseJsonBody,
} from "@/lib/api-auth";
import { slugify } from "@/lib/product-utils";

type RouteParams = { params: Promise<{ id: string }> };

type CategoryBody = {
  name?: string;
  slug?: string;
  description?: string | null;
};

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const { id } = await params;
  const body = await parseJsonBody<CategoryBody>(request);
  if (!body) {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.name !== undefined &&
        body.slug === undefined && { slug: slugify(body.name) }),
      ...(body.description !== undefined && { description: body.description }),
    },
  });

  return NextResponse.json(category);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const { id } = await params;

  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    return NextResponse.json(
      { error: "No se puede eliminar un catálogo con productos" },
      { status: 400 }
    );
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
