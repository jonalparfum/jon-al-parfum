"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/product-utils";
import {
  adminInput,
  adminLoading,
  adminMuted,
  adminPageTitle,
  adminPanelPadding,
} from "@/lib/admin-styles";

type Order = {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  user: { name: string | null; email: string };
  items: {
    quantity: number;
    price: number;
    product: { name: string; image: string };
  }[];
};

const statuses = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  PROCESSING: "Procesando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then(setOrders)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  };

  if (loading) return <p className={adminLoading}>Cargando pedidos...</p>;

  return (
    <div>
      <h1 className={`${adminPageTitle} mb-6`}>Pedidos</h1>

      {orders.length === 0 ? (
        <p className={adminMuted}>No hay pedidos todavía.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className={adminPanelPadding}>
              <div className="flex flex-wrap justify-between gap-4 mb-4">
                <div>
                  <p className="font-medium text-cream">
                    {order.user.name || order.user.email}
                  </p>
                  <p className={adminMuted}>
                    {new Date(order.createdAt).toLocaleString("es-ES")}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-lg text-gold">
                    {formatPrice(order.total)}
                  </span>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className={adminInput}
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {statusLabels[s]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <ul className="space-y-2">
                {order.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex justify-between text-sm text-cream/70"
                  >
                    <span>
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="text-cream">
                      {formatPrice(item.price * item.quantity)}
                    </span>
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
