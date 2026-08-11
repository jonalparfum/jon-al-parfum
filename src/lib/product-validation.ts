import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

export async function validateSubcategoryForCategory(
  categoryId: string,
  subcategoryId: string | null | undefined
): Promise<string | null> {
  if (!subcategoryId) return null;

  const sub = await prisma.subcategory.findUnique({
    where: { id: subcategoryId },
    select: { categoryId: true },
  });

  if (!sub) return "Subcategoría no encontrada";
  if (sub.categoryId !== categoryId) {
    return "La subcategoría no pertenece a la categoría seleccionada";
  }

  return null;
}

export function validateProductPricing(
  price: number | undefined,
  stock: number | undefined
): string | null {
  if (price !== undefined && (!Number.isFinite(price) || price <= 0)) {
    return "El precio debe ser mayor a 0";
  }
  if (stock !== undefined && (!Number.isInteger(stock) || stock < 0)) {
    return "El stock no puede ser negativo";
  }
  return null;
}

const ORDER_STATUSES = new Set<string>(Object.values(OrderStatus));

export function validateOrderStatus(status: string): status is OrderStatus {
  return ORDER_STATUSES.has(status);
}

export function sanitizeCallbackUrl(url: string): string {
  if (!url.startsWith("/") || url.startsWith("//")) return "/";
  return url;
}
