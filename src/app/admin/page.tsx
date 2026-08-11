import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/product-utils";
import DownloadReportButton from "@/components/admin/DownloadReportButton";
import {
  adminCard,
  adminLink,
  adminMuted,
  adminPageTitle,
  adminSectionTitle,
  adminStatLabel,
  adminSubtitle,
} from "@/lib/admin-styles";

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
      <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
        <div>
          <h1 className={adminPageTitle}>Resumen</h1>
          <p className={adminSubtitle}>
            Vista general de ventas, stock y operaciones del catálogo.
          </p>
        </div>
        <DownloadReportButton />
      </div>

      {pendingOrders > 0 && (
        <Link
          href="/admin/pedidos"
          className="block mb-6 p-4 rounded-xl border border-amber-700/30 bg-amber-950/20 hover:border-amber-600/40 transition-colors"
        >
          <p className={adminStatLabel}>Atención</p>
          <p className="text-amber-200 mt-1">
            {pendingOrders} pedido{pendingOrders === 1 ? "" : "s"} pendiente
            {pendingOrders === 1 ? "" : "s"} de pago
          </p>
        </Link>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className={adminCard}>
          <h2 className={adminSectionTitle}>Pedidos recientes</h2>
          <p className={`${adminMuted} mb-4`}>Últimas 5 órdenes</p>
          {recentOrders.length === 0 ? (
            <p className={adminMuted}>No hay pedidos aún.</p>
          ) : (
            <ul className="space-y-3">
              {recentOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex justify-between items-center text-sm border-b border-gold/10 pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium text-cream">
                      {order.user.name || order.user.email}
                    </p>
                    <p className={adminMuted}>
                      {order._count.items} artículo(s) · {order.status}
                    </p>
                  </div>
                  <span className="font-medium text-gold">
                    {formatPrice(order.total)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/pedidos" className={`inline-block mt-5 ${adminLink}`}>
            Ver todos los pedidos →
          </Link>
        </section>

        <section className={adminCard}>
          <h2 className={adminSectionTitle}>Stock bajo</h2>
          <p className={`${adminMuted} mb-4`}>Productos con ≤ 10 unidades</p>
          {lowStock.length === 0 ? (
            <p className={adminMuted}>Todo el stock está bien.</p>
          ) : (
            <ul className="space-y-3">
              {lowStock.map((product) => (
                <li
                  key={product.id}
                  className="flex justify-between items-center text-sm border-b border-gold/10 pb-3 last:border-0"
                >
                  <Link
                    href={`/admin/productos/${product.id}`}
                    className="font-medium text-cream hover:text-gold transition-colors"
                  >
                    {product.name}
                  </Link>
                  <span className="text-red-400 font-medium">
                    {product.stock} uds.
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/admin/productos"
            className={`inline-block mt-5 ${adminLink}`}
          >
            Gestionar productos →
          </Link>
        </section>
      </div>
    </div>
  );
}
