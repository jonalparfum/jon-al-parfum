import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  unauthorized,
  parseJsonBody,
} from "@/lib/api-auth";
import { serializeNotes, slugify, serializeImages } from "@/lib/product-utils";

type ProductBody = {
  name: string;
  slug?: string;
  brand?: string;
  description: string;
  price: number;
  originalPrice?: number;
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
  categoryId: string;
  subcategoryId?: string | null;
};

export async function GET() {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const products = await prisma.product.findMany({
    include: { category: true, subcategory: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const body = await parseJsonBody<ProductBody>(request);
  if (
    !body?.name ||
    !body.description ||
    body.price == null ||
    !body.categoryId
  ) {
    return NextResponse.json(
      { error: "Faltan campos obligatorios" },
      { status: 400 }
    );
  }

  const slug = body.slug || slugify(body.name);
  const images = body.images?.length
    ? body.images
    : body.image
      ? [body.image]
      : [];
  const primaryImage =
    images[0] || body.image || "/uploads/products/placeholder.jpg";

  try {
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug,
        brand: body.brand || "Jon Al Parfum",
        description: body.description,
        price: body.price,
        originalPrice: body.originalPrice ?? null,
        image: primaryImage,
        images: serializeImages(images),
        size: body.size || "100ml",
        notesTop: serializeNotes(body.notesTop || []),
        notesHeart: serializeNotes(body.notesHeart || []),
        notesBase: serializeNotes(body.notesBase || []),
        featured: body.featured ?? false,
        isNew: body.isNew ?? false,
        stock: body.stock ?? 100,
        active: body.active ?? true,
        categoryId: body.categoryId,
        subcategoryId: body.subcategoryId || null,
      },
      include: { category: true, subcategory: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "No se pudo crear el producto" },
      { status: 500 }
    );
  }
}
