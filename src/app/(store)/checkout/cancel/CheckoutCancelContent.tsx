"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function CheckoutCancelContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!sessionId || cancelledRef.current) return;
    cancelledRef.current = true;

    fetch("/api/checkout/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    }).catch(() => {});
  }, [sessionId]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="font-serif text-3xl mb-4">Pago cancelado</h1>
      <p className="text-charcoal/60 mb-8 max-w-md">
        No se ha realizado ningún cargo. Tu carrito sigue disponible para cuando
        quieras continuar.
      </p>
      <Link
        href="/tienda"
        className="bg-charcoal text-white px-6 py-3 text-sm uppercase tracking-wider hover:bg-gold transition-colors"
      >
        Volver a la tienda
      </Link>
    </div>
  );
}
