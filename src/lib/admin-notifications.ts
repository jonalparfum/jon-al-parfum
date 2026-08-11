import { prisma } from "@/lib/prisma";
import type { AdminNotifyModule } from "@prisma/client";
import { newPaidOrderWhere } from "@/lib/admin-orders";

const NEW_USER_DAYS = 7;

export type AdminBadgeModule = "pedidos" | "comprobantes" | "usuarios";

export type AdminBadgeCounts = {
  pedidos: number;
  comprobantes: number;
  usuarios: number;
};

const MODULE_MAP: Record<AdminBadgeModule, AdminNotifyModule> = {
  pedidos: "PEDIDOS",
  comprobantes: "COMPROBANTES",
  usuarios: "USUARIOS",
};

export function toAdminNotifyModule(module: AdminBadgeModule): AdminNotifyModule {
  return MODULE_MAP[module];
}

export async function markAdminModuleSeen(
  userId: string,
  module: AdminBadgeModule
) {
  const notifyModule = toAdminNotifyModule(module);
  await prisma.adminModuleSeen.upsert({
    where: {
      userId_module: { userId, module: notifyModule },
    },
    create: { userId, module: notifyModule },
    update: { seenAt: new Date() },
  });
}

async function getSeenMap(userId: string) {
  const rows = await prisma.adminModuleSeen.findMany({
    where: { userId },
    select: { module: true, seenAt: true },
  });
  return new Map(rows.map((r) => [r.module, r.seenAt]));
}

export async function getAdminBadgeCounts(
  userId: string
): Promise<AdminBadgeCounts> {
  const sinceUsers = new Date();
  sinceUsers.setDate(sinceUsers.getDate() - NEW_USER_DAYS);

  const seen = await getSeenMap(userId);
  const pedidosSeen = seen.get("PEDIDOS");
  const comprobantesSeen = seen.get("COMPROBANTES");
  const usuariosSeen = seen.get("USUARIOS");

  const [newPaidOrders, pendingProofs, newUsers] = await Promise.all([
    prisma.order.count({
      where: {
        ...newPaidOrderWhere,
        ...(pedidosSeen ? { updatedAt: { gt: pedidosSeen } } : {}),
      },
    }),
    prisma.order.count({
      where: {
        paymentMethod: "BANK_TRANSFER",
        paymentProofStatus: "PENDING_REVIEW",
        ...(comprobantesSeen ? { updatedAt: { gt: comprobantesSeen } } : {}),
      },
    }),
    prisma.user.count({
      where: {
        role: "USER",
        createdAt: {
          gt: usuariosSeen ?? sinceUsers,
        },
      },
    }),
  ]);

  return {
    pedidos: newPaidOrders,
    comprobantes: pendingProofs,
    usuarios: newUsers,
  };
}
