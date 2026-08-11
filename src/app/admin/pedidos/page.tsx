"use client";

import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/lib/product-utils";
import { formatShippingAddress, resolveOrderShippingDisplay } from "@/lib/shipping";
import { useAdminToast } from "@/components/admin/AdminToast";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { fetchJsonArray } from "@/lib/admin-fetch";
import {
  adminBtnGhost,
  adminBtnSuccess,
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
  shippingName: string | null;
  shippingPhone: string | null;
  shippingStreet: string | null;
  shippingColony: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingZip: string | null;
  shippingNotes: string | null;
  shippingAddress: string | null;
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
] as const;

const statusLabels: Record<string, string> = {
  ALL: "Todos",
  PAID: "Pagado",
  PROCESSING: "Procesando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
};

export default function AdminOrdersPage() {
  const { showToast } = useAdminToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusDrafts, setStatusDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const getDraftStatus = (order: Order) =>
    statusDrafts[order.id] ?? order.status;

  const hasUnsavedStatus = (order: Order) =>
    getDraftStatus(order) !== order.status;

  const setDraftStatus = (orderId: string, status: string) => {
    setStatusDrafts((prev) => ({ ...prev, [orderId]: status }));
  };

  const cancelStatusDraft = (orderId: string) => {
    setStatusDrafts((prev) => {
      const next = { ...prev };
      delete next[orderId];
      return next;
    });
  };

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

  const saveStatus = async (order: Order) => {
    const status = getDraftStatus(order);
    if (status === order.status) return;

    setSavingId(order.id);
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status } : o))
      );
      cancelStatusDraft(order.id);
      showToast("Estado guardado");
    } else {
      const err = await res.json().catch(() => ({}));
      showToast(
        (err as { error?: string }).error || "Error al guardar",
        "error"
      );
    }
    setSavingId(null);
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
                <div className="flex flex-wrap items-end gap-3">
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
                  <div className="flex flex-wrap items-end gap-2">
                    <div>
                      <label
                        htmlFor={`order-status-${order.id}`}
                        className="block text-[10px] uppercase tracking-wider text-charcoal/50 mb-1"
                      >
                        Cambiar estado
                      </label>
                      <select
                        id={`order-status-${order.id}`}
                        value={getDraftStatus(order)}
                        onChange={(e) =>
                          setDraftStatus(order.id, e.target.value)
                        }
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
                    {hasUnsavedStatus(order) && (
                      <>
                        <button
                          type="button"
                          onClick={() => saveStatus(order)}
                          disabled={savingId === order.id}
                          className={adminBtnSuccess}
                        >
                          {savingId === order.id ? "Guardando…" : "Guardar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => cancelStatusDraft(order.id)}
                          disabled={savingId === order.id}
                          className={adminBtnGhost}
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                  </div>
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
              {(order.shippingAddress || order.shippingStreet) && (
                <div className="mb-4 p-3 bg-stone-50 rounded-lg border border-stone-200 text-sm text-charcoal/80">
                  <p className="text-[10px] uppercase tracking-wider text-charcoal/50 mb-1">
                    Envío
                  </p>
                  {order.shippingName && (
                    <p className="font-medium text-charcoal">{order.shippingName}</p>
                  )}
                  <p>
                    {resolveOrderShippingDisplay(order) ||
                      formatShippingAddress({
                        shippingStreet: order.shippingStreet ?? undefined,
                        shippingColony: order.shippingColony ?? undefined,
                        shippingCity: order.shippingCity ?? undefined,
                        shippingState: order.shippingState ?? undefined,
                        shippingZip: order.shippingZip ?? undefined,
                        shippingPhone: order.shippingPhone ?? undefined,
                        shippingNotes: order.shippingNotes ?? undefined,
                      })}
                  </p>
                </div>
              )}
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
