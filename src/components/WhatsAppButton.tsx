"use client";

import { WHATSAPP_URL } from "@/lib/contact";
import { WhatsAppIcon } from "@/components/SocialIcons";

export default function WhatsAppButton() {
  return (
    <div className="fixed bottom-24 right-5 md:bottom-8 md:right-8 z-40">
      {/* Fragrance mist rising from button */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="whatsapp-scent-ring absolute rounded-full border border-gold/30"
            style={{ animationDelay: `${i * 0.8}s` }}
          />
        ))}
        {[0, 1, 2].map((i) => (
          <span
            key={`p-${i}`}
            className="fragrance-particle-sm absolute"
            style={{
              left: `${30 + i * 20}%`,
              animationDelay: `${i * 1.2}s`,
            }}
          />
        ))}
      </div>

      <a
        href={process.env.NEXT_PUBLIC_WHATSAPP_URL ?? WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="relative flex w-14 h-14 rounded-full bg-gold-gradient border border-gold-light/50 text-luxury-black items-center justify-center shadow-lg shadow-black/50 ring-2 ring-gold/20 hover:scale-110 hover:border-gold-light hover:ring-gold/40 transition-all duration-500 whatsapp-scent-btn group"
      >
        <WhatsAppIcon className="w-7 h-7 relative z-10 group-hover:scale-105 transition-transform duration-300" />
      </a>
    </div>
  );
}
