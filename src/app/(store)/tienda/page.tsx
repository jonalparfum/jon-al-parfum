import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getProductsFromDb } from "@/lib/products";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

  const filterClass = (active: boolean) =>
    active
      ? "bg-gold text-luxury-black border-gold"
      : "border-gold/20 text-cream/60 hover:border-gold/50 hover:text-gold";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="text-center mb-14">
        <p className="text-gold uppercase tracking-[0.35em] text-xs mb-4">
          Colección completa
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-cream mb-4">
          Tienda
        </h1>
        <p className="text-cream/50 max-w-xl mx-auto">
          {products.length} fragancias exclusivas para descubrir tu aroma perfecto
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-14">
        <Link
          href="/tienda"
          className={`px-5 py-2.5 text-xs uppercase tracking-[0.15em] border transition-all duration-300 ${filterClass(activeCategory === "all")}`}
        >
          Todos
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/tienda?categoria=${cat.slug}`}
            className={`px-5 py-2.5 text-xs uppercase tracking-[0.15em] border transition-all duration-300 ${filterClass(activeCategory === cat.slug)}`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <p className="text-center text-cream/50 py-16">
          No hay productos en esta categoría.
        </p>
      )}
    </div>
  );
}
