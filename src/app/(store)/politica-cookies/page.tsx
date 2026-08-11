import Link from "next/link";
import EmailLink from "@/components/EmailLink";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Política de cookies",
  description:
    "Información sobre el uso de cookies en Jon Al Parfum: tipos de cookies, finalidad y cómo gestionar tu consentimiento.",
  path: "/politica-cookies",
  keywords: ["política de cookies", "Jon Al Parfum", "privacidad web"],
});

export default function PoliticaCookiesPage() {
  return (
    <div className="legal-page max-w-3xl mx-auto px-4 py-16 md:py-20">
      <h1>Política de cookies</h1>
      <div className="space-y-4">
        <p>
          En Jon Al Parfum utilizamos cookies y tecnologías similares para
          garantizar el correcto funcionamiento del sitio, recordar tus
          preferencias y mejorar la experiencia de navegación.
        </p>
        <h2>¿Qué son las cookies?</h2>
        <p>
          Las cookies son pequeños archivos de texto que se almacenan en tu
          dispositivo cuando visitas nuestra web.
        </p>
        <h2>Tipos de cookies que usamos</h2>
        <ul>
          <li>
            <strong>Técnicas:</strong> necesarias para el carrito, la sesión y
            el funcionamiento básico de la tienda.
          </li>
          <li>
            <strong>Preferencias:</strong> guardan tu consentimiento de cookies
            y otras opciones de navegación.
          </li>
        </ul>
        <h2>Gestión del consentimiento</h2>
        <p>
          Puedes aceptar o rechazar las cookies no esenciales mediante el aviso
          que aparece al entrar por primera vez. También puedes eliminar las
          cookies desde la configuración de tu navegador.
        </p>
        <p>
          Para cualquier consulta: <EmailLink className="text-cream/80" />
        </p>
      </div>
      <Link
        href="/"
        className="inline-block mt-10 text-sm uppercase tracking-widest text-gold hover:text-gold-light border-b border-gold/40 hover:border-gold pb-1 transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
