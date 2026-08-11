"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { ProductSort } from "@/lib/products";

const sortOptions: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Más recientes" },
  { value: "bestsellers", label: "Más vendidos" },
  { value: "name-asc", label: "A → Z" },
  { value: "price-desc", label: "Mayor a menor precio" },
];

type ShopSortProps = {
  activeSort: ProductSort;
};

export default function ShopSort({ activeSort }: ShopSortProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value as ProductSort;
    const params = new URLSearchParams(searchParams.toString());

    if (value === "newest") {
      params.delete("orden");
    } else {
      params.set("orden", value);
    }

    const next = params.toString();
    router.replace(next ? `/tienda?${next}` : "/tienda", { scroll: false });
  }

  return (
    <div className="flex items-center justify-center sm:justify-end gap-2 mb-8">
      <label
        htmlFor="shop-sort"
        className="text-[10px] uppercase tracking-[0.2em] text-cream/50 shrink-0"
      >
        Ordenar
      </label>
      <select
        id="shop-sort"
        value={activeSort}
        onChange={handleChange}
        className="bg-luxury-panel/60 border border-gold/15 px-3 py-2 text-xs text-cream focus:outline-none focus:border-gold/50 min-w-[12rem]"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function parseProductSort(value?: string | null): ProductSort {
  if (
    value === "bestsellers" ||
    value === "name-asc" ||
    value === "price-desc"
  ) {
    return value;
  }
  return "newest";
}
