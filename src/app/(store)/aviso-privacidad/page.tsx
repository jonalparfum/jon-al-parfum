import Link from "next/link";
import EmailLink from "@/components/EmailLink";
import { buildPageMetadata } from "@/lib/seo";
import { CONTACT_EMAIL } from "@/lib/contact";

export const metadata = buildPageMetadata({
  title: "Aviso de privacidad",
  description:
    "Aviso de privacidad de Jon Al Parfum: tratamiento de datos personales, derechos del usuario y medidas de seguridad.",
  path: "/aviso-privacidad",
  keywords: ["aviso de privacidad", "protección de datos", "Jon Al Parfum"],
});

export default function AvisoPrivacidadPage() {
  return (
    <div className="legal-page max-w-3xl mx-auto px-4 py-16 md:py-20">
      <h1>Aviso de privacidad</h1>
      <p className="text-cream/50 text-sm mb-8">Última actualización: agosto de 2026</p>

      <div className="space-y-4">
        <p>
          En cumplimiento de la normativa aplicable en materia de protección de
          datos personales, Jon Al Parfum informa a los usuarios de su sitio web{" "}
          <strong>www.jonalparfum.com</strong> sobre el tratamiento de sus datos
          personales.
        </p>

        <h2>1. Responsable del tratamiento</h2>
        <ul>
          <li>
            <strong>Identidad:</strong> Jon Al Parfum
          </li>
          <li>
            <strong>Correo electrónico:</strong> {CONTACT_EMAIL}
          </li>
          <li>
            <strong>Sitio web:</strong> www.jonalparfum.com
          </li>
        </ul>

        <h2>2. Datos que recopilamos</h2>
        <p>Podemos tratar las siguientes categorías de datos personales:</p>
        <ul>
          <li>
            <strong>Datos identificativos:</strong> nombre, correo electrónico,
            teléfono.
          </li>
          <li>
            <strong>Datos de cuenta:</strong> credenciales de acceso cifradas,
            historial de pedidos.
          </li>
          <li>
            <strong>Datos de compra:</strong> dirección de envío, productos
            adquiridos, importes y estado del pedido.
          </li>
          <li>
            <strong>Datos de pago:</strong> procesados de forma segura por
            Stripe. Jon Al Parfum no almacena números completos de tarjeta.
          </li>
          <li>
            <strong>Datos técnicos:</strong> dirección IP, tipo de navegador,
            dispositivo, cookies y datos de navegación.
          </li>
        </ul>

        <h2>3. Finalidad del tratamiento</h2>
        <ul>
          <li>Gestionar el registro de usuario y el acceso a la cuenta.</li>
          <li>Procesar pedidos, pagos, envíos y devoluciones.</li>
          <li>Atender consultas y solicitudes de soporte.</li>
          <li>Cumplir obligaciones legales, fiscales y contables.</li>
          <li>Mejorar la seguridad y el funcionamiento del sitio web.</li>
          <li>
            Enviar comunicaciones comerciales solo si ha otorgado su
            consentimiento expreso.
          </li>
        </ul>

        <h2>4. Derechos del usuario</h2>
        <p>
          Puede ejercer sus derechos de acceso, rectificación, supresión,
          limitación, oposición y portabilidad escribiendo a{" "}
          <EmailLink className="text-cream/80" />. También puede consultar
          nuestra <Link href="/politica-cookies">política de cookies</Link>.
        </p>

        <h2>5. Seguridad</h2>
        <p>
          Jon Al Parfum adopta medidas técnicas y organizativas para proteger
          sus datos personales, incluyendo cifrado SSL/TLS, contraseñas
          hasheadas y acceso restringido a la información.
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
