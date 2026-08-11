import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getProductsFromDb } from "@/lib/products";
import { getCatalogCategories } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ categoria?: string; subcategoria?: string }>;
};

export default async function ShopPage({ searchParams }: PageProps) {
  const { categoria, subcategoria } = await searchParams;
  const activeCategory = categoria || "all";
  const activeSubcategory = subcategoria || "all";

  const [products, categories] = await Promise.all([
    getProductsFromDb({
      category: activeCategory,
      subcategory: activeSubcategory,
    }),
    getCatalogCategories(),
  ]);

  const currentCategory = categories.find((cat) => cat.slug === activeCategory);
  const subcategories = currentCategory?.subcategories ?? [];

  const filterClass = (active: boolean) =>
    active
      ? "bg-gold text-luxury-black border-gold"
      : "border-gold/20 text-cream/60 hover:border-gold/50 hover:text-gold";

  function categoryHref(slug: string) {
    return slug === "all" ? "/tienda" : `/tienda?categoria=${slug}`;
  }

  function subcategoryHref(catSlug: string, subSlug: string) {
    return `/tienda?categoria=${catSlug}&subcategoria=${subSlug}`;
  }

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
          {products.length} perfumes originales para descubrir tu aroma perfecto
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <Link
          href="/tienda"
          className={`px-5 py-2.5 text-xs uppercase tracking-[0.15em] border transition-all duration-300 ${filterClass(activeCategory === "all")}`}
        >
          Todos
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={categoryHref(cat.slug)}
            className={`px-5 py-2.5 text-xs uppercase tracking-[0.15em] border transition-all duration-300 ${filterClass(activeCategory === cat.slug)}`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {activeCategory !== "all" && subcategories.length > 0 && (
        <div className="mb-14 max-w-3xl mx-auto">
          <p className="text-center text-[10px] uppercase tracking-[0.25em] text-gold/60 mb-3">
            Subcategorías · {currentCategory?.name}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href={categoryHref(activeCategory)}
              className={`px-4 py-2 text-[11px] uppercase tracking-[0.12em] border transition-all duration-300 ${filterClass(activeSubcategory === "all")}`}
            >
              Todas
            </Link>
            {subcategories.map((sub) => (
              <Link
                key={sub.id}
                href={subcategoryHref(activeCategory, sub.slug)}
                className={`px-4 py-2 text-[11px] uppercase tracking-[0.12em] border transition-all duration-300 ${filterClass(activeSubcategory === sub.slug)}`}
              >
                {sub.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <p className="text-center text-cream/50 py-16">
          No hay productos en esta categoría
          {activeSubcategory !== "all" ? " o subcategoría" : ""}.
        </p>
      )}
    </div>
  );
}
