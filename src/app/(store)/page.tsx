import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import BrandLogo from "@/components/BrandLogo";
import FaqSection from "@/components/FaqSection";
import ContactSection from "@/components/ContactSection";
import RevealOnScroll from "@/components/RevealOnScroll";
import FragranceMist from "@/components/FragranceMist";
import DailyPerfumeTip from "@/components/DailyPerfumeTip";
import { getFeaturedProducts } from "@/lib/products";
import { LOCATION, SHIPPING_COVERAGE } from "@/lib/contact";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <>
      {/* Hero */}
      <section className="hero-section relative min-h-[100svh] flex items-center overflow-x-hidden bg-luxury-black">
        <div className="hero-ambient pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 grain-overlay opacity-25 hidden md:block" />
          <FragranceMist />

          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-radial-gold opacity-80" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/5 rounded-full blur-[80px] max-md:blur-0 max-md:opacity-40" />
          <div className="absolute top-20 right-0 w-72 h-72 bg-gold/8 rounded-full blur-[80px] max-md:blur-0 max-md:opacity-30 md:animate-pulse-glow" />

          <div className="absolute left-8 md:left-16 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-gold/20 to-transparent hidden lg:block" />
          <div className="absolute right-8 md:right-16 top-1/3 bottom-1/3 w-px bg-gradient-to-b from-transparent via-gold/15 to-transparent hidden lg:block" />
        </div>

        <div className="hero-content relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 md:pt-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Logo */}
            <div className="flex justify-center lg:justify-end order-1 lg:order-none">
              <div className="relative min-h-[200px] sm:min-h-[240px] md:min-h-0 max-md:animate-none md:animate-float max-md:scale-[1.35] md:scale-100 origin-center max-md:mb-6">
                <BrandLogo size="hero" priority className="mx-auto" />
                <div className="absolute inset-0 -z-10 blur-3xl bg-gold/10 scale-75 rounded-full" />
              </div>
            </div>

            {/* Copy */}
            <div className="text-center lg:text-left order-2">
              <div className="inline-flex items-center gap-3 mb-8 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
                <span className="h-px w-8 bg-gold/50" />
                <span className="text-[10px] uppercase tracking-[0.35em] text-gold/80">
                  {LOCATION}
                </span>
                <span className="h-px w-8 bg-gold/50 hidden sm:block" />
              </div>

              <p
                className="text-gold uppercase tracking-[0.45em] text-[10px] md:text-xs mb-5 animate-fade-in-up"
                style={{ animationDelay: "30ms" }}
              >
                Perfumes que dejan huella
              </p>

              <h1
                className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-cream leading-[1.1] mb-6 animate-fade-in-up"
                style={{ animationDelay: "60ms" }}
              >
                La esencia del
                <span className="block luxury-gradient-text mt-1">lujo olfativo</span>
              </h1>

              <p
                className="text-cream/75 text-base md:text-lg max-w-lg mx-auto lg:mx-0 mb-4 leading-relaxed font-light animate-fade-in-up"
                style={{ animationDelay: "90ms" }}
              >
                Perfumes originales de las mejores casas perfumistas.
                Te ayudamos a encontrar la fragancia perfecta para ti.
              </p>

              <p
                className="text-gold/80 text-xs uppercase tracking-[0.25em] mb-6 animate-fade-in-up"
                style={{ animationDelay: "110ms" }}
              >
                {SHIPPING_COVERAGE}
              </p>

              <DailyPerfumeTip className="mb-8 max-w-lg mx-auto lg:mx-0" />

              <div
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up"
                style={{ animationDelay: "140ms" }}
              >
                <Link href="/tienda" className="btn-luxury-primary">
                  Explorar colección
                </Link>
                <Link href="/#contacto" className="btn-luxury-outline">
                  Contáctanos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee strip */}
      <div className="border-y border-gold/10 bg-luxury-panel/30 overflow-hidden py-4">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <span
              key={i}
              className="text-[10px] uppercase tracking-[0.5em] text-gold/40 mx-8"
            >
              Jon Al Parfum · Nuevo Laredo · Envíos nacionales · Perfumes originales ·
              Asesoría personalizada ·
            </span>
          ))}
        </div>
      </div>

      {/* Story */}
      <section className="py-28 md:py-36 relative">
        <div className="absolute top-0 left-0 right-0 section-divider" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-center">
              <div className="md:col-span-5">
                <p className="text-gold uppercase tracking-[0.4em] text-[10px] mb-5">
                  Nuestra historia
                </p>
                <h2 className="font-display text-3xl md:text-4xl text-cream leading-snug">
                  Elegancia desde la frontera
                </h2>
              </div>
              <div className="md:col-span-7 space-y-5 text-cream/75 leading-relaxed font-light">
                <p>
                  Jon Al Parfum es tu tienda de confianza en Nuevo Laredo.
                  Vendemos las fragancias más exclusivas del mundo a quienes
                  valoran la autenticidad y el buen gusto.
                </p>
                <p>
                  Curamos cada perfume del catálogo con criterio, ofrecemos
                  atención personalizada y enviamos con cuidado a cualquier
                  rincón de México.
                </p>
                <Link
                  href="/tienda"
                  className="inline-block mt-4 text-xs uppercase tracking-[0.3em] text-gold hover:text-gold-light border-b border-gold/30 hover:border-gold pb-1 transition-all duration-300"
                >
                  Ver catálogo
                </Link>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Featured */}
      <section className="py-28 md:py-36 relative bg-luxury-panel/20 overflow-hidden">
        <div className="absolute inset-0 grain-overlay opacity-15" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll className="text-center mb-16">
            <p className="text-gold uppercase tracking-[0.4em] text-[10px] mb-5">
              Selección exclusiva
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-cream">
              Destacados
            </h2>
          </RevealOnScroll>

          <RevealOnScroll delay={40}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </RevealOnScroll>

          <RevealOnScroll className="text-center mt-16" delay={60}>
            <Link href="/tienda" className="btn-luxury-outline">
              Ver toda la colección
            </Link>
          </RevealOnScroll>
        </div>
      </section>

      {/* Values */}
      <section className="py-28 md:py-36 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 section-divider" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll className="text-center mb-16">
            <p className="text-gold uppercase tracking-[0.4em] text-[10px] mb-5">
              Por qué elegirnos
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-cream">
              Experiencia premium
            </h2>
          </RevealOnScroll>

          <RevealOnScroll delay={40}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gold/10">
              {[
                {
                  num: "01",
                  title: "100% originales",
                  desc: "Vendemos fragancias auténticas de las casas perfumistas más prestigiosas del mundo.",
                },
                {
                  num: "02",
                  title: "Envío nacional",
                  desc: "Desde Nuevo Laredo enviamos a todo México con empaque seguro y rastreo.",
                },
                {
                  num: "03",
                  title: "Atención personal",
                  desc: "Asesoría por WhatsApp, Facebook o formulario. Te ayudamos a encontrar tu aroma ideal.",
                },
              ].map((item) => (
                <div
                  key={item.num}
                  className="bg-luxury-black p-10 md:p-12 h-full group hover:bg-luxury-panel/50 transition-colors duration-500"
                >
                  <span className="text-gold/30 font-display text-3xl mb-6 block group-hover:text-gold/50 transition-colors">
                    {item.num}
                  </span>
                  <h3 className="font-display text-xl text-cream mb-4">{item.title}</h3>
                  <p className="text-cream/70 text-sm leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <ContactSection />
      <FaqSection />
    </>
  );
}
