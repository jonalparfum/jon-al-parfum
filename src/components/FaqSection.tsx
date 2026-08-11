"use client";

import { useState } from "react";
import { FAQ_ITEMS } from "@/lib/faq-data";

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="group border border-gold/10 bg-luxury-panel/40 overflow-hidden transition-all duration-500 hover:border-gold/30 hover:bg-luxury-panel/60">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-6 md:px-8 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-sm md:text-base text-cream/90 group-hover:text-gold transition-colors duration-300 pr-4 font-light">
          {question}
        </span>
        <span
          className={`flex-shrink-0 w-8 h-8 flex items-center justify-center text-gold transition-all duration-500 ${
            isOpen ? "rotate-45" : ""
          }`}
          aria-hidden="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
            className="w-5 h-5"
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
          <div className="px-6 pb-6 md:px-8 md:pb-7">
            <div className="h-px bg-gradient-to-r from-gold/40 via-gold/10 to-transparent mb-5" />
            <p className="text-sm text-cream/75 leading-relaxed font-light">{answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-28 md:py-36 relative overflow-hidden">
      <div className="absolute inset-0 bg-luxury-black" />
      <div className="absolute top-0 left-0 right-0 section-divider" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-gold uppercase tracking-[0.45em] text-[10px] mb-5">
            Resolvemos tus dudas
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-cream tracking-wide">
            Preguntas frecuentes
          </h2>
        </div>

        <div className="space-y-2">
          {FAQ_ITEMS.map((item, index) => (
            <FaqItem
              key={item.question}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
