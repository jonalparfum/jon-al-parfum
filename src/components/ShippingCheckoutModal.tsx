"use client";

import { useEffect, useState } from "react";
import ShippingAddressForm from "@/components/ShippingAddressForm";
import {
  emptyShipping,
  validateShipping,
  type ShippingInput,
} from "@/lib/shipping";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

type ShippingCheckoutModalProps = {
  onClose: () => void;
  onConfirm: (shipping: ShippingInput) => Promise<void>;
};

export default function ShippingCheckoutModal({
  onClose,
  onConfirm,
}: ShippingCheckoutModalProps) {
  const [shipping, setShipping] = useState<ShippingInput>(emptyShipping());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    lockScroll();
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data?.profile) {
          setShipping({
            shippingName: data.profile.shippingName || data.profile.name || "",
            shippingPhone: data.profile.shippingPhone || "",
            shippingStreet: data.profile.shippingStreet || "",
            shippingColony: data.profile.shippingColony || "",
            shippingCity: data.profile.shippingCity || "",
            shippingState: data.profile.shippingState || "",
            shippingZip: data.profile.shippingZip || "",
            shippingNotes: data.profile.shippingNotes || "",
          });
        }
      })
      .finally(() => setLoading(false));

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      unlockScroll();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateShipping(shipping);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onConfirm(shipping);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar envío");
      setSaving(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-[60]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto bg-luxury-panel border border-gold/20 z-[70] rounded-sm shadow-2xl text-cream max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-label="Datos para envío del paquete"
      >
        <div className="flex items-center justify-between p-5 border-b border-gold/10">
          <h2 className="font-display text-lg">Datos para envío del paquete</h2>
          <button
            onClick={onClose}
            className="p-2 hover:text-gold transition-colors"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {loading ? (
            <p className="text-sm text-cream/50">Cargando tus datos...</p>
          ) : (
            <ShippingAddressForm
              value={shipping}
              onChange={setShipping}
              showIntro
            />
          )}

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 border border-gold/20 py-3 text-sm uppercase tracking-wider hover:border-gold transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || loading}
              className="flex-1 bg-gold text-luxury-black py-3 text-sm uppercase tracking-widest hover:bg-gold-light transition-colors disabled:opacity-50 font-medium"
            >
              {saving ? "Guardando..." : "Continuar al pago"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
