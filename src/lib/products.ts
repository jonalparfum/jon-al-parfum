import "server-only";

import { prisma } from "@/lib/prisma";
import { toProductDTO } from "@/lib/product-utils";
import { Product, type ProductSort } from "@/types";

export type { ProductSort };

export function parseProductSort(value?: string | null): ProductSort {
  if (
    value === "bestsellers" ||
    value === "name-asc" ||
    value === "price-desc"
  ) {
    return value;
  }
  return "newest";
}

const paidStatuses = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

function buildWhere(options?: {
  category?: string;
  subcategory?: string;
  featured?: boolean;
  search?: string;
}) {
  const query = options?.search?.trim();

  return {
    active: true,
    ...(options?.category && options.category !== "all"
      ? { category: { slug: options.category } }
      : {}),
    ...(options?.subcategory && options.subcategory !== "all"
      ? { subcategory: { slug: options.subcategory } }
      : {}),
    ...(options?.featured ? { featured: true } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" as const } },
            { brand: { contains: query, mode: "insensitive" as const } },
            { description: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
}

async function sortByBestSellers<T extends { id: string }>(products: T[]) {
  if (products.length === 0) return products;

  const sales = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    where: {
      productId: { in: products.map((p) => p.id) },
      order: { status: { in: [...paidStatuses] } },
    },
  });

  const salesMap = new Map(
    sales.map((row) => [row.productId, row._sum.quantity ?? 0])
  );

  return [...products].sort(
    (a, b) => (salesMap.get(b.id) ?? 0) - (salesMap.get(a.id) ?? 0)
  );
}

export async function getProductsFromDb(options?: {
  category?: string;
  subcategory?: string;
  featured?: boolean;
  search?: string;
  sort?: ProductSort;
}): Promise<Product[]> {
  const where = buildWhere(options);
  const sort = options?.sort ?? "newest";

  if (sort === "bestsellers") {
    const products = await prisma.product.findMany({
      where,
      include: { category: true, subcategory: true },
    });
    const sorted = await sortByBestSellers(products);
    return sorted.map(toProductDTO);
  }

  const orderBy =
    sort === "name-asc"
      ? { name: "asc" as const }
      : sort === "price-desc"
        ? { price: "desc" as const }
        : { createdAt: "desc" as const };

  const products = await prisma.product.findMany({
    where,
    include: { category: true, subcategory: true },
    orderBy,
  });

  return products.map(toProductDTO);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return getProductsFromDb({ featured: true });
}

export async function getProductFromDb(idOrSlug: string): Promise<Product | null> {
  const product = await prisma.product.findFirst({
    where: {
      active: true,
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: { category: true },
  });

  return product ? toProductDTO(product) : null;
}

export { formatPrice } from "@/lib/product-utils";