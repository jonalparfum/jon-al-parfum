import { prisma } from "@/lib/prisma";
import {
  normalizeVariantInputs,
  summarizeVariants,
  type ProductVariantInput,
} from "@/lib/product-variants";

export async function replaceProductVariants(
  productId: string,
  variants: ProductVariantInput[]
) {
  const normalized = normalizeVariantInputs(variants);

  await prisma.$transaction(async (tx) => {
    await tx.productVariant.deleteMany({ where: { productId } });

    if (normalized.length > 0) {
      await tx.productVariant.createMany({
        data: normalized.map((variant, index) => ({
          productId,
          label: variant.label,
          price: variant.price,
          stock: variant.stock,
          sortOrder: variant.sortOrder ?? index,
          active: variant.active ?? true,
        })),
      });

      const summary = summarizeVariants(normalized);
      await tx.product.update({
        where: { id: productId },
        data: {
          price: summary.price,
          stock: summary.stock,
          size: summary.size,
        },
      });
    }
  });
}

export async function loadVariantsByProductIds(productIds: string[]) {
  if (!productIds.length) return new Map<string, Awaited<ReturnType<typeof prisma.productVariant.findMany>>>();

  const variants = await prisma.productVariant.findMany({
    where: { productId: { in: productIds }, active: true },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
  });

  const map = new Map<string, typeof variants>();
  for (const variant of variants) {
    const list = map.get(variant.productId) ?? [];
    list.push(variant);
    map.set(variant.productId, list);
  }
  return map;
}
