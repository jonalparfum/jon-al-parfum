"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import ShippingAddressForm from "@/components/ShippingAddressForm";
import { formatPrice } from "@/lib/product-utils";
import {
  emptyShipping,
  displayWhatsAppPhone,
  resolveOrderShippingDisplay,
  validateShipping,
  type ShippingInput,
} from "@/lib/shipping";

type Order = {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  paymentMethod: string;
  paymentProofStatus: string | null;
  shippingName: string | null;
  shippingPhone: string | null;
  shippingStreet: string | null;
  shippingColony: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingZip: string | null;
  shippingNotes: string | null;
  shippingAddress: string | null;
  items: {
    quantity: number;
    price: number;
    variantLabel?: string | null;
    product: { name: string; slug: string };
  }[];
};

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente de pago",
  PAID: "Pagado",
  PROCESSING: "Preparando envío",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

const paymentLabels: Record<string, string> = {
  STRIPE: "Tarjeta (Stripe)",
  BANK_TRANSFER: "Transferencia bancaria",
};

const adminLinks = [
  { href: "/admin", label: "Resumen", desc: "Pedidos recientes y stock bajo" },
  { href: "/admin/productos", label: "Productos", desc: "Agregar, editar precios e imágenes" },
  { href: "/admin/catalogos", label: "Categorías", desc: "Categorías y subcategorías" },
  { href: "/admin/pedidos", label: "Pedidos", desc: "Estado de envíos y pagos" },
];

function orderShippingLabel(order: Order): string {
  return resolveOrderShippingDisplay(order);
}

export default function AccountPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [shipping, setShipping] = useState<ShippingInput>(emptyShipping());
  const [shippingLoading, setShippingLoading] = useState(true);
  const [shippingSaving, setShippingSaving] = useState(false);
  const [shippingMessage, setShippingMessage] = useState("");
  const [shippingError, setShippingError] = useState("");
  const [navAction, setNavAction] = useState<"panel" | "logout" | null>(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then(setOrders);

    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data?.profile) {
          setShipping({
            shippingName: data.profile.shippingName || data.profile.name || "",
            shippingPhone: displayWhatsAppPhone(data.profile.shippingPhone || ""),
            shippingStreet: data.profile.shippingStreet || "",
            shippingColony: data.profile.shippingColony || "",
            shippingCity: data.profile.shippingCity || "",
            shippingState: data.profile.shippingState || "",
            shippingZip: data.profile.shippingZip || "",
            shippingNotes: data.profile.shippingNotes || "",
          });
        }
      })
      .finally(() => setShippingLoading(false));
  }, []);

  const isAdmin = session?.user?.role === "ADMIN";

  const handleSignOut = async () => {
    setNavAction("logout");
    await signOut({ callbackUrl: "/" });
  };

  const handleSaveShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateShipping(shipping);
    if (validationError) {
      setShippingError(validationError);
      setShippingMessage("");
      return;
    }

    setShippingSaving(true);
    setShippingError("");
    setShippingMessage("");

    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(shipping),
    });

    const data = await res.json();

    if (res.ok) {
      setShippingMessage("Datos de envío guardados");
    } else {
      setShippingError(data.error || "Error al guardar");
    }

    setShippingSaving(false);
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

      <section className="mb-10 bg-luxury-panel/40 border border-gold/10 p-6">
        <h2 className="font-display text-xl mb-2 text-cream">Datos para envío del paquete</h2>
        <p className="text-sm text-cream/50 mb-4">
          Nombre, WhatsApp y domicilio para enviarte tus pedidos.
        </p>

        {shippingLoading ? (
          <p className="text-sm text-cream/50">Cargando...</p>
        ) : (
          <form onSubmit={handleSaveShipping} className="space-y-4">
            <ShippingAddressForm
              value={shipping}
              onChange={setShipping}
              showIntro
            />
            {shippingError && (
              <p className="text-red-400 text-sm">{shippingError}</p>
            )}
            {shippingMessage && (
              <p className="text-gold text-sm">{shippingMessage}</p>
            )}
            <button
              type="submit"
              disabled={shippingSaving}
              className="bg-gold text-luxury-black px-6 py-2.5 text-sm uppercase tracking-widest hover:bg-gold-light transition-colors disabled:opacity-50 font-medium"
            >
              {shippingSaving ? "Guardando..." : "Guardar dirección"}
            </button>
          </form>
        )}
      </section>

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
          {orders.map((order) => {
            const address = orderShippingLabel(order);
            const transferPending =
              order.paymentMethod === "BANK_TRANSFER" &&
              order.status === "PENDING" &&
              order.paymentProofStatus !== "APPROVED";

            return (
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
                    <p className="text-xs text-cream/40 mt-1">
                      {paymentLabels[order.paymentMethod] || order.paymentMethod}
                      {order.shippingPhone && ` · WhatsApp: ${order.shippingPhone}`}
                      {transferPending && " · Comprobante en revisión"}
                    </p>
                  </div>
                  <span className="font-semibold text-gold">{formatPrice(order.total)}</span>
                </div>

                {address && (
                  <p className="text-sm text-cream/60 mb-3 border-t border-gold/10 pt-3">
                    <span className="text-cream/40 uppercase text-[10px] tracking-wider block mb-1">
                      Envío a
                    </span>
                    {order.shippingName && (
                      <span className="block text-cream/80">{order.shippingName}</span>
                    )}
                    {address}
                  </p>
                )}

                <ul className="text-sm text-cream/70 space-y-1">
                  {order.items.map((item, i) => (
                    <li key={i}>
                      {item.product.name}
                      {item.variantLabel ? ` (${item.variantLabel})` : ""} ×{" "}
                      {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
