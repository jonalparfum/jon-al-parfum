import { STRIPE_MIN_MXN } from "@/lib/stripe-limits";

export type ProductVariantInput = {
  id?: string;
  label: string;
  price: number;
  stock: number;
  sortOrder?: number;
  active?: boolean;
};

export type ProductVariantDTO = {
  id: string;
  label: string;
  price: number;
  stock: number;
  sortOrder: number;
  active: boolean;
};

export function normalizeVariantInputs(
  variants: ProductVariantInput[]
): ProductVariantInput[] {
  return variants
    .map((v, index) => ({
      id: v.id,
      label: v.label.trim(),
      price: Number(v.price),
      stock: Math.max(0, Math.floor(Number(v.stock) || 0)),
      sortOrder: v.sortOrder ?? index,
      active: v.active ?? true,
    }))
    .filter((v) => v.label.length > 0);
}

export function validateProductVariants(
  variants: ProductVariantInput[]
): string | null {
  const normalized = normalizeVariantInputs(variants);
  if (normalized.length === 0) {
    return "Agrega al menos un tamaño con precio y stock";
  }

  const labels = new Set<string>();
  for (const variant of normalized) {
    const key = variant.label.toLowerCase();
    if (labels.has(key)) {
      return `El tamaño "${variant.label}" está repetido`;
    }
    labels.add(key);

    if (!Number.isFinite(variant.price) || variant.price < STRIPE_MIN_MXN) {
      return `El precio de ${variant.label} debe ser mínimo ${STRIPE_MIN_MXN} MXN`;
    }
    if (!Number.isInteger(variant.stock) || variant.stock < 0) {
      return `El stock de ${variant.label} no puede ser negativo`;
    }
  }

  return null;
}

export function summarizeVariants(variants: ProductVariantInput[]) {
  const normalized = normalizeVariantInputs(variants);
  const minPrice = Math.min(...normalized.map((v) => v.price));
  const totalStock = normalized.reduce((sum, v) => sum + v.stock, 0);
  const labels = normalized.map((v) => v.label).join(", ");
  return {
    price: minPrice,
    stock: totalStock,
    size: labels || "Varios tamaños",
  };
}

export function productHasStock(
  stock: number,
  variants?: ProductVariantDTO[]
): boolean {
  if (variants?.length) {
    return variants.some((v) => v.active && v.stock > 0);
  }
  return stock > 0;
}

export function productFromPrice(
  price: number,
  variants?: ProductVariantDTO[]
): { amount: number; fromPrice: boolean } {
  if (!variants?.length) {
    return { amount: price, fromPrice: false };
  }
  const available = variants.filter((v) => v.active && v.stock > 0);
  const pool = available.length > 0 ? available : variants.filter((v) => v.active);
  const amounts = pool.map((v) => v.price);
  if (!amounts.length) {
    return { amount: price, fromPrice: true };
  }
  return { amount: Math.min(...amounts), fromPrice: true };
}
