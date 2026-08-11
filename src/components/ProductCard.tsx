"use client";

import Link from "next/link";
import { Product } from "@/types";
import { formatPrice } from "@/lib/product-utils";
import { useCart } from "@/context/CartContext";
import ProductImage from "@/components/ProductImage";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, openCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    openCart();
  };

  return (
    <Link href={`/tienda/${product.id}`} className="group block">
      <article className="relative bg-luxury-panel border border-gold/10 overflow-hidden transition-all duration-500 hover:border-gold/30 hover:shadow-[0_8px_40px_rgba(201,169,98,0.12)] gold-border-glow">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-t from-gold/5 to-transparent" />

        <div className="relative aspect-[3/4] overflow-hidden bg-luxury-muted">
          <ProductImage
            src={product.image}
            alt={product.name}
            category={product.category}
            className="w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {product.new && (
            <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-gold text-luxury-black text-[8px] sm:text-[10px] uppercase tracking-[0.12em] sm:tracking-[0.15em] px-1.5 sm:px-2.5 py-0.5 sm:py-1 z-10 font-medium">
              Nuevo
            </span>
          )}
          {product.originalPrice && (
            <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-red-900/90 text-cream text-[8px] sm:text-[10px] uppercase tracking-[0.12em] sm:tracking-[0.15em] px-1.5 sm:px-2.5 py-0.5 sm:py-1 z-10">
              Oferta
            </span>
          )}
        </div>

        <div className="relative p-3 sm:p-5">
          <p className="text-[8px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-gold/80 mb-1">
            {product.category}
          </p>
          <h3 className="font-display text-sm sm:text-lg text-cream group-hover:text-gold transition-colors duration-300 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm text-cream/40 mt-0.5 sm:mt-1">{product.size}</p>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gold/10">
            <div>
              <span className="font-medium text-cream text-sm sm:text-base">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-cream/30 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              className="text-[8px] sm:text-[10px] uppercase tracking-[0.12em] sm:tracking-[0.15em] text-gold border border-gold/40 hover:bg-gold hover:text-luxury-black px-2 sm:px-3 py-1 sm:py-1.5 transition-all duration-300 w-full sm:w-auto text-center"
              aria-label={`Añadir ${product.name} al carrito`}
            >
              Añadir
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
