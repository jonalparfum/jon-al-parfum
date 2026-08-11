import { Product as PrismaProduct, Category } from "@prisma/client";
import { Product } from "@/types";

export type ProductWithCategory = PrismaProduct & { category: Category };

export function parseNotes(json: string): string[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function serializeNotes(notes: string[]): string {
  return JSON.stringify(notes);
}

export function toProductDTO(product: ProductWithCategory): Product {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    description: product.description,
    price: product.price,
    originalPrice: product.originalPrice ?? undefined,
    image: product.image,
    category: product.category.slug as Product["category"],
    notes: {
      top: parseNotes(product.notesTop),
      heart: parseNotes(product.notesHeart),
      base: parseNotes(product.notesBase),
    },
    size: product.size,
    featured: product.featured,
    new: product.isNew,
  };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(price);
}

export type ProductFormPayload = {
  name: string;
  slug: string;
  brand: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  size: string;
  notesTop: string[];
  notesHeart: string[];
  notesBase: string[];
  featured: boolean;
  isNew: boolean;
  stock: number;
  active: boolean;
  categoryId: string;
  subcategoryId?: string;
};

export function prepareProductPayload(form: ProductFormPayload) {
  return {
    ...form,
    slug: form.slug.trim() || undefined,
    subcategoryId: form.subcategoryId?.trim() ? form.subcategoryId : null,
    originalPrice: form.originalPrice ?? null,
  };
}
