import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  unauthorized,
  parseJsonBody,
} from "@/lib/api-auth";
import { serializeNotes, slugify, serializeImages } from "@/lib/product-utils";
import {
  validateProductPricing,
  validateSubcategoryForCategory,
} from "@/lib/product-validation";

type RouteParams = { params: Promise<{ id: string }> };

type ProductBody = {
  name?: string;
  slug?: string;
  brand?: string;
  description?: string;
  price?: number;
  originalPrice?: number | null;
  image?: string;
  images?: string[];
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

  const existing = await prisma.product.findUnique({
    where: { id },
    select: { categoryId: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  const effectiveCategoryId = body.categoryId ?? existing.categoryId;
  const pricingError = validateProductPricing(body.price, body.stock);
  if (pricingError) {
    return NextResponse.json({ error: pricingError }, { status: 400 });
  }

  if (body.subcategoryId !== undefined || body.categoryId !== undefined) {
    const subError = await validateSubcategoryForCategory(
      effectiveCategoryId,
      body.subcategoryId
    );
    if (subError) {
      return NextResponse.json({ error: subError }, { status: 400 });
    }
  }

  try {
    const images = Array.isArray(body.images)
      ? body.images.filter(Boolean)
      : body.image
        ? [body.image]
        : [];

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
        ...(body.images !== undefined || body.image !== undefined
          ? {
              images: serializeImages(images),
              image:
                images[0] ||
                body.image ||
                "/uploads/products/placeholder.jpg",
            }
          : {}),
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
    const message =
      error instanceof Error &&
      "code" in error &&
      (error as { code?: string }).code === "P2022"
        ? "Falta la columna images en la base de datos. Ejecuta prisma db push."
        : "No se pudo actualizar el producto";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const { id } = await params;

  try {
    const orderItems = await prisma.orderItem.count({ where: { productId: id } });
    if (orderItems > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar: el producto tiene pedidos asociados. Desactívalo en su lugar.",
        },
        { status: 409 }
      );
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    const code =
      error instanceof Error && "code" in error
        ? (error as { code?: string }).code
        : undefined;
    if (code === "P2025") {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "No se pudo eliminar el producto" },
      { status: 500 }
    );
  }
}
