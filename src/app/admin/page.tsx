import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/product-utils";
import DownloadReportButton from "@/components/admin/DownloadReportButton";
import {
  adminLink,
  adminMuted,
  adminPageTitle,
  adminPanelPadding,
  adminSectionTitle,
} from "@/lib/admin-styles";

export default async function AdminDashboard() {
  const recentOrders = await prisma.order.findMany({
    take: 5,
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const lowStock = await prisma.product.findMany({
    where: { stock: { lte: 10 }, active: true },
    take: 5,
    orderBy: { stock: "asc" },
  });

  return (
    <div>
      <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
        <div>
          <h1 className={adminPageTitle}>Resumen</h1>
          <p className={`${adminMuted} mt-2`}>
            Vista general de ventas, stock y operaciones.
          </p>
        </div>
        <DownloadReportButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className={adminPanelPadding}>
          <h2 className={adminSectionTitle}>Pedidos recientes</h2>
          {recentOrders.length === 0 ? (
            <p className={adminMuted}>No hay pedidos aún.</p>
          ) : (
            <ul className="space-y-3">
              {recentOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex justify-between items-center text-sm border-b border-gold/10 pb-3"
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
          <Link href="/admin/pedidos" className={`inline-block mt-4 ${adminLink}`}>
            Ver todos →
          </Link>
        </section>

        <section className={adminPanelPadding}>
          <h2 className={adminSectionTitle}>Stock bajo</h2>
          {lowStock.length === 0 ? (
            <p className={adminMuted}>Todo el stock está bien.</p>
          ) : (
            <ul className="space-y-3">
              {lowStock.map((product) => (
                <li
                  key={product.id}
                  className="flex justify-between items-center text-sm border-b border-gold/10 pb-3"
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
            className={`inline-block mt-4 ${adminLink}`}
          >
            Gestionar productos →
          </Link>
        </section>
      </div>
    </div>
  );
}
