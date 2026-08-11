import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="font-serif text-3xl mb-4">Pago cancelado</h1>
      <p className="text-charcoal/60 mb-8 max-w-md">
        No se ha realizado ningún cargo. Tu carrito sigue disponible para cuando
        quieras continuar.
      </p>
      <Link
        href="/tienda"
        className="bg-charcoal text-white px-6 py-3 text-sm uppercase tracking-wider hover:bg-gold transition-colors"
      >
        Volver a la tienda
      </Link>
    </div>
  );
}
