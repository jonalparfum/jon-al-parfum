"use client";

import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { data: session } = useSession();
  const { totalItems, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleOutside(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (mobileMenuRef.current?.contains(target)) return;
      if (
        target instanceof Element &&
        target.closest("[data-mobile-menu-toggle]")
      ) {
        return;
      }
      setMenuOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/tienda", label: "Tienda" },
    { href: "/tienda?categoria=hombre", label: "Hombre" },
    { href: "/tienda?categoria=mujer", label: "Mujer" },
    { href: "/#contacto", label: "Contacto" },
    { href: "/#faq", label: "FAQ" },
  ];

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-500 ${
        menuOpen
          ? "max-md:bg-luxury-black/98 max-md:backdrop-blur-md max-md:border-b max-md:border-gold/10 max-md:shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
          : scrolled
            ? "bg-luxury-black/95 backdrop-blur-md border-b border-gold/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
            : "bg-transparent border-b border-transparent"
      }`}
    >
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="relative z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <BrandLogo
              size="sm"
              priority
              className="origin-left max-md:scale-110 md:scale-100 group-hover:md:scale-105 transition-transform duration-500"
            />
            <span className="hidden sm:block font-display text-lg md:text-xl tracking-wide text-cream group-hover:text-gold transition-colors duration-300">
              Jon Al Parfum
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs uppercase tracking-[0.2em] text-cream/70 hover:text-gold transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-gold hover:after:w-full after:transition-all after:duration-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            {session ? (
              <Link
                href="/cuenta"
                className="hidden sm:block text-xs uppercase tracking-wider text-cream/60 hover:text-gold transition-colors"
              >
                {session.user.name || "Mi cuenta"}
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:block text-xs uppercase tracking-wider text-cream/60 hover:text-gold transition-colors"
              >
                Entrar
              </Link>
            )}

            <button
              onClick={openCart}
              className="relative p-2.5 text-cream/80 hover:text-gold transition-colors duration-300"
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
                <span className="absolute -top-0.5 -right-0.5 bg-gold text-luxury-black text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              data-mobile-menu-toggle
              className="md:hidden p-2 text-cream"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
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

        <div
          ref={mobileMenuRef}
          className={`md:hidden overflow-hidden transition-all duration-500 ${
            menuOpen ? "max-h-96 border-t border-gold/10" : "max-h-0"
          }`}
        >
          <nav className="py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block py-3 text-xs uppercase tracking-[0.2em] text-cream/70 hover:text-gold transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={session ? "/cuenta" : "/login"}
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-xs uppercase tracking-[0.2em] text-cream/70 hover:text-gold transition-colors"
            >
              {session ? "Mi cuenta" : "Entrar"}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
