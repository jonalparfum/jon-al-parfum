"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PASSWORD_REQUIREMENTS_HINT } from "@/lib/password-policy";
import ShippingAddressForm from "@/components/ShippingAddressForm";
import { emptyShipping, validateShipping, type ShippingInput } from "@/lib/shipping";

const inputClass =
  "w-full bg-luxury-black border border-gold/20 px-3 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold transition-colors";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shipping, setShipping] = useState<ShippingInput>(emptyShipping());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const validationError = validateShipping(shipping);
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: shipping.shippingName,
        email,
        password,
        shippingPhone: shipping.shippingPhone,
        shippingStreet: shipping.shippingStreet,
        shippingColony: shipping.shippingColony,
        shippingCity: shipping.shippingCity,
        shippingState: shipping.shippingState,
        shippingZip: shipping.shippingZip,
        shippingNotes: shipping.shippingNotes,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Error al registrarse");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      router.push("/login");
    } else {
      router.push("/cuenta");
      router.refresh();
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <h1 className="font-display text-3xl text-center mb-2 text-cream">
          Crear cuenta
        </h1>
        <p className="text-center text-cream/50 mb-8 text-sm">
          Registra tus datos para comprar y recibir tus pedidos en casa
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-luxury-panel border border-gold/10 p-8 space-y-6 gold-border-glow"
        >
          {error && (
            <p className="text-red-400 text-sm text-center bg-red-950/50 border border-red-900/50 py-2">
              {error}
            </p>
          )}

          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold/70">
              Acceso
            </p>

            <div>
              <label className="block text-sm font-medium mb-1 text-cream/80">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-cream/80">
                Contraseña
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder={PASSWORD_REQUIREMENTS_HINT}
              />
              <p className="mt-1.5 text-[11px] text-cream/40">
                {PASSWORD_REQUIREMENTS_HINT}
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-gold/10">
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold/70">
              Datos para envío del paquete
            </p>
            <ShippingAddressForm
              value={shipping}
              onChange={setShipping}
              showIntro
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-luxury-black py-3 text-sm uppercase tracking-widest hover:bg-gold-light transition-colors disabled:opacity-50 font-medium"
          >
            {loading ? "Creando cuenta..." : "Registrarse"}
          </button>
        </form>

        <p className="text-center text-sm text-cream/50 mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-gold hover:text-gold-light">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
