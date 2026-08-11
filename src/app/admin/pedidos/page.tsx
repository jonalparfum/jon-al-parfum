"use client";

import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/lib/product-utils";
import { useAdminToast } from "@/components/admin/AdminToast";
import { fetchJsonArray } from "@/lib/admin-fetch";
import {
  adminCard,
  adminEmptyState,
  adminFilterGroup,
  adminFilterPill,
  adminFilterPillActive,
  adminFilterPillInactive,
  adminInput,
  adminLabel,
  adminLoading,
  adminMuted,
  adminPageTitle,
  adminSelect,
  adminSubtitle,
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
  "ALL",
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

const statusLabels: Record<string, string> = {
  ALL: "Todos",
  PENDING: "Pendiente",
  PAID: "Pagado",
  PROCESSING: "Procesando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

const statusColors: Record<string, string> = {
  PENDING: "text-amber-300 border-amber-700/40 bg-amber-950/30",
  PAID: "text-green-300 border-green-700/40 bg-green-950/30",
  PROCESSING: "text-blue-300 border-blue-700/40 bg-blue-950/30",
  SHIPPED: "text-purple-300 border-purple-700/40 bg-purple-950/30",
  DELIVERED: "text-emerald-300 border-emerald-700/40 bg-emerald-950/30",
  CANCELLED: "text-red-300 border-red-700/40 bg-red-950/30",
};

export default function AdminOrdersPage() {
  const { showToast } = useAdminToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const load = () => {
    fetchJsonArray<Order>("/api/admin/orders").then(({ ok, data, error }) => {
      setOrders(data);
      if (!ok && error) showToast(error, "error");
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = [...orders];
    if (statusFilter !== "ALL") {
      list = list.filter((o) => o.status === statusFilter);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (o) =>
          o.user.email.toLowerCase().includes(q) ||
          (o.user.name?.toLowerCase().includes(q) ?? false)
      );
    }
    return list;
  }, [orders, statusFilter, search]);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      showToast("Estado actualizado");
      load();
    } else {
      showToast("Error al actualizar", "error");
    }
  };

  if (loading) return <p className={adminLoading}>Cargando pedidos...</p>;

  return (
    <div>
      <div className="mb-6">
        <h1 className={adminPageTitle}>Pedidos</h1>
        <p className={adminSubtitle}>
          {filtered.length} de {orders.length} pedidos
        </p>
      </div>

      <div className="mb-6 max-w-md">
        <label className={adminLabel}>Buscar cliente</label>
        <input
          type="search"
          placeholder="Nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={adminInput}
        />
      </div>

      <div className={`${adminFilterGroup} mb-6`}>
        {statuses.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`${adminFilterPill} ${
              statusFilter === s
                ? adminFilterPillActive
                : adminFilterPillInactive
            }`}
          >
            {statusLabels[s]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className={adminEmptyState}>
          <p className="text-cream/70">
            {orders.length === 0
              ? "No hay pedidos todavía."
              : "Ningún pedido coincide con los filtros."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <article key={order.id} className={adminCard}>
              <div className="flex flex-wrap justify-between gap-4 mb-4">
                <div>
                  <p className="font-medium text-cream text-lg">
                    {order.user.name || order.user.email}
                  </p>
                  {order.user.name && (
                    <p className={adminMuted}>{order.user.email}</p>
                  )}
                  <p className={`${adminMuted} mt-1`}>
                    {new Date(order.createdAt).toLocaleString("es-MX", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                      statusColors[order.status] || ""
                    }`}
                  >
                    {statusLabels[order.status]}
                  </span>
                  <span className="font-semibold text-xl text-gold">
                    {formatPrice(order.total)}
                  </span>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className={adminSelect}
                  >
                    {statuses
                      .filter((s) => s !== "ALL")
                      .map((s) => (
                        <option key={s} value={s}>
                          {statusLabels[s]}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <ul className="space-y-2 pt-3 border-t border-gold/10">
                {order.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex justify-between text-sm text-cream/75"
                  >
                    <span>
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="text-cream font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
