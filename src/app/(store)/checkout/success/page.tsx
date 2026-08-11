import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-8 h-8 text-green-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
      </div>
      <h1 className="font-serif text-3xl mb-4">¡Gracias por tu compra!</h1>
      <p className="text-charcoal/60 mb-8 max-w-md">
        Tu pedido ha sido confirmado. Recibirás un email con los detalles del
        envío.
      </p>
      <div className="flex gap-4">
        <Link
          href="/cuenta"
          className="bg-charcoal text-white px-6 py-3 text-sm uppercase tracking-wider hover:bg-gold transition-colors"
        >
          Ver mis pedidos
        </Link>
        <Link
          href="/tienda"
          className="border border-charcoal px-6 py-3 text-sm uppercase tracking-wider hover:border-gold hover:text-gold transition-colors"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
