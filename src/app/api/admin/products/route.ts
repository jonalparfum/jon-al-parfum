import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
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
import {
  validateProductVariants,
  summarizeVariants,
  type ProductVariantInput,
} from "@/lib/product-variants";
import { replaceProductVariants } from "@/lib/product-variant-db";

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
  useVariants?: boolean;
  variants?: ProductVariantInput[];
};

const productInclude = {
  category: true,
  subcategory: true,
  variants: { orderBy: [{ sortOrder: "asc" as const }, { label: "asc" as const }] },
};

export async function GET() {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const products = await prisma.product.findMany({
    include: productInclude,
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

  const useVariants = Boolean(body.useVariants && body.variants?.length);

  if (useVariants) {
    const variantError = validateProductVariants(body.variants!);
    if (variantError) {
      return NextResponse.json({ error: variantError }, { status: 400 });
    }
  } else {
    const pricingError = validateProductPricing(body.price, body.stock);
    if (pricingError) {
      return NextResponse.json({ error: pricingError }, { status: 400 });
    }
  }

  const subError = await validateSubcategoryForCategory(
    body.categoryId,
    body.subcategoryId
  );
  if (subError) {
    return NextResponse.json({ error: subError }, { status: 400 });
  }

  const slug = body.slug || slugify(body.name);
  const images = body.images?.length
    ? body.images
    : body.image
      ? [body.image]
      : [];
  const primaryImage =
    images[0] || body.image || "/uploads/products/placeholder.jpg";

  const summary = useVariants ? summarizeVariants(body.variants!) : null;

  try {
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug,
        brand: body.brand || "Jon Al Parfum",
        description: body.description,
        price: summary?.price ?? body.price,
        originalPrice: body.originalPrice ?? null,
        image: primaryImage,
        images: serializeImages(images),
        size: summary?.size ?? body.size ?? "100ml",
        notesTop: serializeNotes(body.notesTop || []),
        notesHeart: serializeNotes(body.notesHeart || []),
        notesBase: serializeNotes(body.notesBase || []),
        featured: body.featured ?? false,
        isNew: body.isNew ?? false,
        stock: summary?.stock ?? body.stock ?? 100,
        active: body.active ?? true,
        categoryId: body.categoryId,
        subcategoryId: body.subcategoryId || null,
      },
      include: productInclude,
    });

    if (useVariants) {
      await replaceProductVariants(product.id, body.variants!);
      const refreshed = await prisma.product.findUnique({
        where: { id: product.id },
        include: productInclude,
      });
      return NextResponse.json(refreshed, { status: 201 });
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Ya existe un producto con ese nombre o slug" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "No se pudo crear el producto" },
      { status: 500 }
    );
  }
}
