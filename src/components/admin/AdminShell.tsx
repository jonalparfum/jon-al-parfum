"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
import {
  adminBtnPrimary,
  adminContent,
  adminNavLink,
  adminNavLinkActive,
  adminNavLinkInactive,
  adminShell,
  adminSidebar,
  adminSidebarMobile,
  adminStatCard,
  adminStatCardAccent,
  adminStatLabel,
  adminTopbar,
  adminMain,
} from "@/lib/admin-styles";

const links = [
  { href: "/admin", label: "Resumen", exact: true },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/catalogos", label: "Categorías" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/comprobantes", label: "Comprobantes" },
  { href: "/admin/cuentas-bancarias", label: "Cuentas bancarias" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/accesos", label: "Accesos" },
  { href: "/admin/perfil", label: "Mi perfil" },
];

type AdminSidebarProps = {
  email?: string | null;
  onNavigate?: () => void;
};

function AdminSidebar({ email, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <div className="relative px-6 py-6 border-b border-stone-100">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold" aria-hidden="true" />
        <Link
          href="/admin"
          onClick={onNavigate}
          className="font-display text-[1.35rem] text-charcoal hover:text-gold-dark transition-colors tracking-wide block leading-tight"
        >
          Jon Al Parfum
        </Link>
        <p className={`${adminStatLabel} mt-2.5`}>Panel administrativo</p>
        {email && (
          <p
            className="text-xs text-charcoal/40 mt-1.5 truncate max-w-[200px]"
            title={email}
          >
            {email}
          </p>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
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
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-5 border-t border-stone-100 bg-[#fafaf9]">
        <Link
          href="/"
          onClick={onNavigate}
          className="text-xs uppercase tracking-[0.14em] text-gold-dark hover:text-gold font-semibold transition-colors"
        >
          ← Ver tienda pública
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
    lockScroll();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      unlockScroll();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  return (
    <div className={adminShell}>
      <aside className={`hidden md:flex ${adminSidebar}`}>
        <AdminSidebar email={email} />
      </aside>

      {mobileOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-charcoal/30 backdrop-blur-[2px] md:hidden"
            aria-label="Cerrar menú"
            onClick={() => setMobileOpen(false)}
          />
          <aside className={adminSidebarMobile}>
            <AdminSidebar
              email={email}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </>
      )}

      <div className={adminMain}>
        <header className={adminTopbar}>
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="md:hidden px-3.5 py-2 border border-stone-300 rounded-xl text-xs uppercase tracking-wider text-charcoal bg-white font-medium"
                onClick={() => setMobileOpen(true)}
              >
                Menú
              </button>
              <p className={`${adminStatLabel} hidden md:block text-charcoal/50`}>
                Gestión del catálogo
              </p>
            </div>
            <Link
              href="/admin/productos/nuevo"
              className={`${adminBtnPrimary} hidden sm:inline-flex`}
            >
              + Nuevo producto
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map((stat) => (
              <Link key={stat.label} href={stat.href} className={adminStatCard}>
                <span className={adminStatCardAccent} aria-hidden="true" />
                <p className={adminStatLabel}>{stat.label}</p>
                <p className="text-2xl font-semibold text-gold-dark mt-1 tabular-nums">
                  {stat.value}
                </p>
              </Link>
            ))}
          </div>
        </header>

        <main className={adminContent}>{children}</main>
      </div>
    </div>
  );
}
