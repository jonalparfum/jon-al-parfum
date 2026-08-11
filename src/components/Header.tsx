"use client";

import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import HeaderCategoryNav from "@/components/HeaderCategoryNav";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import type { CatalogCategory } from "@/lib/catalog";

const staticNavLinks = [
  { href: "/", label: "Inicio" },
  { href: "/tienda", label: "Tienda" },
  { href: "/#contacto", label: "Contacto" },
  { href: "/#faq", label: "FAQ" },
];

const adminLinks = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/catalogos", label: "Categorías" },
  { href: "/admin/pedidos", label: "Pedidos" },
];

export default function Header() {
  const { data: session } = useSession();
  const { totalItems, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

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

  const closeMenu = () => setMenuOpen(false);

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
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <BrandLogo
              size="sm"
              priority
              className="origin-left max-md:scale-110 md:scale-100 group-hover:md:scale-105 transition-transform duration-500"
            />
            <span className="hidden sm:block font-display text-lg md:text-xl tracking-wide text-cream group-hover:text-gold transition-colors duration-300">
              Jon Al Parfum
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {staticNavLinks.slice(0, 2).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs uppercase tracking-[0.2em] text-cream/70 hover:text-gold transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
            <HeaderCategoryNav categories={categories} />
            {staticNavLinks.slice(2).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs uppercase tracking-[0.2em] text-cream/70 hover:text-gold transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {isAdmin && (
              <nav className="hidden lg:flex items-center gap-2 xl:gap-3 mr-1">
                {adminLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-[10px] uppercase tracking-[0.15em] text-cream/50 hover:text-gold transition-colors whitespace-nowrap"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}

            {session ? (
              <>
                {!isAdmin && (
                  <Link
                    href="/cuenta"
                    className="hidden sm:block text-xs uppercase tracking-wider text-cream/60 hover:text-gold transition-colors"
                  >
                    Mi cuenta
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-[10px] uppercase tracking-[0.15em] text-luxury-black bg-gold hover:bg-gold-light px-3 py-1.5 font-medium transition-colors whitespace-nowrap"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex text-[10px] uppercase tracking-[0.15em] text-luxury-black bg-gold hover:bg-gold-light px-3 py-1.5 font-medium transition-colors"
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
              className="lg:hidden p-2 text-cream"
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
          className={`lg:hidden overflow-hidden transition-all duration-500 ${
            menuOpen ? "max-h-[85svh] overflow-y-auto border-t border-gold/10" : "max-h-0"
          }`}
        >
          <nav className="py-4">
            {staticNavLinks.slice(0, 2).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="block py-3 text-xs uppercase tracking-[0.2em] text-cream/70 hover:text-gold transition-colors"
              >
                {link.label}
              </Link>
            ))}

            <HeaderCategoryNav
              categories={categories}
              onNavigate={closeMenu}
              variant="mobile"
            />

            {staticNavLinks.slice(2).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="block py-3 text-xs uppercase tracking-[0.2em] text-cream/70 hover:text-gold transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {isAdmin && (
              <div className="mt-4 pt-4 border-t border-gold/10">
                <p className="px-0 py-1 text-[10px] uppercase tracking-[0.25em] text-gold/60 mb-2">
                  Administración
                </p>
                {adminLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="block py-2.5 text-xs uppercase tracking-[0.2em] text-gold hover:text-gold-light transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}

            {!session && (
              <Link
                href="/login"
                onClick={closeMenu}
                className="block py-3 text-xs uppercase tracking-[0.2em] text-cream/70 hover:text-gold transition-colors"
              >
                Entrar
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
