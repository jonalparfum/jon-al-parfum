import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/product-utils";
import DownloadReportButton from "@/components/admin/DownloadReportButton";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import {
  adminAlertWarning,
  adminCard,
  adminChipGold,
  adminLink,
  adminMuted,
  adminSectionTitle,
  adminStatLabel,
} from "@/lib/admin-styles";

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  PROCESSING: "Procesando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export default async function AdminDashboard() {
  const [recentOrders, lowStock, pendingOrders] = await Promise.all([
    prisma.order.findMany({
      take: 5,
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { stock: { lte: 10 }, active: true },
      take: 5,
      orderBy: { stock: "asc" },
    }),
    prisma.order.count({ where: { status: "PENDING" } }),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Resumen"
        subtitle="Vista general de ventas, inventario y operaciones de tu tienda."
      >
        <DownloadReportButton />
      </AdminPageHeader>

      {pendingOrders > 0 && (
        <Link href="/admin/pedidos" className={`${adminAlertWarning} mb-8`}>
          <p className={adminStatLabel}>Requiere atención</p>
          <p className="font-medium mt-1">
            {pendingOrders} pedido{pendingOrders === 1 ? "" : "s"} pendiente
            {pendingOrders === 1 ? "" : "s"} de pago →
          </p>
        </Link>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className={adminCard}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className={adminSectionTitle}>Pedidos recientes</h2>
              <p className={`${adminMuted} mt-1`}>Últimas 5 órdenes</p>
            </div>
            <span className={adminChipGold}>{recentOrders.length}</span>
          </div>
          {recentOrders.length === 0 ? (
            <p className={adminMuted}>No hay pedidos aún.</p>
          ) : (
            <ul className="space-y-0 divide-y divide-stone-100">
              {recentOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex justify-between items-center gap-4 py-3.5 first:pt-0"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-charcoal truncate">
                      {order.user.name || order.user.email}
                    </p>
                    <p className={`${adminMuted} text-xs mt-0.5`}>
                      {order._count.items} artículo(s) ·{" "}
                      {statusLabels[order.status] ?? order.status}
                    </p>
                  </div>
                  <span className="font-semibold text-gold-dark shrink-0">
                    {formatPrice(order.total)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/pedidos" className={`inline-block mt-6 ${adminLink}`}>
            Ver todos los pedidos →
          </Link>
        </section>

        <section className={adminCard}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className={adminSectionTitle}>Stock bajo</h2>
              <p className={`${adminMuted} mt-1`}>Productos con ≤ 10 unidades</p>
            </div>
            {lowStock.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-800 border border-red-200">
                {lowStock.length}
              </span>
            )}
          </div>
          {lowStock.length === 0 ? (
            <p className={adminMuted}>Todo el stock está en buen nivel.</p>
          ) : (
            <ul className="space-y-0 divide-y divide-stone-100">
              {lowStock.map((product) => (
                <li
                  key={product.id}
                  className="flex justify-between items-center gap-4 py-3.5 first:pt-0"
                >
                  <Link
                    href={`/admin/productos/${product.id}`}
                    className="font-medium text-charcoal hover:text-gold-dark transition-colors truncate"
                  >
                    {product.name}
                  </Link>
                  <span className="text-red-600 font-semibold text-sm shrink-0">
                    {product.stock} uds.
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/admin/productos"
            className={`inline-block mt-6 ${adminLink}`}
          >
            Gestionar productos →
          </Link>
        </section>
      </div>
    </div>
  );
}
