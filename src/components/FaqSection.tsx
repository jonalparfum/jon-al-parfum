"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    question: "¿Los productos de Jon Al Parfum son originales?",
    answer:
      "Sí. Trabajamos exclusivamente con fragancias auténticas de las casas perfumistas más reconocidas. Cada producto pasa por un control de calidad riguroso antes de llegar a tu puerta, garantizando su originalidad y frescura.",
  },
  {
    question: "¿Por qué confiar en nosotros?",
    answer:
      "Somos especialistas en perfumería de lujo con años de experiencia. Ofrecemos asesoramiento personalizado, embalaje premium, envíos seguros y atención al cliente dedicada. Tu satisfacción es nuestra prioridad.",
  },
  {
    question: "¿Cuánto tarda en llegar mi pedido?",
    answer:
      "Los pedidos en península se entregan en 24–48 horas laborables. Para Baleares, Canarias y envíos internacionales, el plazo puede extenderse entre 3 y 7 días hábiles. Recibirás un número de seguimiento en cuanto salga tu paquete.",
  },
  {
    question: "¿No encontraste el perfume que buscabas?",
    answer:
      "Escríbenos por WhatsApp o email con el nombre del perfume que deseas. Buscamos fragancias difíciles de encontrar y te confirmamos disponibilidad y precio en menos de 24 horas.",
  },
  {
    question: "¿Qué pasa si mi pedido llega dañado o incorrecto?",
    answer:
      "Contáctanos en las primeras 48 horas con fotos del producto y del embalaje. Te enviaremos un reemplazo sin coste adicional o gestionaremos el reembolso completo, según prefieras.",
  },
];

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
  index,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <div
      className="border border-gold/10 bg-luxury-panel/80 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-gold/25"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-5 md:px-7 md:py-6 text-left group"
        aria-expanded={isOpen}
      >
        <span className="text-sm md:text-base text-cream/90 group-hover:text-gold transition-colors duration-300 pr-4">
          {question}
        </span>
        <span
          className={`flex-shrink-0 w-9 h-9 rounded-full border border-gold/30 flex items-center justify-center text-gold transition-all duration-500 ${
            isOpen ? "rotate-45 bg-gold/10 border-gold/60" : "group-hover:border-gold/50"
          }`}
          aria-hidden="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </span>
      </button>

      <div
        className={`grid transition-all duration-500 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 md:px-7 md:pb-6 pt-0">
            <div className="h-px bg-gradient-to-r from-gold/30 via-gold/10 to-transparent mb-4" />
            <p className="text-sm text-cream/60 leading-relaxed">{answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-gold pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 section-divider" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 animate-fade-in-up">
          <p className="text-gold uppercase tracking-[0.35em] text-xs mb-4">
            Resolvemos tus dudas
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-cream tracking-wide">
            Preguntas frecuentes
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => (
            <FaqItem
              key={item.question}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              index={index}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 section-divider mt-12" />
    </section>
  );
}
