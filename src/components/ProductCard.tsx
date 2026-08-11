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
      <article className="bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
        <div className="relative aspect-[3/4] overflow-hidden">
          <ProductImage
            src={product.image}
            alt={product.name}
            category={product.category}
            className="w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
          {product.new && (
            <span className="absolute top-3 left-3 bg-gold text-white text-xs uppercase tracking-wider px-2 py-1 z-10">
              Nuevo
            </span>
          )}
          {product.originalPrice && (
            <span className="absolute top-3 right-3 bg-red-600 text-white text-xs uppercase tracking-wider px-2 py-1 z-10">
              Oferta
            </span>
          )}
        </div>

        <div className="p-4">
          <p className="text-xs uppercase tracking-widest text-gold mb-1">
            {product.category}
          </p>
          <h3 className="font-serif text-lg text-charcoal group-hover:text-gold transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-charcoal/60 mt-1">{product.size}</p>

          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="font-medium text-charcoal">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="ml-2 text-sm text-charcoal/40 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              className="text-xs uppercase tracking-wider text-gold hover:text-charcoal border border-gold hover:border-charcoal px-3 py-1.5 transition-colors"
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
