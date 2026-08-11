"use client";

import { Product } from "@/types";
import { formatPrice } from "@/lib/products";
import { useCart } from "@/context/CartContext";

type AddToCartButtonProps = {
  product: Product;
};

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem, openCart } = useCart();

  return (
    <button
      onClick={() => {
        addItem(product);
        openCart();
      }}
      className="w-full sm:w-auto bg-gold text-luxury-black px-12 py-4 text-sm uppercase tracking-widest hover:bg-gold-light transition-colors mb-8 font-medium"
    >
      Añadir al carrito
    </button>
  );
}

export function ProductPrice({
  price,
  originalPrice,
  size,
}: {
  price: number;
  originalPrice?: number;
  size: string;
}) {
  return (
    <div className="flex items-baseline gap-3 mb-8">
      <span className="text-3xl font-medium text-cream">
        {formatPrice(price)}
      </span>
      {originalPrice && (
        <span className="text-lg text-cream/30 line-through">
          {formatPrice(originalPrice)}
        </span>
      )}
      <span className="text-sm text-cream/50">{size}</span>
    </div>
  );
}
