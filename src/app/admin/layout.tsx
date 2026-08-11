import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminNav from "@/components/admin/AdminNav";
import {
  adminStatCard,
  adminStatLabel,
  adminStatValue,
} from "@/lib/admin-styles";
import { NO_INDEX_METADATA } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = {
  ...NO_INDEX_METADATA,
  title: "Panel Admin",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  const stats = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
    prisma.user.count(),
  ]);

  return (
    <div className="min-h-screen bg-luxury-black text-cream">
      <header className="border-b border-gold/10 bg-luxury-panel/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <Link
              href="/admin"
              className="font-display text-xl md:text-2xl text-cream hover:text-gold transition-colors tracking-wide"
            >
              Panel Admin
            </Link>
            <Link
              href="/admin/perfil"
              className="text-xs text-cream/50 mt-1 block hover:text-gold transition-colors truncate max-w-[240px] sm:max-w-none"
            >
              {session?.user?.email} · Mi perfil
            </Link>
          </div>
          <Link
            href="/"
            className={`${adminStatLabel} text-gold hover:text-gold-light transition-colors whitespace-nowrap`}
          >
            ← Ver tienda
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          {[
            { label: "Productos", value: stats[0] },
            { label: "Categorías", value: stats[1] },
            { label: "Pedidos", value: stats[2] },
            { label: "Usuarios", value: stats[3] },
          ].map((stat) => (
            <div key={stat.label} className={adminStatCard}>
              <p className={adminStatLabel}>{stat.label}</p>
              <p className={adminStatValue}>{stat.value}</p>
            </div>
          ))}
        </div>

        <AdminNav />
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
