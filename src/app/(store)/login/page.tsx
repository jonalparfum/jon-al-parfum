"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { signIn, getSession, useSession } from "next-auth/react";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function resolveDestination(callbackUrl: string, role?: string) {
  if (role === "ADMIN") {
    if (callbackUrl.startsWith("/admin")) return callbackUrl;
    if (callbackUrl === "/") return "/admin";
    return callbackUrl;
  }
  if (callbackUrl.startsWith("/admin")) return "/";
  return callbackUrl;
}

async function waitForSession(maxAttempts = 8) {
  for (let i = 0; i < maxAttempts; i++) {
    const session = await getSession();
    if (session?.user) return session;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  return null;
}

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const hasRedirected = useRef(false);

  const goToDestination = useCallback(async () => {
    if (hasRedirected.current) return;
    hasRedirected.current = true;
    setRedirecting(true);
    setLoading(false);

    const currentSession = await waitForSession();
    const destination = resolveDestination(
      callbackUrl,
      currentSession?.user?.role
    );

    window.location.assign(destination);
  }, [callbackUrl]);

  useEffect(() => {
    if (status === "authenticated" && !hasRedirected.current && !loading) {
      goToDestination();
    }
  }, [status, goToDestination, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error || result?.ok === false) {
        setError("Email o contraseña incorrectos");
        setLoading(false);
        return;
      }

      await goToDestination();
    } catch {
      hasRedirected.current = false;
      setRedirecting(false);
      setError("No se pudo iniciar sesión. Intenta de nuevo.");
      setLoading(false);
    }
  };

  if (redirecting) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 px-4">
        <LoadingSpinner className="w-8 h-8 text-gold" />
        <p className="text-cream/60 text-sm">Entrando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="font-display text-3xl text-center mb-2 text-cream">Iniciar sesión</h1>
        <p className="text-center text-cream/50 mb-8 text-sm">
          Accede a tu cuenta de Jon Al Parfum
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
            <label className="block text-sm font-medium mb-1 text-cream/80">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-luxury-black border border-gold/20 px-3 py-2.5 text-sm text-cream focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-cream/80">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-luxury-black border border-gold/20 px-3 py-2.5 text-sm text-cream focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-gold text-luxury-black py-3 text-sm uppercase tracking-widest hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-wait font-medium"
          >
            {loading ? (
              <>
                <LoadingSpinner className="w-4 h-4" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-cream/50 mt-6">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="text-gold hover:text-gold-light">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-cream/60">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  );
}
