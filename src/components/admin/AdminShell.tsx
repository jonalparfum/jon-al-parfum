"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  adminBtnPrimary,
  adminNavLink,
  adminNavLinkActive,
  adminNavLinkInactive,
  adminStatLabel,
} from "@/lib/admin-styles";

const links = [
  { href: "/admin", label: "Resumen", exact: true, icon: "◆" },
  { href: "/admin/productos", label: "Productos", icon: "◇" },
  { href: "/admin/catalogos", label: "Categorías", icon: "◈" },
  { href: "/admin/pedidos", label: "Pedidos", icon: "◉" },
  { href: "/admin/usuarios", label: "Usuarios", icon: "○" },
  { href: "/admin/perfil", label: "Mi perfil", icon: "◎" },
];

type AdminSidebarProps = {
  email?: string | null;
  onNavigate?: () => void;
};

export default function AdminSidebar({ email, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-gold/10">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="font-display text-xl text-cream hover:text-gold transition-colors tracking-wide block"
        >
          Jon Al Parfum
        </Link>
        <p className={`${adminStatLabel} mt-2`}>Panel administrativo</p>
        {email && (
          <p className="text-xs text-cream/40 mt-1 truncate" title={email}>
            {email}
          </p>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={`${adminNavLink} ${
                active ? adminNavLinkActive : adminNavLinkInactive
              }`}
            >
              <span className="text-gold/70 text-xs" aria-hidden="true">
                {link.icon}
              </span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gold/10">
        <Link
          href="/"
          onClick={onNavigate}
          className="text-xs uppercase tracking-[0.14em] text-gold/80 hover:text-gold transition-colors"
        >
          ← Ver tienda
        </Link>
      </div>
    </div>
  );
}

type AdminShellProps = {
  children: React.ReactNode;
  email?: string | null;
  stats: { label: string; href: string; value: number }[];
};

export function AdminShell({ children, email, stats }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-luxury-black text-cream flex">
      <aside className="hidden md:flex w-64 shrink-0 border-r border-gold/10 bg-luxury-panel/30">
        <AdminSidebar email={email} />
      </aside>

      {mobileOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            aria-label="Cerrar menú"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 border-r border-gold/10 bg-luxury-panel md:hidden">
            <AdminSidebar
              email={email}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 border-b border-gold/10 bg-luxury-black/90 backdrop-blur-md px-4 md:px-8 py-4">
          <div className="flex items-center justify-between gap-4 mb-4 md:mb-5">
            <button
              type="button"
              className="md:hidden px-3 py-2 border border-gold/20 rounded-lg text-xs uppercase tracking-wider text-gold"
              onClick={() => setMobileOpen(true)}
            >
              Menú
            </button>
            <p className={`${adminStatLabel} hidden md:block`}>
              Gestión del catálogo
            </p>
            <Link
              href="/admin/productos/nuevo"
              className={`${adminBtnPrimary} hidden sm:inline-flex py-2`}
            >
              + Producto
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map((stat) => (
              <Link
                key={stat.label}
                href={stat.href}
                className="rounded-xl border border-gold/10 bg-luxury-panel/50 px-4 py-3 hover:border-gold/25 hover:bg-luxury-panel/80 transition-all"
              >
                <p className={adminStatLabel}>{stat.label}</p>
                <p className="text-xl font-semibold text-gold mt-1">
                  {stat.value}
                </p>
              </Link>
            ))}
          </div>
        </header>

        <main className="flex-1 px-4 md:px-8 py-6 md:py-8">{children}</main>
      </div>
    </div>
  );
}
