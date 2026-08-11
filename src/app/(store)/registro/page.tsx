"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full bg-luxury-black border border-gold/20 px-3 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold transition-colors";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
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
      <div className="w-full max-w-md">
        <h1 className="font-display text-3xl text-center mb-2 text-cream">
          Crear cuenta
        </h1>
        <p className="text-center text-cream/50 mb-8 text-sm">
          Únete a Jon Al Parfum
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-luxury-panel border border-gold/10 p-8 space-y-4 gold-border-glow"
        >
          {error && (
            <p className="text-red-400 text-sm text-center bg-red-950/50 border border-red-900/50 py-2">
              {error}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-cream/80">
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="Tu nombre"
            />
          </div>

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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="Mínimo 6 caracteres"
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
