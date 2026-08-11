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
      className="w-full sm:w-auto bg-charcoal text-white px-12 py-4 text-sm uppercase tracking-widest hover:bg-gold transition-colors mb-8"
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
      <span className="text-3xl font-medium text-charcoal">
        {formatPrice(price)}
      </span>
      {originalPrice && (
        <span className="text-lg text-charcoal/40 line-through">
          {formatPrice(originalPrice)}
        </span>
      )}
      <span className="text-sm text-charcoal/60">{size}</span>
    </div>
  );
}
