"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/products";
import ProductImage from "@/components/ProductImage";

export default function CartDrawer() {
  const { data: session } = useSession();
  const router = useRouter();
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
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleCheckout = async () => {
    if (!session) {
      closeCart();
      router.push("/login?callbackUrl=/tienda");
      return;
    }

    setCheckingOut(true);
    setError("");

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map(({ product, quantity }) => ({
          productId: product.id,
          quantity,
        })),
      }),
    });

    const data = await res.json();

    if (res.ok && data.url) {
      window.location.href = data.url;
    } else {
      setError(data.error || "Error al procesar el pago");
      setCheckingOut(false);
    }
  };

  return (
    <>
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

        {items.length === 0 ? (
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
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex gap-4">
                  <ProductImage
                    src={product.image}
                    alt={product.name}
                    category={product.category}
                    className="w-20 h-24 flex-shrink-0 rounded-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-sm truncate">{product.name}</h3>
                    <p className="text-xs text-cream/50 mt-0.5">{product.size}</p>
                    <p className="text-sm font-medium mt-1">{formatPrice(product.price)}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-7 h-7 border border-gold/20 flex items-center justify-center hover:border-gold transition-colors"
                        aria-label="Reducir cantidad"
                      >
                        −
                      </button>
                      <span className="text-sm w-4 text-center">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="w-7 h-7 border border-gold/20 flex items-center justify-center hover:border-gold transition-colors"
                        aria-label="Aumentar cantidad"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(product.id)}
                        className="ml-auto text-xs text-cream/40 hover:text-red-400 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-gold/10 p-6 space-y-4">
              {error && (
                <p className="text-red-400 text-sm text-center bg-red-950/50 border border-red-900/50 py-2 rounded">
                  {error}
                </p>
              )}
              <div className="flex justify-between text-lg">
                <span>Total</span>
                <span className="font-medium">{formatPrice(totalPrice)}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="w-full bg-gold text-luxury-black py-4 text-sm uppercase tracking-widest hover:bg-gold-light transition-colors disabled:opacity-50 font-medium"
              >
                {checkingOut
                  ? "Redirigiendo..."
                  : session
                    ? "Pagar con Stripe"
                    : "Iniciar sesión para pagar"}
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
