"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "jonalparfum-cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY);
    if (!accepted) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
    >
      <div className="max-w-4xl mx-auto bg-luxury-panel text-cream border border-gold/20 shadow-[0_-8px_40px_rgba(0,0,0,0.5)] px-5 py-4 md:px-8 md:py-5 flex flex-col md:flex-row md:items-center gap-4 md:gap-6 backdrop-blur-md">
        <p className="text-sm text-cream/80 leading-relaxed flex-1">
          Utilizamos cookies propias y de terceros para mejorar tu experiencia,
          analizar el tráfico y personalizar el contenido. Al hacer clic en
          &quot;Aceptar&quot;, consientes su uso conforme a nuestra política de
          cookies.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <Link
            href="/politica-cookies"
            className="text-center text-xs uppercase tracking-widest text-gold hover:text-gold-light border border-gold/40 hover:border-gold px-5 py-2.5 transition-colors"
          >
            Más información
          </Link>
          <button
            type="button"
            onClick={accept}
            className="text-xs uppercase tracking-widest bg-gold text-charcoal px-6 py-2.5 hover:bg-gold-light transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
