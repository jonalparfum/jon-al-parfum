import { prisma } from "@/lib/prisma";
import { toProductDTO } from "@/lib/product-utils";
import { Product } from "@/types";

export async function getProductsFromDb(options?: {
  category?: string;
  subcategory?: string;
  featured?: boolean;
  search?: string;
}): Promise<Product[]> {
  const query = options?.search?.trim();

  const products = await prisma.product.findMany({
    where: {
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
              { name: { contains: query, mode: "insensitive" } },
              { brand: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { category: true, subcategory: true },
    orderBy: { createdAt: "desc" },
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
