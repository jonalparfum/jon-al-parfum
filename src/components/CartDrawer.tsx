"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { cartItemKey } from "@/types";
import { formatPrice } from "@/lib/product-utils";
import { STRIPE_MIN_MXN } from "@/lib/stripe-limits";
import ProductImage from "@/components/ProductImage";
import TransferCheckoutModal from "@/components/TransferCheckoutModal";
import ShippingCheckoutModal from "@/components/ShippingCheckoutModal";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
import type { ShippingInput } from "@/lib/shipping";

type BankAccount = {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string | null;
  clabe: string | null;
  notes: string | null;
};

type TransferSession = {
  orderId: string;
  total: number;
  bankAccounts: BankAccount[];
};

export default function CartDrawer() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    totalPrice,
    clearCart,
  } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [error, setError] = useState("");
  const [transferSession, setTransferSession] = useState<TransferSession | null>(
    null
  );
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [shippingModal, setShippingModal] = useState<"stripe" | "transfer" | null>(
    null
  );

  useEffect(() => {
    closeCart();
  }, [pathname, closeCart]);

  useEffect(() => {
    if (!isOpen) return;
    lockScroll();
    return () => unlockScroll();
  }, [isOpen]);

  const cartPayload = {
    items: items.map(({ product, quantity, variantId }) => ({
      productId: product.id,
      quantity,
      ...(variantId ? { variantId } : {}),
    })),
  };

  const belowStripeMinimum = totalPrice > 0 && totalPrice < STRIPE_MIN_MXN;

  const saveShipping = async (shipping: ShippingInput) => {
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(shipping),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Error al guardar datos de envío");
    }
  };

  const handleShippingConfirm = async (shipping: ShippingInput) => {
    const mode = shippingModal;
    if (!mode) return;

    await saveShipping(shipping);
    setShippingModal(null);

    const payload = { ...cartPayload, shipping };

    if (mode === "stripe") {
      setCheckingOut(true);
      setError("");

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Error al procesar el pago");
        setCheckingOut(false);
      }
    } else {
      setTransferLoading(true);
      setError("");

      const res = await fetch("/api/checkout/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setTransferSession({
          orderId: data.orderId,
          total: data.total,
          bankAccounts: data.bankAccounts,
        });
      } else {
        setError(data.error || "Error al iniciar transferencia");
      }

      setTransferLoading(false);
    }
  };

  const handleStripeCheckout = () => {
    if (!session) {
      closeCart();
      router.push("/login?callbackUrl=/tienda");
      return;
    }
    if (belowStripeMinimum) return;
    setShippingModal("stripe");
  };

  const handleTransferCheckout = () => {
    if (!session) {
      closeCart();
      router.push("/login?callbackUrl=/tienda");
      return;
    }
    setShippingModal("transfer");
  };

  const cancelTransferOrder = async (orderId: string) => {
    await fetch("/api/checkout/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    }).catch(() => {});
  };

  const handleTransferSuccess = () => {
    setTransferSession(null);
    setTransferSuccess(true);
    clearCart();
  };

  if (!isOpen) return null;

  return (
    <>
      {shippingModal && (
        <ShippingCheckoutModal
          onClose={() => setShippingModal(null)}
          onConfirm={handleShippingConfirm}
        />
      )}

      {transferSession && (
        <TransferCheckoutModal
          orderId={transferSession.orderId}
          total={transferSession.total}
          bankAccounts={transferSession.bankAccounts}
          onClose={() => {
            void cancelTransferOrder(transferSession.orderId);
            setTransferSession(null);
          }}
          onSuccess={handleTransferSuccess}
        />
      )}

      <div
        className="fixed inset-0 bg-black/40 z-50 transition-opacity"
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside
        className="fixed right-0 top-0 h-full w-full max-w-md bg-luxury-panel border-l border-gold/10 z-50 shadow-2xl flex flex-col text-cream"
        role="dialog"
        aria-label="Carrito de compras"
      >
        <div className="flex items-center justify-between p-6 border-b border-gold/10">
          <h2 className="font-display text-xl">Tu carrito</h2>
          <button
            onClick={closeCart}
            className="p-2 hover:text-gold transition-colors"
            aria-label="Cerrar carrito"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {transferSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-gold font-display text-lg mb-2">
              Comprobante enviado
            </p>
            <p className="text-cream/60 text-sm mb-6">
              Revisaremos tu transferencia y te confirmaremos por correo.
            </p>
            <button
              onClick={() => {
                setTransferSuccess(false);
                closeCart();
              }}
              className="text-sm uppercase tracking-wider text-gold hover:text-gold-light transition-colors"
            >
              Continuar comprando
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-cream/50 mb-4">Tu carrito está vacío</p>
            <button
              onClick={closeCart}
              className="text-sm uppercase tracking-wider text-gold hover:text-gold-light transition-colors"
            >
              Seguir comprando
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.map((item) => {
                const key = cartItemKey(item);
                return (
                <li key={key} className="flex gap-4">
                  <ProductImage
                    src={item.product.image}
                    alt={item.product.name}
                    category={item.product.category}
                    className="w-20 h-24 flex-shrink-0 rounded-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-sm truncate">{item.product.name}</h3>
                    <p className="text-xs text-cream/50 mt-0.5">
                      {item.variantLabel ?? item.product.size}
                    </p>
                    <p className="text-sm font-medium mt-1">{formatPrice(item.unitPrice)}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => updateQuantity(key, item.quantity - 1)}
                        className="w-7 h-7 border border-gold/20 flex items-center justify-center hover:border-gold transition-colors"
                        aria-label="Reducir cantidad"
                      >
                        −
                      </button>
                      <span className="text-sm w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(key, item.quantity + 1)}
                        className="w-7 h-7 border border-gold/20 flex items-center justify-center hover:border-gold transition-colors"
                        aria-label="Aumentar cantidad"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(key)}
                        className="ml-auto text-xs text-cream/40 hover:text-red-400 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              );
              })}
            </ul>

            <div className="border-t border-gold/10 p-6 space-y-3">
              {error && (
                <p className="text-red-400 text-sm text-center bg-red-950/50 border border-red-900/50 py-2 rounded">
                  {error}
                </p>
              )}
              <div className="flex justify-between text-lg">
                <span>Total</span>
                <span className="font-medium">{formatPrice(totalPrice)}</span>
              </div>
              {belowStripeMinimum && (
                <p className="text-amber-400/90 text-xs text-center">
                  Tarjeta requiere mínimo {formatPrice(STRIPE_MIN_MXN)} (Stripe).
                  Puedes pagar por transferencia.
                </p>
              )}
              <button
                onClick={handleStripeCheckout}
                disabled={checkingOut || transferLoading || belowStripeMinimum}
                className="w-full bg-gold text-luxury-black py-4 text-sm uppercase tracking-widest hover:bg-gold-light transition-colors disabled:opacity-50 font-medium"
              >
                {checkingOut
                  ? "Redirigiendo..."
                  : session
                    ? "Pagar con tarjeta"
                    : "Iniciar sesión para pagar"}
              </button>
              <button
                onClick={handleTransferCheckout}
                disabled={checkingOut || transferLoading}
                className="w-full border border-gold/30 text-cream py-4 text-sm uppercase tracking-widest hover:border-gold hover:text-gold transition-colors disabled:opacity-50"
              >
                {transferLoading ? "Preparando..." : "Hacer transferencia"}
              </button>
              {!session && (
                <p className="text-xs text-center text-cream/40">
                  <Link href="/registro" className="text-gold hover:underline">
                    Crear cuenta
                  </Link>{" "}
                  para comprar
                </p>
              )}
              <button
                onClick={clearCart}
                className="w-full text-sm text-cream/40 hover:text-cream transition-colors"
              >
                Vaciar carrito
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
