import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="font-serif text-6xl text-gold mb-4">404</h1>
      <p className="text-charcoal/60 mb-8">
        No hemos encontrado la página que buscas.
      </p>
      <Link
        href="/"
        className="text-sm uppercase tracking-widest text-gold hover:text-charcoal border-b border-gold hover:border-charcoal pb-1 transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
