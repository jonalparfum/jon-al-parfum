"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { WHATSAPP_NUMBER, CONTACT_EMAIL } from "@/lib/contact";
import ContactChannels from "@/components/ContactChannels";
import { isInViewport, shouldSkipEnterAnimations } from "@/lib/motion";

type FormState = "idle" | "loading" | "error";

const inputClass =
  "w-full bg-luxury-black/60 border border-gold/15 px-4 py-3.5 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold/50 focus:shadow-[0_0_20px_rgba(201,169,98,0.08)] transition-all duration-300";

const PHONE_PREFIX = "+52";

function formatPhoneDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, 10);
}

export default function ContactSection() {
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [showModal, setShowModal] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (
      shouldSkipEnterAnimations() ||
      document.documentElement.dataset.skipEnterMotion === "true" ||
      isInViewport(el)
    ) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function handlePhoneChange(value: string) {
    setPhoneDigits(formatPhoneDigits(value));
  }

  function handlePhoneKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === " ") {
      e.preventDefault();
    }
  }

  function handlePhonePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    setPhoneDigits(formatPhoneDigits(pasted));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");
    setShowModal(true);

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      phone: phoneDigits ? `${PHONE_PREFIX}${phoneDigits}` : "",
      message: String(data.get("message") ?? "").trim(),
    };

    const minDelay = new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const [res] = await Promise.all([
        fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
        minDelay,
      ]);

      const result = await res.json();

      if (!res.ok) {
        setShowModal(false);
        setErrorMsg(result.error || "No se pudo enviar el mensaje");
        setState("error");
        return;
      }

      setShowModal(false);
      setState("idle");
      form.reset();
      setPhoneDigits("");
    } catch {
      setShowModal(false);
      setErrorMsg("Error de conexión. Intenta de nuevo o escríbenos por WhatsApp.");
      setState("error");
    }
  }

  return (
    <>
      {showModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-sm px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-modal-title"
        >
          <div className="relative bg-luxury-panel border border-gold/25 p-10 md:p-12 max-w-sm w-full text-center gold-border-glow animate-fade-in-up">
            <div className="w-12 h-12 mx-auto mb-6 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
            <p
              id="contact-modal-title"
              className="font-display text-xl md:text-2xl text-cream mb-2"
            >
              Se pondrán en contacto enseguida
            </p>
            <p className="text-sm text-cream/50">Un momento, por favor...</p>
          </div>
        </div>
      )}

      <section
        id="contacto"
        ref={sectionRef}
        className="relative py-28 md:py-36 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-luxury-black via-luxury-panel/40 to-luxury-black" />
        <div className="absolute top-0 left-0 right-0 section-divider" />
        <div className="absolute inset-0 bg-radial-gold opacity-60 pointer-events-none" />

        <div
          className={`reveal-on-scroll relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 transition-transform duration-1000 ${
            visible ? "translate-y-0" : "translate-y-8"
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-stretch">
            <div className="flex flex-col">
              <p className="text-gold uppercase tracking-[0.4em] text-xs mb-5">
                Escríbenos
              </p>
              <h2 className="font-display text-4xl md:text-5xl text-cream leading-tight mb-6">
                Contacto
              </h2>
              <p className="text-cream/75 leading-relaxed mb-6 max-w-md">
                Desde Nuevo Laredo, Tamaulipas, atendemos consultas sobre perfumes,
                disponibilidad y pedidos especiales con envío a todo México.
              </p>

              <ContactChannels className="mb-8" />

              <div className="space-y-3 text-sm">
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

            <div className="relative flex flex-col h-full min-h-[520px] lg:min-h-0">
              <div className="absolute -inset-px bg-gradient-to-br from-gold/20 via-transparent to-gold/10 pointer-events-none" />
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="relative flex flex-col flex-1 h-full bg-luxury-panel/80 backdrop-blur-sm border border-gold/15 p-8 md:p-10 lg:p-12 space-y-5 lg:space-y-6 gold-border-glow"
              >
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
                    <div className="flex items-stretch">
                      <span className="inline-flex items-center px-3.5 bg-luxury-black/80 border border-gold/15 border-r-0 text-sm text-gold/80 shrink-0">
                        {PHONE_PREFIX}
                      </span>
                      <input
                        id="contact-phone"
                        name="phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        value={phoneDigits}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        onKeyDown={handlePhoneKeyDown}
                        onPaste={handlePhonePaste}
                        placeholder="tu numero"
                        maxLength={10}
                        className={`${inputClass} rounded-none border-l-0`}
                      />
                    </div>
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

                <div className="flex flex-col flex-1 min-h-[140px]">
                  <label htmlFor="contact-message" className="block text-xs uppercase tracking-[0.2em] text-gold/70 mb-2">
                    Mensaje
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={8}
                    placeholder="Cuéntanos qué fragancia buscas o en qué podemos ayudarte..."
                    className={`${inputClass} resize-none flex-1 min-h-[160px] lg:min-h-[220px]`}
                  />
                </div>

                <div className="mt-auto pt-2 space-y-5">
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
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
