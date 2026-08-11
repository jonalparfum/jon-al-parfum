"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Resumen", exact: true },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/catalogos", label: "Categorías" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/perfil", label: "Mi perfil" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 border-b border-gold/10 pb-4">
      {links.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`px-4 py-2.5 rounded text-xs uppercase tracking-[0.15em] font-medium transition-colors ${
              active
                ? "bg-gold text-luxury-black"
                : "bg-luxury-panel text-cream/70 border border-gold/15 hover:text-gold hover:border-gold/30"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
