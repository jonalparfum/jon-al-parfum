"use client";

import Link from "next/link";
import { Product } from "@/types";
import { formatPrice } from "@/lib/products";
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
            <span className="absolute top-3 left-3 bg-gold text-luxury-black text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 z-10 font-medium">
              Nuevo
            </span>
          )}
          {product.originalPrice && (
            <span className="absolute top-3 right-3 bg-red-900/90 text-cream text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 z-10">
              Oferta
            </span>
          )}
        </div>

        <div className="relative p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gold/80 mb-1.5">
            {product.category}
          </p>
          <h3 className="font-display text-lg text-cream group-hover:text-gold transition-colors duration-300">
            {product.name}
          </h3>
          <p className="text-sm text-cream/40 mt-1">{product.size}</p>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gold/10">
            <div>
              <span className="font-medium text-cream">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="ml-2 text-sm text-cream/30 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              className="text-[10px] uppercase tracking-[0.15em] text-gold border border-gold/40 hover:bg-gold hover:text-luxury-black px-3 py-1.5 transition-all duration-300"
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
