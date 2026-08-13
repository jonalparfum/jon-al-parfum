export type ProductVariant = {
  id: string;
  label: string;
  price: number;
  stock: number;
  sortOrder: number;
  active: boolean;
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: "hombre" | "mujer" | "unisex";
  notes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  size: string;
  stock: number;
  variants?: ProductVariant[];
  featured?: boolean;
  new?: boolean;
};

export type ProductSort =
  | "newest"
  | "bestsellers"
  | "name-asc"
  | "price-desc";

export type CartItem = {
  product: Product;
  quantity: number;
  variantId?: string;
  variantLabel?: string;
  unitPrice: number;
  maxStock: number;
};

export function cartItemKey(item: CartItem): string {
  return item.variantId
    ? `${item.product.id}:${item.variantId}`
    : item.product.id;
}
