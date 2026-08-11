import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-charcoal text-cream mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-serif text-2xl mb-4">
              Jon Al <span className="text-gold">Parfum</span>
            </h3>
            <p className="text-cream/70 text-sm leading-relaxed">
              Fragancias de autor creadas con pasión y los más finos ingredientes.
              Cada perfume cuenta una historia única.
            </p>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-widest text-gold mb-4">
              Enlaces
            </h4>
            <ul className="space-y-2 text-sm text-cream/70">
              <li>
                <Link href="/tienda" className="hover:text-gold transition-colors">
                  Tienda
                </Link>
              </li>
              <li>
                <Link
                  href="/tienda?categoria=hombre"
                  className="hover:text-gold transition-colors"
                >
                  Perfumes Hombre
                </Link>
              </li>
              <li>
                <Link
                  href="/tienda?categoria=mujer"
                  className="hover:text-gold transition-colors"
                >
                  Perfumes Mujer
                </Link>
              </li>
              <li>
                <Link
                  href="/tienda?categoria=unisex"
                  className="hover:text-gold transition-colors"
                >
                  Unisex
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-widest text-gold mb-4">
              Contacto
            </h4>
            <ul className="space-y-2 text-sm text-cream/70">
              <li>info@jonalparfum.com</li>
              <li>+34 900 123 456</li>
              <li>Lun - Vie: 9:00 - 18:00</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-cream/10 mt-12 pt-8 text-center text-sm text-cream/50">
          <p>&copy; {new Date().getFullYear()} Jon Al Parfum. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
