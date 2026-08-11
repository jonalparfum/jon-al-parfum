import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductFromDb } from "@/lib/products";
import AddToCartButton, { ProductPrice } from "@/components/AddToCartButton";
import ProductImage from "@/components/ProductImage";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductFromDb(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="text-sm text-charcoal/60 mb-8">
        <Link href="/" className="hover:text-gold transition-colors">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <Link href="/tienda" className="hover:text-gold transition-colors">
          Tienda
        </Link>
        <span className="mx-2">/</span>
        <span className="text-charcoal">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        <ProductImage
          src={product.image}
          alt={product.name}
          category={product.category}
          className="aspect-[3/4] max-h-[600px] rounded-sm"
          priority
        />

        <div className="flex flex-col justify-center">
          <p className="text-gold uppercase tracking-[0.2em] text-sm mb-2">
            {product.brand} · {product.category}
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-4">
            {product.name}
          </h1>
          <p className="text-charcoal/70 leading-relaxed mb-6">
            {product.description}
          </p>

          <ProductPrice
            price={product.price}
            originalPrice={product.originalPrice}
            size={product.size}
          />

          <AddToCartButton product={product} />

          <div className="border-t border-gold/10 pt-8">
            <h2 className="font-serif text-xl mb-4">Notas olfativas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <h3 className="text-xs uppercase tracking-widest text-gold mb-2">
                  Salida
                </h3>
                <ul className="text-sm text-charcoal/70 space-y-1">
                  {product.notes.top.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-widest text-gold mb-2">
                  Corazón
                </h3>
                <ul className="text-sm text-charcoal/70 space-y-1">
                  {product.notes.heart.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-widest text-gold mb-2">
                  Fondo
                </h3>
                <ul className="text-sm text-charcoal/70 space-y-1">
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
