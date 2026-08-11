import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/product-utils";

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="font-serif text-xl mb-4">Pedidos recientes</h2>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay pedidos aún.</p>
        ) : (
          <ul className="space-y-3">
            {recentOrders.map((order) => (
              <li
                key={order.id}
                className="flex justify-between items-center text-sm border-b border-gray-50 pb-3"
              >
                <div>
                  <p className="font-medium">
                    {order.user.name || order.user.email}
                  </p>
                  <p className="text-gray-500">
                    {order._count.items} artículo(s) · {order.status}
                  </p>
                </div>
                <span className="font-medium">{formatPrice(order.total)}</span>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/admin/pedidos"
          className="inline-block mt-4 text-sm text-gold hover:text-charcoal"
        >
          Ver todos →
        </Link>
      </section>

      <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="font-serif text-xl mb-4">Stock bajo</h2>
        {lowStock.length === 0 ? (
          <p className="text-gray-500 text-sm">Todo el stock está bien.</p>
        ) : (
          <ul className="space-y-3">
            {lowStock.map((product) => (
              <li
                key={product.id}
                className="flex justify-between items-center text-sm border-b border-gray-50 pb-3"
              >
                <Link
                  href={`/admin/productos/${product.id}`}
                  className="font-medium hover:text-gold"
                >
                  {product.name}
                </Link>
                <span className="text-red-600 font-medium">
                  {product.stock} uds.
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/admin/productos"
          className="inline-block mt-4 text-sm text-gold hover:text-charcoal"
        >
          Gestionar productos →
        </Link>
      </section>
    </div>
  );
}
