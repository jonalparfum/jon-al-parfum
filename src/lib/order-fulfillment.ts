import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";
import { isUselessShippingAddress } from "@/lib/shipping";
import {
  assertOrderItemsInStock,
  decrementOrderItemStock,
  restoreOrderItemStock,
} from "@/lib/order-stock";

function isUselessStripeAddressString(value: string): boolean {
  return isUselessShippingAddress(value);
}

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

    await assertOrderItemsInStock(tx, order.items);

    const hasFormShipping = Boolean(
      order.shippingStreet?.trim() ||
        order.shippingPhone?.trim() ||
        order.shippingCity?.trim()
    );

    const paidData: MarkOrderPaidData = {
      stripePaymentId: data.stripePaymentId,
    };

    if (!hasFormShipping) {
      if (data.shippingName?.trim()) paidData.shippingName = data.shippingName.trim();
      if (data.shippingEmail?.trim()) paidData.shippingEmail = data.shippingEmail.trim();
      if (
        data.shippingAddress?.trim() &&
        !isUselessStripeAddressString(data.shippingAddress)
      ) {
        paidData.shippingAddress = data.shippingAddress.trim();
      }
    }

    await tx.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        ...paidData,
      },
    });

    for (const item of order.items) {
      await decrementOrderItemStock(tx, item);
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
      await restoreOrderItemStock(tx, item);
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

    await assertOrderItemsInStock(tx, order.items);

    await tx.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        paymentProofStatus: "APPROVED",
        paymentProofNote: note ?? null,
      },
    });

    for (const item of order.items) {
      await decrementOrderItemStock(tx, item);
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

/** Elimina pedidos PENDING que no llegaron a pagarse (checkout cancelado o abandonado). */
export async function cancelPendingOrder(params: {
  orderId?: string;
  stripeSessionId?: string;
}) {
  const order = params.orderId
    ? await prisma.order.findUnique({ where: { id: params.orderId } })
    : params.stripeSessionId
      ? await prisma.order.findUnique({
          where: { stripeSessionId: params.stripeSessionId },
        })
      : null;

  if (!order || order.status !== "PENDING") {
    return null;
  }

  if (
    order.paymentMethod === "BANK_TRANSFER" &&
    (order.paymentProofUrl || order.paymentProofStatus === "PENDING_REVIEW")
  ) {
    return null;
  }

  await prisma.order.delete({ where: { id: order.id } });
  return order.id;
}

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
        await restoreOrderItemStock(tx, item);
      }
    }

    await tx.order.delete({ where: { id: orderId } });
  });
}
