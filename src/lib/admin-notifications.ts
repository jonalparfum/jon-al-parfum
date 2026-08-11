import { prisma } from "@/lib/prisma";
import { newPaidOrderWhere } from "@/lib/admin-orders";

const NEW_USER_DAYS = 7;

export type AdminBadgeCounts = {
  pedidos: number;
  comprobantes: number;
  usuarios: number;
};

export async function getAdminBadgeCounts(): Promise<AdminBadgeCounts> {
  const since = new Date();
  since.setDate(since.getDate() - NEW_USER_DAYS);

  const [newPaidOrders, pendingProofs, newUsers] = await Promise.all([
    prisma.order.count({ where: newPaidOrderWhere }),
    prisma.order.count({
      where: {
        paymentMethod: "BANK_TRANSFER",
        paymentProofStatus: "PENDING_REVIEW",
      },
    }),
    prisma.user.count({
      where: {
        role: "USER",
        createdAt: { gte: since },
      },
    }),
  ]);

  return {
    pedidos: newPaidOrders,
    comprobantes: pendingProofs,
    usuarios: newUsers,
  };
}
