import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  unauthorized,
  parseJsonBody,
} from "@/lib/api-auth";
import { serializeNotes, slugify } from "@/lib/product-utils";

type RouteParams = { params: Promise<{ id: string }> };

type ProductBody = {
  name?: string;
  slug?: string;
  brand?: string;
  description?: string;
  price?: number;
  originalPrice?: number | null;
  image?: string;
  size?: string;
  notesTop?: string[];
  notesHeart?: string[];
  notesBase?: string[];
  featured?: boolean;
  isNew?: boolean;
  stock?: number;
  active?: boolean;
  categoryId?: string;
  subcategoryId?: string | null;
};

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, subcategory: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const { id } = await params;
  const body = await parseJsonBody<ProductBody>(request);
  if (!body) {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.name !== undefined &&
          body.slug === undefined && { slug: slugify(body.name) }),
        ...(body.brand !== undefined && { brand: body.brand }),
        ...(body.description !== undefined && {
          description: body.description,
        }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.originalPrice !== undefined && {
          originalPrice: body.originalPrice,
        }),
        ...(body.image !== undefined && { image: body.image }),
        ...(body.size !== undefined && { size: body.size }),
        ...(body.notesTop !== undefined && {
          notesTop: serializeNotes(body.notesTop),
        }),
        ...(body.notesHeart !== undefined && {
          notesHeart: serializeNotes(body.notesHeart),
        }),
        ...(body.notesBase !== undefined && {
          notesBase: serializeNotes(body.notesBase),
        }),
        ...(body.featured !== undefined && { featured: body.featured }),
        ...(body.isNew !== undefined && { isNew: body.isNew }),
        ...(body.stock !== undefined && { stock: body.stock }),
        ...(body.active !== undefined && { active: body.active }),
        ...(body.categoryId !== undefined && { categoryId: body.categoryId }),
        ...(body.subcategoryId !== undefined && {
          subcategoryId: body.subcategoryId || null,
        }),
      },
      include: { category: true, subcategory: true },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el producto" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const { id } = await params;
  await prisma.product.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
