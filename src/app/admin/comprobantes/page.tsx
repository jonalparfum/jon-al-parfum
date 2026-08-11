"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/product-utils";
import { useAdminToast } from "@/components/admin/AdminToast";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { fetchJsonArray } from "@/lib/admin-fetch";
import {
  adminBtnDanger,
  adminBtnGhost,
  adminBtnSuccess,
  adminCard,
  adminEmptyState,
  adminInput,
  adminLabel,
  adminLoading,
  adminMuted,
  adminPanelPadding,
} from "@/lib/admin-styles";

type PaymentProofOrder = {
  id: string;
  total: number;
  paymentProofUrl: string;
  createdAt: string;
  user: { name: string | null; email: string };
  bankAccount: {
    bankName: string;
    accountHolder: string;
  } | null;
  items: {
    quantity: number;
    price: number;
    product: { name: string };
  }[];
};

function isPdfUrl(url: string) {
  return url.toLowerCase().includes(".pdf");
}

export default function AdminPaymentProofsPage() {
  const { showToast } = useAdminToast();
  const [orders, setOrders] = useState<PaymentProofOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [processing, setProcessing] = useState(false);

  const load = () => {
    fetchJsonArray<PaymentProofOrder>("/api/admin/payment-proofs").then(
      ({ ok, data, error }) => {
        setOrders(data);
        if (!selectedId && data[0]) setSelectedId(data[0].id);
        if (!ok && error) showToast(error, "error");
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = orders.find((o) => o.id === selectedId) ?? orders[0];

  const handleAction = async (action: "approve" | "reject") => {
    if (!selected) return;

    const confirmMsg =
      action === "approve"
        ? "¿Aprobar este comprobante? Se descontará el inventario."
        : "¿Rechazar este comprobante?";

    if (!confirm(confirmMsg)) return;

    setProcessing(true);

    const res = await fetch(`/api/admin/payment-proofs/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note: note.trim() || undefined }),
    });

    const data = await res.json();

    if (res.ok) {
      showToast(
        action === "approve" ? "Comprobante aprobado" : "Comprobante rechazado",
        "success"
      );
      setNote("");
      setSelectedId(null);
      setLoading(true);
      load();
    } else {
      showToast(data.error || "Error al procesar", "error");
    }

    setProcessing(false);
  };

  if (loading) {
    return <p className={adminLoading}>Cargando comprobantes...</p>;
  }

  return (
    <div>
      <AdminPageHeader
        title="Verificar comprobantes"
        subtitle="Revisa transferencias pendientes, aprueba o rechaza el pago."
      />

      {orders.length === 0 ? (
        <div className={adminEmptyState}>
          <p>No hay comprobantes pendientes de revisión.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-2">
            {orders.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => setSelectedId(order.id)}
                className={`${adminCard} ${adminPanelPadding} w-full text-left transition-colors ${
                  selected?.id === order.id
                    ? "ring-2 ring-gold/40"
                    : "hover:bg-stone-50"
                }`}
              >
                <p className="font-medium text-charcoal truncate">
                  {order.user.name || order.user.email}
                </p>
                <p className={`${adminMuted} text-xs truncate`}>
                  {order.user.email}
                </p>
                <p className="text-sm text-gold-dark mt-1">
                  {formatPrice(order.total)}
                </p>
                <p className={`${adminMuted} text-xs mt-1`}>
                  {new Date(order.createdAt).toLocaleString("es-MX")}
                </p>
              </button>
            ))}
          </div>

          {selected && (
            <div className={`${adminCard} ${adminPanelPadding} lg:col-span-2 space-y-5`}>
              <div>
                <h3 className="font-semibold text-charcoal mb-2">
                  Pedido #{selected.id.slice(-8)}
                </h3>
                <p className="text-sm text-charcoal/70">
                  Cliente: {selected.user.name || "—"} ({selected.user.email})
                </p>
                <p className="text-sm text-charcoal/70">
                  Total: {formatPrice(selected.total)}
                </p>
                {selected.bankAccount && (
                  <p className={`${adminMuted} text-xs mt-1`}>
                    Cuenta: {selected.bankAccount.bankName} —{" "}
                    {selected.bankAccount.accountHolder}
                  </p>
                )}
              </div>

              <div>
                <p className={adminLabel}>Productos</p>
                <ul className="text-sm text-charcoal/80 space-y-1 mt-1">
                  {selected.items.map((item, i) => (
                    <li key={i}>
                      {item.product.name} × {item.quantity} —{" "}
                      {formatPrice(item.price * item.quantity)}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className={adminLabel}>Comprobante</p>
                <div className="mt-2 border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
                  {isPdfUrl(selected.paymentProofUrl) ? (
                    <div className="p-4 space-y-3">
                      <p className="text-sm text-charcoal/70">
                        Archivo PDF adjunto
                      </p>
                      <a
                        href={selected.paymentProofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gold-dark hover:underline font-medium"
                      >
                        Abrir PDF en nueva pestaña →
                      </a>
                      <iframe
                        src={selected.paymentProofUrl}
                        title="Comprobante PDF"
                        className="w-full h-96 border border-stone-200 rounded"
                      />
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selected.paymentProofUrl}
                      alt="Comprobante de pago"
                      className="w-full max-h-[480px] object-contain"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className={adminLabel}>Nota (opcional)</label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className={adminInput}
                  placeholder="Motivo del rechazo o comentario interno"
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => handleAction("approve")}
                  disabled={processing}
                  className={adminBtnSuccess}
                >
                  Aceptar y descontar inventario
                </button>
                <button
                  onClick={() => handleAction("reject")}
                  disabled={processing}
                  className={adminBtnDanger}
                >
                  Rechazar
                </button>
                <a
                  href={selected.paymentProofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={adminBtnGhost}
                >
                  Descargar
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
