import { prisma } from "@/lib/prisma";
import { toProductDTO } from "@/lib/product-utils";
import { Product } from "@/types";

export async function getProductsFromDb(options?: {
  category?: string;
  featured?: boolean;
}): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(options?.category && options.category !== "all"
        ? { category: { slug: options.category } }
        : {}),
      ...(options?.featured ? { featured: true } : {}),
    },
    include: { category: true },
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
