import { prisma } from "@/lib/prisma";

export type AdminReportData = {
  generatedAt: Date;
  sales: {
    totalRevenue: number;
    paidOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
    averageOrderValue: number;
    recentOrders: {
      id: string;
      customer: string;
      total: number;
      status: string;
      date: Date;
    }[];
  };
  stock: {
    totalProducts: number;
    activeProducts: number;
    totalUnits: number;
    lowStock: { name: string; stock: number; category: string }[];
    outOfStock: { name: string; category: string }[];
  };
  catalog: {
    categories: number;
    subcategories: number;
    users: number;
    admins: number;
  };
  topProducts: { name: string; unitsSold: number; revenue: number }[];
  recommendations: string[];
};

const PAID_STATUSES = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

export async function getAdminReportData(): Promise<AdminReportData> {
  const [
    allOrders,
    products,
    categoryCount,
    subcategoryCount,
    userCount,
    adminCount,
    orderItems,
  ] = await Promise.all([
    prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      include: { category: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.category.count(),
    prisma.subcategory.count(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.orderItem.findMany({
      where: { order: { status: { in: [...PAID_STATUSES] } } },
      include: {
        product: { select: { name: true } },
      },
    }),
  ]);

  const paidOrders = allOrders.filter((o) =>
    PAID_STATUSES.includes(o.status as (typeof PAID_STATUSES)[number])
  );
  const pendingOrders = allOrders.filter((o) => o.status === "PENDING");
  const cancelledOrders = allOrders.filter((o) => o.status === "CANCELLED");

  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const averageOrderValue =
    paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

  const activeProducts = products.filter((p) => p.active);
  const lowStock = products
    .filter((p) => p.active && p.stock > 0 && p.stock <= 10)
    .map((p) => ({
      name: p.name,
      stock: p.stock,
      category: p.category.name,
    }));
  const outOfStock = products
    .filter((p) => p.active && p.stock === 0)
    .map((p) => ({ name: p.name, category: p.category.name }));

  const productSales = new Map<string, { name: string; units: number; revenue: number }>();
  for (const item of orderItems) {
    const key = item.productId;
    const current = productSales.get(key) ?? {
      name: item.product.name,
      units: 0,
      revenue: 0,
    };
    current.units += item.quantity;
    current.revenue += item.price * item.quantity;
    productSales.set(key, current);
  }

  const topProducts = [...productSales.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((p) => ({
      name: p.name,
      unitsSold: p.units,
      revenue: p.revenue,
    }));

  const recommendations: string[] = [];

  if (outOfStock.length > 0) {
    recommendations.push(
      `Reabastecer ${outOfStock.length} producto(s) sin stock: ${outOfStock
        .slice(0, 3)
        .map((p) => p.name)
        .join(", ")}${outOfStock.length > 3 ? "…" : ""}.`
    );
  }
  if (lowStock.length > 0) {
    recommendations.push(
      `Revisar inventario bajo en ${lowStock.length} producto(s) (≤10 unidades).`
    );
  }
  if (pendingOrders.length > 0) {
    recommendations.push(
      `Hay ${pendingOrders.length} pedido(s) pendientes de pago — verificar en Stripe o contactar clientes.`
    );
  }
  const withoutSub = products.filter((p) => p.active && !p.subcategoryId);
  if (withoutSub.length > 0) {
    recommendations.push(
      `${withoutSub.length} producto(s) activo(s) sin subcategoría — mejora filtros en la tienda.`
    );
  }
  if (topProducts.length > 0) {
    recommendations.push(
      `Tu bestseller es "${topProducts[0].name}" — considera destacarlo en la página principal.`
    );
  }
  if (recommendations.length === 0) {
    recommendations.push(
      "Operación saludable. Mantén el catálogo actualizado y revisa pedidos semanalmente."
    );
  }

  return {
    generatedAt: new Date(),
    sales: {
      totalRevenue,
      paidOrders: paidOrders.length,
      pendingOrders: pendingOrders.length,
      cancelledOrders: cancelledOrders.length,
      averageOrderValue,
      recentOrders: allOrders.slice(0, 8).map((o) => ({
        id: o.id.slice(-8).toUpperCase(),
        customer: o.user.name || o.user.email,
        total: o.total,
        status: o.status,
        date: o.createdAt,
      })),
    },
    stock: {
      totalProducts: products.length,
      activeProducts: activeProducts.length,
      totalUnits: activeProducts.reduce((s, p) => s + p.stock, 0),
      lowStock,
      outOfStock,
    },
    catalog: {
      categories: categoryCount,
      subcategories: subcategoryCount,
      users: userCount,
      admins: adminCount,
    },
    topProducts,
    recommendations,
  };
}
