import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="font-serif text-6xl text-gold mb-4">404</h1>
      <p className="text-cream/75 mb-8">
        No hemos encontrado la página que buscas.
      </p>
      <Link
        href="/"
        className="text-sm uppercase tracking-widest text-gold hover:text-gold-light border-b border-gold/40 hover:border-gold pb-1 transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
