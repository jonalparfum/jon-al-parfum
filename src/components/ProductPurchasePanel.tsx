"use client";

import { useMemo, useState } from "react";
import { Product } from "@/types";
import { formatPrice } from "@/lib/product-utils";
import { productHasStock } from "@/lib/product-variants";
import { useCart } from "@/context/CartContext";

type ProductPurchasePanelProps = {
  product: Product;
};

export default function ProductPurchasePanel({
  product,
}: ProductPurchasePanelProps) {
  const { addItem, openCart } = useCart();
  const hasVariants = Boolean(product.variants?.length);
  const inStock = productHasStock(product.stock, product.variants);

  const defaultVariantId = useMemo(() => {
    if (!product.variants?.length) return undefined;
    const available = product.variants.find((v) => v.stock > 0);
    return available?.id ?? product.variants[0]?.id;
  }, [product.variants]);

  const [selectedVariantId, setSelectedVariantId] = useState(
    defaultVariantId ?? ""
  );

  const selectedVariant = product.variants?.find(
    (v) => v.id === selectedVariantId
  );

  const displayPrice = hasVariants
    ? selectedVariant?.price ?? product.price
    : product.price;

  const displaySize = hasVariants
    ? selectedVariant?.label ?? product.size
    : product.size;

  const canAdd = hasVariants
    ? Boolean(selectedVariant && selectedVariant.stock > 0)
    : inStock;

  const handleAdd = () => {
    if (!canAdd) return;
    addItem(product, hasVariants ? selectedVariantId : undefined);
    openCart();
  };

  return (
    <div className="mb-8">
      <div className="flex items-baseline gap-3 mb-6">
        <span className="text-3xl font-medium text-cream">
          {formatPrice(displayPrice)}
        </span>
        {product.originalPrice && !hasVariants && (
          <span className="text-lg text-cream/30 line-through">
            {formatPrice(product.originalPrice)}
          </span>
        )}
        <span className="text-sm text-cream/50">{displaySize}</span>
      </div>

      {hasVariants && (
        <div className="mb-6">
          <p className="text-xs uppercase tracking-widest text-gold mb-3">
            Selecciona tamaño
          </p>
          <div className="flex flex-wrap gap-2">
            {product.variants!.map((variant) => {
              const active = selectedVariantId === variant.id;
              const soldOut = variant.stock <= 0;
              return (
                <button
                  key={variant.id}
                  type="button"
                  disabled={soldOut}
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={`px-4 py-2 text-sm border transition-colors ${
                    soldOut
                      ? "border-gold/10 text-cream/30 cursor-not-allowed line-through"
                      : active
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-gold/30 text-cream hover:border-gold"
                  }`}
                >
                  {variant.label} · {formatPrice(variant.price)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!inStock && (
        <p className="text-amber-400/90 text-sm mb-4">Producto agotado</p>
      )}

      <button
        onClick={handleAdd}
        disabled={!canAdd}
        className="w-full sm:w-auto bg-gold text-luxury-black px-12 py-4 text-sm uppercase tracking-widest hover:bg-gold-light transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {canAdd ? "Añadir al carrito" : "Agotado"}
      </button>
    </div>
  );
}

export function ProductPrice({
  price,
  originalPrice,
  size,
  fromPrice = false,
}: {
  price: number;
  originalPrice?: number;
  size: string;
  fromPrice?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-3 mb-8">
      <span className="text-3xl font-medium text-cream">
        {fromPrice && <span className="text-base text-cream/50 mr-1">Desde</span>}
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
