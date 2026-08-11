import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminNav from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-charcoal text-cream">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <Link href="/admin" className="font-serif text-xl">
              Panel Admin
            </Link>
            <p className="text-sm text-cream/60 mt-1">
              {session?.user?.email}
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-gold hover:text-gold-light transition-colors"
          >
            Ver tienda →
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Productos", value: stats[0] },
            { label: "Catálogos", value: stats[1] },
            { label: "Pedidos", value: stats[2] },
            { label: "Usuarios", value: stats[3] },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
            >
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-semibold text-charcoal">{stat.value}</p>
            </div>
          ))}
        </div>

        <AdminNav />
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
