import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductFromDb } from "@/lib/products";
import ProductPurchasePanel from "@/components/ProductPurchasePanel";
import ProductGallery from "@/components/ProductGallery";
import JsonLd from "@/components/JsonLd";
import {
  breadcrumbJsonLd,
  buildPageMetadata,
  productJsonLd,
  resolveImageUrl,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductFromDb(id);

  if (!product) {
    return buildPageMetadata({
      title: "Producto no encontrado",
      description: "El perfume que buscas no está disponible en Jon Al Parfum.",
      path: `/tienda/${id}`,
      noIndex: true,
    });
  }

  const description =
    product.description.length > 155
      ? `${product.description.slice(0, 152)}...`
      : product.description;

  return buildPageMetadata({
    title: `${product.name} · ${product.brand}`,
    description: `${description} ${product.size}. Perfume original con envío a todo México.`,
    path: `/tienda/${product.id}`,
    image: resolveImageUrl(product.image),
    keywords: [
      product.name,
      product.brand,
      `perfume ${product.category}`,
      "perfume original",
      "Jon Al Parfum",
    ],
  });
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductFromDb(id);

  if (!product) {
    notFound();
  }

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Inicio", path: "/" },
    { name: "Tienda", path: "/tienda" },
    { name: product.name, path: `/tienda/${product.id}` },
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <JsonLd data={[productJsonLd(product), breadcrumbs]} />

      <nav className="text-sm text-cream/50 mb-8" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-gold transition-colors">
          Inicio
        </Link>
        <span className="mx-2 text-gold/30">/</span>
        <Link href="/tienda" className="hover:text-gold transition-colors">
          Tienda
        </Link>
        <span className="mx-2 text-gold/30">/</span>
        <span className="text-cream">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        <ProductGallery
          images={product.images?.length ? product.images : [product.image]}
          alt={product.name}
          category={product.category}
        />

        <div className="flex flex-col justify-center">
          <p className="text-gold uppercase tracking-[0.2em] text-sm mb-2">
            {product.brand} · {product.category}
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-cream mb-4">
            {product.name}
          </h1>
          <p className="text-cream/60 leading-relaxed mb-6">
            {product.description}
          </p>

          <ProductPurchasePanel product={product} />

          <div className="border-t border-gold/10 pt-8">
            <h2 className="font-display text-xl text-cream mb-4">Notas olfativas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <h3 className="text-xs uppercase tracking-widest text-gold mb-2">
                  Salida
                </h3>
                <ul className="text-sm text-cream/60 space-y-1">
                  {product.notes.top.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-widest text-gold mb-2">
                  Corazón
                </h3>
                <ul className="text-sm text-cream/60 space-y-1">
                  {product.notes.heart.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-widest text-gold mb-2">
                  Fondo
                </h3>
                <ul className="text-sm text-cream/60 space-y-1">
                  {product.notes.base.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
