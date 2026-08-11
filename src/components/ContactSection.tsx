"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { WHATSAPP_NUMBER, CONTACT_EMAIL } from "@/lib/contact";
import EmailLink from "@/components/EmailLink";

type FormState = "idle" | "loading" | "success" | "error";

const inputClass =
  "w-full bg-luxury-black/60 border border-gold/15 px-4 py-3.5 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold/50 focus:shadow-[0_0_20px_rgba(201,169,98,0.08)] transition-all duration-300";

export default function ContactSection() {
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!res.ok) {
        setErrorMsg(result.error || "No se pudo enviar el mensaje");
        setState("error");
        return;
      }

      setState("success");
      form.reset();

      if (result.whatsappUrl) {
        window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
      }
    } catch {
      setErrorMsg("Error de conexión. Intenta de nuevo o escríbenos por WhatsApp.");
      setState("error");
    }
  }

  return (
    <section
      id="contacto"
      ref={sectionRef}
      className="relative py-28 md:py-36 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-luxury-black via-luxury-panel/40 to-luxury-black" />
      <div className="absolute top-0 left-0 right-0 section-divider" />
      <div className="absolute inset-0 bg-radial-gold opacity-60 pointer-events-none" />

      <div
        className={`relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-start">
          <div>
            <p className="text-gold uppercase tracking-[0.4em] text-xs mb-5">
              Escríbenos
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-cream leading-tight mb-6">
              Contacto
            </h2>
            <p className="text-cream/75 leading-relaxed mb-6 max-w-md">
              Desde Nuevo Laredo, Tamaulipas, atendemos consultas sobre fragancias,
              pedidos especiales y envíos a toda la República Mexicana.
            </p>

            <div className="mb-8">
              <EmailLink className="text-cream/80 text-sm" />
            </div>

            <div className="space-y-5 text-sm">
              <div className="flex items-start gap-4 p-4 border border-gold/10 bg-luxury-panel/30">
                <span className="text-gold mt-0.5">◆</span>
                <div>
                  <p className="text-cream/90 font-medium mb-1">Ubicación</p>
                  <p className="text-cream/70">Nuevo Laredo, Tamaulipas, México</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 border border-gold/10 bg-luxury-panel/30">
                <span className="text-gold mt-0.5">◆</span>
                <div>
                  <p className="text-cream/90 font-medium mb-1">Cobertura</p>
                  <p className="text-cream/70">Envíos a toda la República Mexicana</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 border border-gold/10 bg-luxury-panel/30">
                <span className="text-gold mt-0.5">◆</span>
                <div>
                  <p className="text-cream/90 font-medium mb-1">Respuesta</p>
                  <p className="text-cream/70">Te contactamos en menos de 24 horas</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-px bg-gradient-to-br from-gold/20 via-transparent to-gold/10 pointer-events-none" />
            <form
              onSubmit={handleSubmit}
              className="relative bg-luxury-panel/80 backdrop-blur-sm border border-gold/15 p-8 md:p-10 space-y-5 gold-border-glow"
            >
              {state === "success" && (
                <div className="border border-gold/30 bg-gold/5 px-4 py-3 text-sm text-gold">
                  ¡Mensaje enviado! Te redirigimos a WhatsApp para continuar la conversación.
                </div>
              )}
              {state === "error" && errorMsg && (
                <div className="border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="contact-name" className="block text-xs uppercase tracking-[0.2em] text-gold/70 mb-2">
                    Nombre
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    placeholder="Tu nombre"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="contact-phone" className="block text-xs uppercase tracking-[0.2em] text-gold/70 mb-2">
                    Teléfono
                  </label>
                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    placeholder="+52 ..."
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-xs uppercase tracking-[0.2em] text-gold/70 mb-2">
                  Email
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  placeholder="tu@email.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs uppercase tracking-[0.2em] text-gold/70 mb-2">
                  Mensaje
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={5}
                  placeholder="Cuéntanos qué fragancia buscas o en qué podemos ayudarte..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              <button
                type="submit"
                disabled={state === "loading"}
                className="w-full btn-luxury-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state === "loading" ? "Enviando..." : "Enviar mensaje"}
              </button>

              <p className="text-center text-xs text-cream/50 tracking-wide">
                También puedes escribirnos a{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-gold/80 hover:text-gold transition-colors"
                >
                  {CONTACT_EMAIL}
                </a>{" "}
                o por{" "}
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold/70 hover:text-gold transition-colors"
                >
                  WhatsApp
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
