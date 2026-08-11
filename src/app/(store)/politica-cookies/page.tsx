import Link from "next/link";

export const metadata = {
  title: "Política de cookies | Jon Al Parfum",
};

export default function PoliticaCookiesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-serif text-3xl text-charcoal mb-6">Política de cookies</h1>
      <div className="prose prose-sm text-charcoal/80 space-y-4 leading-relaxed">
        <p>
          En Jon Al Parfum utilizamos cookies y tecnologías similares para
          garantizar el correcto funcionamiento del sitio, recordar tus
          preferencias y mejorar la experiencia de navegación.
        </p>
        <h2 className="font-serif text-xl text-charcoal pt-4">¿Qué son las cookies?</h2>
        <p>
          Las cookies son pequeños archivos de texto que se almacenan en tu
          dispositivo cuando visitas nuestra web.
        </p>
        <h2 className="font-serif text-xl text-charcoal pt-4">Tipos de cookies que usamos</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Técnicas:</strong> necesarias para el carrito, la sesión y
            el funcionamiento básico de la tienda.
          </li>
          <li>
            <strong>Preferencias:</strong> guardan tu consentimiento de cookies
            y otras opciones de navegación.
          </li>
        </ul>
        <h2 className="font-serif text-xl text-charcoal pt-4">Gestión del consentimiento</h2>
        <p>
          Puedes aceptar o rechazar las cookies no esenciales mediante el aviso
          que aparece al entrar por primera vez. También puedes eliminar las
          cookies desde la configuración de tu navegador.
        </p>
        <p>
          Para cualquier consulta:{" "}
          <a href="mailto:info@jonalparfum.com" className="text-gold hover:underline">
            info@jonalparfum.com
          </a>
        </p>
      </div>
      <Link
        href="/"
        className="inline-block mt-10 text-sm uppercase tracking-widest text-gold hover:text-charcoal border-b border-gold hover:border-charcoal pb-1 transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
