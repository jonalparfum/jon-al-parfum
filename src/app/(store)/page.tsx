import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import FaqSection from "@/components/FaqSection";
import { getFeaturedProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-luxury-black" />
        <div className="absolute inset-0 grain-overlay opacity-60" />
        <div className="absolute inset-0 bg-radial-gold" />

        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-gold/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/8 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-20 pb-16">
          <div className="animate-fade-in-up mb-8">
            <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto animate-float">
              <Image
                src="/logo-jon-al-parfum.png"
                alt="Jon Al Parfum — Perfumes que dejan huella"
                fill
                className="object-contain drop-shadow-[0_0_40px_rgba(201,169,98,0.25)]"
                priority
              />
            </div>
          </div>

          <p
            className="text-gold uppercase tracking-[0.4em] text-xs md:text-sm mb-6 animate-fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            Perfumes que dejan huella
          </p>

          <p
            className="text-cream/60 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed animate-fade-in-up"
            style={{ animationDelay: "400ms" }}
          >
            Descubre fragancias únicas que cuentan historias. Cada perfume es una
            obra de arte olfativa, creada con los ingredientes más selectos.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up"
            style={{ animationDelay: "600ms" }}
          >
            <Link href="/tienda" className="btn-luxury-primary">
              Explorar colección
            </Link>
            <Link href="/#faq" className="btn-luxury-outline">
              Preguntas frecuentes
            </Link>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
            <div className="w-px h-12 bg-gradient-to-b from-gold/60 to-transparent mx-auto" />
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-24 md:py-32 relative">
        <div className="absolute top-0 left-0 right-0 section-divider" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-gold uppercase tracking-[0.35em] text-xs mb-4">
              Selección exclusiva
            </p>
            <h2 className="font-display text-3xl md:text-5xl text-cream">
              Destacados
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-14">
            <Link
              href="/tienda"
              className="inline-block text-xs uppercase tracking-[0.25em] text-gold hover:text-gold-light border-b border-gold/40 hover:border-gold pb-1 transition-all duration-300"
            >
              Ver toda la colección
            </Link>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 md:py-32 bg-luxury-panel/50 relative overflow-hidden">
        <div className="absolute inset-0 grain-overlay opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {[
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                ),
                title: "Ingredientes premium",
                desc: "Seleccionamos las materias primas más finas de Grasse, Marrakech y más allá.",
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                ),
                title: "Hecho con pasión",
                desc: "Cada fragancia es elaborada artesanalmente en pequeños lotes.",
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                ),
                title: "Envío gratuito",
                desc: "En pedidos superiores a 75€. Entrega en 24–48h en península.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-gold/20 flex items-center justify-center group-hover:border-gold/50 group-hover:shadow-[0_0_24px_rgba(201,169,98,0.15)] transition-all duration-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1}
                    stroke="currentColor"
                    className="w-7 h-7 text-gold"
                  >
                    {item.icon}
                  </svg>
                </div>
                <h3 className="font-display text-xl text-cream mb-3">{item.title}</h3>
                <p className="text-cream/50 text-sm leading-relaxed max-w-xs mx-auto">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FaqSection />
    </>
  );
}
