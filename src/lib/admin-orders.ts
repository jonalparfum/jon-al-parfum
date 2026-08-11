import type { Prisma } from "@prisma/client";

/** Pedidos con pago confirmado: Stripe completado o transferencia aprobada. */
export const paidOrderWhere: Prisma.OrderWhereInput = {
  status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
  OR: [
    { paymentMethod: "STRIPE" },
    {
      paymentMethod: "BANK_TRANSFER",
      paymentProofStatus: "APPROVED",
    },
  ],
};

/** Pedidos pagados que aún no se han empezado a procesar. */
export const newPaidOrderWhere: Prisma.OrderWhereInput = {
  status: "PAID",
  OR: [
    { paymentMethod: "STRIPE" },
    {
      paymentMethod: "BANK_TRANSFER",
      paymentProofStatus: "APPROVED",
    },
  ],
};
