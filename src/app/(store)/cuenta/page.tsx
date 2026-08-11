"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import { formatPrice } from "@/lib/product-utils";

type Order = {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: {
    quantity: number;
    price: number;
    product: { name: string; slug: string };
  }[];
};

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente de pago",
  PAID: "Pagado",
  PROCESSING: "En preparación",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

const adminLinks = [
  { href: "/admin", label: "Resumen", desc: "Pedidos recientes y stock bajo" },
  { href: "/admin/productos", label: "Productos", desc: "Agregar, editar precios e imágenes" },
  { href: "/admin/catalogos", label: "Categorías", desc: "Categorías y subcategorías" },
  { href: "/admin/pedidos", label: "Pedidos", desc: "Estado de envíos y pagos" },
];

export default function AccountPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [navAction, setNavAction] = useState<"panel" | "logout" | null>(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then(setOrders);
  }, []);

  const isAdmin = session?.user?.role === "ADMIN";

  const handleSignOut = async () => {
    setNavAction("logout");
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl mb-2 text-cream">Mi cuenta</h1>
      <p className="text-cream/50 mb-8">{session?.user?.name || session?.user?.email}</p>

      {isAdmin && (
        <section className="mb-10 bg-luxury-panel border border-gold/15 p-6 md:p-8 gold-border-glow">
          <p className="text-[10px] uppercase tracking-[0.35em] text-gold/70 mb-2">
            Administración
          </p>
          <h2 className="font-display text-2xl text-cream mb-4">Panel de control</h2>
          <p className="text-sm text-cream/60 mb-6">
            Gestiona productos, categorías, subcategorías, precios y pedidos de Jon Al Parfum.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block border border-gold/15 bg-luxury-black/50 px-4 py-4 hover:border-gold/40 hover:bg-luxury-black transition-colors"
              >
                <p className="text-sm font-medium text-gold mb-1">{link.label}</p>
                <p className="text-xs text-cream/50">{link.desc}</p>
              </Link>
            ))}
          </div>
          <button
            type="button"
            disabled={navAction !== null}
            onClick={() => {
              setNavAction("panel");
              router.push("/admin");
            }}
            className="inline-flex items-center justify-center gap-2 btn-luxury-primary text-[10px] disabled:opacity-70 disabled:cursor-wait min-w-[10rem]"
          >
            {navAction === "panel" ? (
              <>
                <LoadingSpinner className="w-3.5 h-3.5" />
                Cargando...
              </>
            ) : (
              "Ir al panel admin"
            )}
          </button>
        </section>
      )}

      <div className="flex gap-4 mb-8">
        <button
          type="button"
          disabled={navAction !== null}
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 text-sm text-cream/50 hover:text-gold transition-colors disabled:opacity-70 disabled:cursor-wait"
        >
          {navAction === "logout" ? (
            <>
              <LoadingSpinner className="w-3.5 h-3.5 text-gold" />
              Saliendo...
            </>
          ) : (
            "Cerrar sesión"
          )}
        </button>
      </div>

      <h2 className="font-display text-xl mb-4 text-cream">Mis pedidos</h2>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-luxury-panel/40 border border-gold/10 rounded-lg">
          <p className="text-cream/60 mb-4">Aún no has realizado ningún pedido.</p>
          <Link
            href="/tienda"
            className="text-sm uppercase tracking-wider text-gold hover:text-gold-light"
          >
            Explorar tienda
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-luxury-panel/40 border border-gold/10 p-6"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm text-cream/50">
                    {new Date(order.createdAt).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="font-medium mt-1 text-cream">
                    {statusLabels[order.status] || order.status}
                  </p>
                </div>
                <span className="font-semibold text-gold">{formatPrice(order.total)}</span>
              </div>
              <ul className="text-sm text-cream/70 space-y-1">
                {order.items.map((item, i) => (
                  <li key={i}>
                    {item.product.name} × {item.quantity}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
