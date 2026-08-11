"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type ShopSearchProps = {
  initialQuery?: string;
};

export default function ShopSearch({ initialQuery = "" }: ShopSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  function pushQuery(nextQuery: string) {
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = nextQuery.trim();

    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }

    const next = params.toString();
    router.replace(next ? `/tienda?${next}` : "/tienda", { scroll: false });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    pushQuery(query);
  }

  function clearSearch() {
    setQuery("");
    pushQuery("");
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-10">
      <label htmlFor="shop-search" className="sr-only">
        Buscar perfumes
      </label>
      <div className="relative flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="absolute left-4 w-5 h-5 text-gold/50 pointer-events-none"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          id="shop-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, marca o fragancia…"
          className="w-full bg-luxury-panel/60 border border-gold/15 pl-12 pr-24 py-3.5 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold/50 focus:shadow-[0_0_20px_rgba(201,169,98,0.08)] transition-all duration-300"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-20 text-cream/40 hover:text-gold text-xs uppercase tracking-wider"
          >
            Limpiar
          </button>
        )}
        <button
          type="submit"
          className="absolute right-2 bg-gold text-luxury-black px-4 py-2 text-[10px] uppercase tracking-[0.15em] font-medium hover:bg-gold-light transition-colors"
        >
          Buscar
        </button>
      </div>
    </form>
  );
}
