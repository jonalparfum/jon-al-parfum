import Link from "next/link";
import { Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import ShopSearch from "@/components/ShopSearch";
import { getProductsFromDb } from "@/lib/products";
import { getCatalogCategories, getShopSubcategories } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ categoria?: string; subcategoria?: string; q?: string }>;
};

export default async function ShopPage({ searchParams }: PageProps) {
  const { categoria, subcategoria, q } = await searchParams;
  const activeCategory = categoria || "all";
  const activeSubcategory = subcategoria || "all";
  const searchQuery = q?.trim() || "";

  const [products, categories, subcategories] = await Promise.all([
    getProductsFromDb({
      category: activeCategory,
      subcategory: activeSubcategory,
      search: searchQuery,
    }),
    getCatalogCategories(),
    activeCategory !== "all"
      ? getShopSubcategories(activeCategory)
      : Promise.resolve([]),
  ]);

  const currentCategory = categories.find((cat) => cat.slug === activeCategory);

  const filterClass = (active: boolean) =>
    active
      ? "bg-gold text-luxury-black border-gold"
      : "border-gold/20 text-cream/60 hover:border-gold/50 hover:text-gold";

  function buildHref(params: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    const cat = params.categoria ?? (activeCategory !== "all" ? activeCategory : undefined);
    const sub =
      params.subcategoria ??
      (activeSubcategory !== "all" ? activeSubcategory : undefined);
    const query = params.q ?? (searchQuery || undefined);

    if (cat && cat !== "all") sp.set("categoria", cat);
    if (sub && sub !== "all") sp.set("subcategoria", sub);
    if (query) sp.set("q", query);

    const qs = sp.toString();
    return qs ? `/tienda?${qs}` : "/tienda";
  }

  function categoryHref(slug: string) {
    return buildHref({
      categoria: slug === "all" ? undefined : slug,
      subcategoria: undefined,
    });
  }

  function subcategoryHref(catSlug: string, subSlug: string) {
    return buildHref({ categoria: catSlug, subcategoria: subSlug });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="text-center mb-10">
        <p className="text-gold uppercase tracking-[0.35em] text-xs mb-4">
          Colección completa
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-cream mb-4">
          Tienda
        </h1>
        <p className="text-cream/50 max-w-xl mx-auto">
          {searchQuery ? (
            <>
              {products.length} resultado{products.length === 1 ? "" : "s"} para{" "}
              <span className="text-gold/80">&ldquo;{searchQuery}&rdquo;</span>
            </>
          ) : (
            <>
              {products.length} perfumes originales para descubrir tu aroma perfecto
            </>
          )}
        </p>
      </div>

      <Suspense fallback={null}>
        <ShopSearch initialQuery={searchQuery} />
      </Suspense>

      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <Link
          href={categoryHref("all")}
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
        <div className="text-center py-16">
          <p className="text-cream/50 mb-4">
            {searchQuery
              ? `No encontramos perfumes con “${searchQuery}”.`
              : `No hay productos en esta categoría${activeSubcategory !== "all" ? " o subcategoría" : ""}.`}
          </p>
          {searchQuery && (
            <Link
              href={buildHref({ q: undefined })}
              className="text-sm uppercase tracking-wider text-gold hover:text-gold-light"
            >
              Limpiar búsqueda
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
