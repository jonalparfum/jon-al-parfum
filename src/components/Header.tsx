"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { data: session } = useSession();
  const { totalItems, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/tienda", label: "Tienda" },
    { href: "/tienda?categoria=hombre", label: "Hombre" },
    { href: "/tienda?categoria=mujer", label: "Mujer" },
    { href: "/tienda?categoria=unisex", label: "Unisex" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#faf8f5]/95 backdrop-blur-md border-b border-gold/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link
            href="/"
            className="font-serif text-xl md:text-2xl tracking-wide text-charcoal hover:text-gold transition-colors"
          >
            Jon Al <span className="text-gold">Parfum</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm uppercase tracking-widest text-charcoal/80 hover:text-gold transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {session ? (
              <Link
                href="/cuenta"
                className="hidden sm:block text-sm text-charcoal/70 hover:text-gold transition-colors"
              >
                {session.user.name || "Mi cuenta"}
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:block text-sm text-charcoal/70 hover:text-gold transition-colors"
              >
                Entrar
              </Link>
            )}

            <button
              onClick={openCart}
              className="relative p-2 text-charcoal hover:text-gold transition-colors"
              aria-label="Abrir carrito"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gold text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-charcoal"
              aria-label="Menú"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="md:hidden py-4 border-t border-gold/10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block py-3 text-sm uppercase tracking-widest text-charcoal/80 hover:text-gold transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={session ? "/cuenta" : "/login"}
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-sm uppercase tracking-widest text-charcoal/80 hover:text-gold transition-colors"
            >
              {session ? "Mi cuenta" : "Entrar"}
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
