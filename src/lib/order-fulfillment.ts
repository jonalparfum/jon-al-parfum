import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";

type MarkOrderPaidData = {
  stripePaymentId?: string | null;
  shippingName?: string | null;
  shippingEmail?: string | null;
  shippingAddress?: string | null;
};

/** Marca pedido como PAID y descuenta stock (idempotente si ya no está PENDING). */
export async function markOrderPaid(
  orderId: string,
  data: MarkOrderPaidData = {}
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order || order.status !== "PENDING") {
      return order;
    }

    for (const item of order.items) {
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

    await tx.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        ...data,
      },
    });

    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
  });
}

/** Restaura stock si un pedido pagado se cancela. */
export async function restoreOrderStock(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order || order.status !== "PAID") {
      return order;
    }

    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    return order;
  });
}

export async function updateOrderStatus(
  orderId: string,
  nextStatus: OrderStatus
) {
  const current = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true },
  });

  if (!current) {
    throw new Error("Pedido no encontrado");
  }

  if (current.status === nextStatus) {
    return prisma.order.findUnique({ where: { id: orderId } });
  }

  if (nextStatus === "PAID" && current.status === "PENDING") {
    return markOrderPaid(orderId);
  }

  if (nextStatus === "CANCELLED" && current.status === "PAID") {
    await restoreOrderStock(orderId);
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status: nextStatus },
  });
}
