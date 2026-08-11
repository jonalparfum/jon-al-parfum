import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import {
  CONTACT_EMAIL,
  FACEBOOK_URL,
  LOCATION,
  SHIPPING_COVERAGE,
  WHATSAPP_DISPLAY,
  WHATSAPP_URL,
} from "@/lib/contact";

export default function Footer() {
  return (
    <footer className="relative bg-luxury-black border-t border-gold/10 mt-0">
      <div className="absolute top-0 left-0 right-0 section-divider" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          <div className="text-center md:text-left">
            <BrandLogo size="md" className="mx-auto md:mx-0 mb-5" />
            <h3 className="font-display text-2xl text-cream mb-2">Jon Al Parfum</h3>
            <p className="text-xs uppercase tracking-[0.3em] text-gold/80 mb-2">
              Perfumes que dejan huella
            </p>
            <p className="text-xs text-cream/40 mb-4">{LOCATION}</p>
            <p className="text-cream/50 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
              Fragancias de autor creadas con pasión y los más finos ingredientes.
              Cada perfume cuenta una historia única.
            </p>
          </div>

          <div className="text-center md:text-left">
            <h4 className="text-xs uppercase tracking-[0.25em] text-gold mb-5">
              Enlaces
            </h4>
            <ul className="space-y-3 text-sm text-cream/60">
              <li>
                <Link href="/tienda" className="hover:text-gold transition-colors duration-300">
                  Tienda
                </Link>
              </li>
              <li>
                <Link
                  href="/tienda?categoria=hombre"
                  className="hover:text-gold transition-colors duration-300"
                >
                  Perfumes Hombre
                </Link>
              </li>
              <li>
                <Link
                  href="/tienda?categoria=mujer"
                  className="hover:text-gold transition-colors duration-300"
                >
                  Perfumes Mujer
                </Link>
              </li>
              <li>
                <Link
                  href="/tienda?categoria=unisex"
                  className="hover:text-gold transition-colors duration-300"
                >
                  Unisex
                </Link>
              </li>
              <li>
                <Link href="/#contacto" className="hover:text-gold transition-colors duration-300">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-gold transition-colors duration-300">
                  Preguntas frecuentes
                </Link>
              </li>
              <li>
                <a
                  href="/aviso-privacidad.html"
                  className="hover:text-gold transition-colors duration-300"
                >
                  Aviso de privacidad
                </a>
              </li>
              <li>
                <Link
                  href="/politica-cookies"
                  className="hover:text-gold transition-colors duration-300"
                >
                  Política de cookies
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-center md:text-left">
            <h4 className="text-xs uppercase tracking-[0.25em] text-gold mb-5">
              Contacto
            </h4>
            <ul className="space-y-3 text-sm text-cream/60">
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="hover:text-gold transition-colors duration-300"
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors duration-300"
                >
                  WhatsApp: {WHATSAPP_DISPLAY}
                </a>
              </li>
              <li>{SHIPPING_COVERAGE}</li>
              <li>Lun – Vie: 9:00 – 18:00</li>
            </ul>

            <div className="flex items-center justify-center md:justify-start gap-4 mt-6">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-10 h-10 rounded-full border border-gold/20 flex items-center justify-center text-gold hover:border-gold/50 hover:bg-gold/5 transition-all duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full border border-gold/20 flex items-center justify-center text-gold hover:border-gold/50 hover:bg-gold/5 transition-all duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                  aria-hidden="true"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="section-divider my-10" />

        <div className="text-center text-sm text-cream/40 space-y-4">
          <p>&copy; {new Date().getFullYear()} Jon Al Parfum. Todos los derechos reservados.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/aviso-privacidad.html"
              className="text-xs uppercase tracking-[0.2em] text-cream/50 hover:text-gold transition-colors duration-300"
            >
              Aviso de privacidad
            </a>
            <span className="hidden sm:inline text-gold/20">|</span>
            <a
              href="/atrix.html"
              className="text-xs uppercase tracking-[0.2em] text-gold/70 hover:text-gold border border-gold/20 hover:border-gold/50 px-4 py-2 transition-all duration-300"
            >
              Desarrollado por ATRIX Technologies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
