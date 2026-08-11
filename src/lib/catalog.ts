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
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return categories;
}
