import { prisma } from "@/lib/prisma";

export type CatalogSubcategory = {
  id: string;
  name: string;
  slug: string;
};

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  subcategories: CatalogSubcategory[];
};

export async function getCatalogCategories(): Promise<CatalogCategory[]> {
  const categories = await prisma.category.findMany({
    include: {
      subcategories: {
        where: {
          products: { some: { active: true } },
        },
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return categories;
}

/** Subcategorías con productos activos en una categoría (para filtros de tienda). */
export async function getShopSubcategories(
  categorySlug: string
): Promise<CatalogSubcategory[]> {
  return prisma.subcategory.findMany({
    where: {
      category: { slug: categorySlug },
      products: { some: { active: true } },
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
}
