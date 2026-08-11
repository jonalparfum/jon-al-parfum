"use client";

import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/lib/product-utils";
import { useAdminToast } from "@/components/admin/AdminToast";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
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
  adminLinkDanger,
  adminLoading,
  adminMuted,
  adminOrderStatus,
  adminSelect,
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
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

const statusLabels: Record<string, string> = {
  ALL: "Todos",
  PAID: "Pagado",
  PROCESSING: "Procesando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export default function AdminOrdersPage() {
  const { showToast } = useAdminToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      const err = await res.json().catch(() => ({}));
      showToast(
        (err as { error?: string }).error || "Error al actualizar",
        "error"
      );
    }
  };

  const handleDelete = async (order: Order) => {
    const label = order.user.name || order.user.email;
    if (
      !confirm(
        `¿Eliminar el pedido de "${label}"?\n\nSe devolverá el inventario si ya se había descontado.`
      )
    ) {
      return;
    }

    setDeletingId(order.id);
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      showToast("Pedido eliminado");
    } else {
      const err = await res.json().catch(() => ({}));
      showToast(
        (err as { error?: string }).error || "No se pudo eliminar el pedido",
        "error"
      );
    }
    setDeletingId(null);
  };

  if (loading) return <p className={adminLoading}>Cargando pedidos...</p>;

  return (
    <div>
      <AdminPageHeader
        title="Pedidos"
        subtitle={`${filtered.length} pedido${filtered.length === 1 ? "" : "s"} pagado${filtered.length === 1 ? "" : "s"}`}
      />

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
          <p className="text-charcoal/70">
            {orders.length === 0
              ? "No hay pedidos pagados todavía."
              : "Ningún pedido coincide con los filtros."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <article key={order.id} className={adminCard}>
              <div className="flex flex-wrap justify-between gap-4 mb-4">
                <div>
                  <p className="font-medium text-charcoal text-lg">
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
                    className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border font-medium ${
                      adminOrderStatus[order.status] || "bg-stone-100 text-charcoal border-stone-200"
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
                  <button
                    type="button"
                    onClick={() => handleDelete(order)}
                    disabled={deletingId === order.id}
                    className={adminLinkDanger}
                  >
                    {deletingId === order.id ? "Eliminando…" : "Eliminar"}
                  </button>
                </div>
              </div>
              <ul className="space-y-2 pt-3 border-t border-stone-200">
                {order.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex justify-between text-sm text-charcoal/70"
                  >
                    <span>
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="text-charcoal font-medium">
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
