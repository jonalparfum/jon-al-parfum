import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getProductsFromDb } from "@/lib/products";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams: Promise<{ categoria?: string }>;
};

export default async function ShopPage({ searchParams }: PageProps) {
  const { categoria } = await searchParams;
  const activeCategory = categoria || "all";

  const [products, categories] = await Promise.all([
    getProductsFromDb({ category: activeCategory }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <p className="text-gold uppercase tracking-[0.2em] text-sm mb-3">
          Colección completa
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-4">
          Tienda
        </h1>
        <p className="text-charcoal/60 max-w-xl mx-auto">
          {products.length} fragancias exclusivas para descubrir tu aroma perfecto
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-12">
        <Link
          href="/tienda"
          className={`px-5 py-2 text-sm uppercase tracking-wider border transition-colors ${
            activeCategory === "all"
              ? "bg-charcoal text-white border-charcoal"
              : "border-charcoal/20 text-charcoal/70 hover:border-gold hover:text-gold"
          }`}
        >
          Todos
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/tienda?categoria=${cat.slug}`}
            className={`px-5 py-2 text-sm uppercase tracking-wider border transition-colors ${
              activeCategory === cat.slug
                ? "bg-charcoal text-white border-charcoal"
                : "border-charcoal/20 text-charcoal/70 hover:border-gold hover:text-gold"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <p className="text-center text-charcoal/60 py-12">
          No hay productos en esta categoría.
        </p>
      )}
    </div>
  );
}
