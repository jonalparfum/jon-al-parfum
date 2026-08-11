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
};
