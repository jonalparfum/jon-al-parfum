import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";

const DELETABLE_ORDER_STATUSES = new Set<OrderStatus>(["PENDING", "CANCELLED"]);

export class ProductDeleteError extends Error {
  constructor(
    message: string,
    readonly code: "NOT_FOUND" | "HAS_ORDERS" | "UNKNOWN"
  ) {
    super(message);
    this.name = "ProductDeleteError";
  }
}

export async function deleteProduct(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });

  if (!product) {
    throw new ProductDeleteError("Producto no encontrado", "NOT_FOUND");
  }

  const orderItems = await prisma.orderItem.findMany({
    where: { productId },
    include: { order: { select: { id: true, status: true } } },
  });

  const hasProtectedOrders = orderItems.some(
    (item) => !DELETABLE_ORDER_STATUSES.has(item.order.status)
  );

  if (hasProtectedOrders) {
    throw new ProductDeleteError(
      "No se puede eliminar: el producto tiene pedidos pagados o en proceso. Desactívalo para ocultarlo de la tienda.",
      "HAS_ORDERS"
    );
  }

  await prisma.$transaction(async (tx) => {
    const orderIds = [...new Set(orderItems.map((item) => item.orderId))];

    await tx.orderItem.deleteMany({ where: { productId } });

    for (const orderId of orderIds) {
      const remaining = await tx.orderItem.count({ where: { orderId } });
      if (remaining === 0) {
        await tx.order.delete({ where: { id: orderId } });
      }
    }

    await tx.product.delete({ where: { id: productId } });
  });
}
