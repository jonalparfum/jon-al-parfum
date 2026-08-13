import type { Prisma } from "@prisma/client";

type OrderItemLike = {
  productId: string;
  quantity: number;
  variantId?: string | null;
  variantLabel?: string | null;
};

export async function assertOrderItemsInStock(
  tx: Prisma.TransactionClient,
  items: OrderItemLike[]
) {
  for (const item of items) {
    if (item.variantId) {
      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: { select: { name: true } } },
      });
      if (!variant || variant.stock < item.quantity) {
        throw new Error(
          `Stock insuficiente para ${variant?.product.name ?? "un producto"}${variant ? ` (${variant.label})` : ""}`
        );
      }
      continue;
    }

    const product = await tx.product.findUnique({
      where: { id: item.productId },
      select: { stock: true, name: true },
    });

    if (!product || product.stock < item.quantity) {
      throw new Error(
        `Stock insuficiente para ${product?.name ?? "un producto"}`
      );
    }
  }
}

async function syncProductStockFromVariants(
  tx: Prisma.TransactionClient,
  productId: string
) {
  const variants = await tx.productVariant.findMany({
    where: { productId },
    select: { stock: true, price: true, active: true },
  });
  if (!variants.length) return;

  await tx.product.update({
    where: { id: productId },
    data: {
      stock: variants.reduce((sum, v) => sum + v.stock, 0),
      price: Math.min(...variants.map((v) => v.price)),
    },
  });
}

export async function decrementOrderItemStock(
  tx: Prisma.TransactionClient,
  item: OrderItemLike
) {
  if (item.variantId) {
    await tx.productVariant.update({
      where: { id: item.variantId },
      data: { stock: { decrement: item.quantity } },
    });
    await syncProductStockFromVariants(tx, item.productId);
    return;
  }

  await tx.product.update({
    where: { id: item.productId },
    data: { stock: { decrement: item.quantity } },
  });
}

export async function restoreOrderItemStock(
  tx: Prisma.TransactionClient,
  item: OrderItemLike
) {
  if (item.variantId) {
    await tx.productVariant.update({
      where: { id: item.variantId },
      data: { stock: { increment: item.quantity } },
    });
    await syncProductStockFromVariants(tx, item.productId);
    return;
  }

  await tx.product.update({
    where: { id: item.productId },
    data: { stock: { increment: item.quantity } },
  });
}
