"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { formatPrice } from "@/lib/product-utils";

type Order = {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: {
    quantity: number;
    price: number;
    product: { name: string; slug: string };
  }[];
};

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente de pago",
  PAID: "Pagado",
  PROCESSING: "En preparación",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export default function AccountPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then(setOrders);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl mb-2">Mi cuenta</h1>
      <p className="text-charcoal/60 mb-8">
        {session?.user?.name || session?.user?.email}
      </p>

      <div className="flex gap-4 mb-8">
        {session?.user?.role === "ADMIN" && (
          <Link
            href="/admin"
            className="text-sm text-gold hover:text-charcoal border border-gold px-4 py-2"
          >
            Panel de administración
          </Link>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm text-charcoal/60 hover:text-charcoal"
        >
          Cerrar sesión
        </button>
      </div>

      <h2 className="font-serif text-xl mb-4">Mis pedidos</h2>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-cream rounded-lg">
          <p className="text-charcoal/60 mb-4">Aún no has realizado ningún pedido.</p>
          <Link
            href="/tienda"
            className="text-sm uppercase tracking-wider text-gold hover:text-charcoal"
          >
            Explorar tienda
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-gold/10 rounded-lg p-6"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm text-charcoal/60">
                    {new Date(order.createdAt).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="font-medium mt-1">
                    {statusLabels[order.status] || order.status}
                  </p>
                </div>
                <span className="font-semibold">{formatPrice(order.total)}</span>
              </div>
              <ul className="text-sm text-charcoal/70 space-y-1">
                {order.items.map((item, i) => (
                  <li key={i}>
                    {item.product.name} × {item.quantity}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
