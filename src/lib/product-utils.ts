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

export function parseImages(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string" && !!item)
      : [];
  } catch {
    return [];
  }
}

export function serializeImages(images: string[]): string {
  return JSON.stringify(images.filter(Boolean));
}

export function resolveProductImages(image: string, imagesJson?: string | null) {
  const parsed = parseImages(imagesJson);
  if (parsed.length > 0) return parsed;
  return image ? [image] : [];
}

export function toProductDTO(product: ProductWithCategory): Product {
  const images = resolveProductImages(product.image, product.images);
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    description: product.description,
    price: product.price,
    originalPrice: product.originalPrice ?? undefined,
    image: images[0] || product.image,
    images,
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
  images: string[];
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
  const images = (form.images?.length ? form.images : form.image ? [form.image] : [])
    .map((url) => url.trim())
    .filter(Boolean);
  const primaryImage =
    images[0] || form.image.trim() || "/uploads/products/placeholder.jpg";

  return {
    ...form,
    slug: form.slug.trim() || undefined,
    subcategoryId: form.subcategoryId?.trim() ? form.subcategoryId : null,
    originalPrice: form.originalPrice ?? null,
    images,
    image: primaryImage,
  };
}
