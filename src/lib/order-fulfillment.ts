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

export async function approvePaymentProof(orderId: string, note?: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new Error("Pedido no encontrado");
    if (order.paymentMethod !== "BANK_TRANSFER") {
      throw new Error("Este pedido no es por transferencia");
    }
    if (order.paymentProofStatus !== "PENDING_REVIEW") {
      throw new Error("El comprobante no está pendiente de revisión");
    }
    if (!order.paymentProofUrl) {
      throw new Error("No hay comprobante adjunto");
    }
    if (order.status !== "PENDING") {
      throw new Error("El pedido ya fue procesado");
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
        paymentProofStatus: "APPROVED",
        paymentProofNote: note ?? null,
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
      include: { items: true, user: { select: { email: true, name: true } } },
    });
  });
}

export async function rejectPaymentProof(orderId: string, note?: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) throw new Error("Pedido no encontrado");
  if (order.paymentMethod !== "BANK_TRANSFER") {
    throw new Error("Este pedido no es por transferencia");
  }
  if (order.paymentProofStatus !== "PENDING_REVIEW") {
    throw new Error("El comprobante no está pendiente de revisión");
  }

  return prisma.order.update({
    where: { id: orderId },
    data: {
      paymentProofStatus: "REJECTED",
      paymentProofNote: note ?? null,
    },
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

const STOCK_RESERVED_STATUSES: OrderStatus[] = [
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

/** Elimina un pedido y devuelve inventario si ya se había descontado. */
export async function deleteOrder(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new Error("Pedido no encontrado");
    }

    if (STOCK_RESERVED_STATUSES.includes(order.status)) {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    await tx.order.delete({ where: { id: orderId } });
  });
}
