import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import ContactChannels from "@/components/ContactChannels";
import {
  LOCATION,
  SHIPPING_COVERAGE,
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
            <p className="text-cream/70 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
              Vendemos perfumes 100% originales de las mejores marcas internacionales.
              Asesoría personalizada y envíos a todo México.
            </p>
          </div>

          <div className="text-center md:text-left">
            <h4 className="text-xs uppercase tracking-[0.25em] text-gold mb-5">
              Enlaces
            </h4>
            <ul className="space-y-3 text-sm text-cream/75">
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
            <ContactChannels />

            <ul className="space-y-2 text-sm text-cream/70 mt-5">
              <li>{SHIPPING_COVERAGE}</li>
              <li>Lun – Vie: 9:00 – 18:00</li>
            </ul>
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
