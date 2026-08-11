import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminToastProvider } from "@/components/admin/AdminToast";
import AdminBodyTheme from "@/components/admin/AdminBodyTheme";
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

  const [products, categories, orders, users] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
    prisma.user.count(),
  ]);

  const stats = [
    { label: "Productos", href: "/admin/productos", value: products },
    { label: "Categorías", href: "/admin/catalogos", value: categories },
    { label: "Pedidos", href: "/admin/pedidos", value: orders },
    { label: "Usuarios", href: "/admin/usuarios", value: users },
  ];

  return (
    <AdminToastProvider>
      <AdminBodyTheme />
      <AdminShell email={session?.user?.email} stats={stats}>
        {children}
      </AdminShell>
    </AdminToastProvider>
  );
}
