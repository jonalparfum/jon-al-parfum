"use client";

import Link from "next/link";
import { useState } from "react";
import type { ProductSort } from "@/types";

type Subcategory = { id: string; name: string; slug: string };

type ShopSubcategoryFiltersProps = {
  categoryName: string;
  categorySlug: string;
  activeSubcategory: string;
  subcategories: Subcategory[];
  searchQuery: string;
  activeSort?: ProductSort;
};

function filterClass(active: boolean) {
  return active
    ? "bg-gold text-luxury-black border-gold"
    : "border-gold/20 text-cream/60 hover:border-gold/50 hover:text-gold";
}

function buildHref(
  categorySlug: string,
  subcategorySlug: string | undefined,
  searchQuery: string,
  activeSort?: ProductSort
) {
  const sp = new URLSearchParams();
  sp.set("categoria", categorySlug);
  if (subcategorySlug && subcategorySlug !== "all") {
    sp.set("subcategoria", subcategorySlug);
  }
  if (searchQuery) sp.set("q", searchQuery);
  if (activeSort && activeSort !== "newest") sp.set("orden", activeSort);
  return `/tienda?${sp.toString()}`;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`w-4 h-4 shrink-0 opacity-60 transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function ShopSubcategoryFilters({
  categoryName,
  categorySlug,
  activeSubcategory,
  subcategories,
  searchQuery,
  activeSort = "newest",
}: ShopSubcategoryFiltersProps) {
  const [open, setOpen] = useState(activeSubcategory !== "all");
  const activeSubName = subcategories.find(
    (sub) => sub.slug === activeSubcategory
  )?.name;

  const links = (
    <>
      <Link
        href={buildHref(categorySlug, undefined, searchQuery, activeSort)}
        className={`px-4 py-2 text-[11px] uppercase tracking-[0.12em] border transition-all duration-300 ${filterClass(activeSubcategory === "all")}`}
      >
        Todas
      </Link>
      {subcategories.map((sub) => (
        <Link
          key={sub.id}
          href={buildHref(categorySlug, sub.slug, searchQuery, activeSort)}
          className={`px-4 py-2 text-[11px] uppercase tracking-[0.12em] border transition-all duration-300 ${filterClass(activeSubcategory === sub.slug)}`}
        >
          {sub.name}
        </Link>
      ))}
    </>
  );

  return (
    <div className="mb-14 max-w-3xl mx-auto">
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 border border-gold/20 text-left text-[11px] uppercase tracking-[0.12em] text-cream/70 hover:border-gold/40 hover:text-gold transition-colors"
        >
          <span>
            Subcategorías · {categoryName}
            {activeSubName && (
              <span className="text-gold normal-case tracking-normal">
                {" "}
                · {activeSubName}
              </span>
            )}
          </span>
          <ChevronIcon open={open} />
        </button>
        {open && (
          <div className="flex flex-wrap justify-center gap-2 mt-3 px-1">
            {links}
          </div>
        )}
      </div>

      <div className="hidden md:block">
        <p className="text-center text-[10px] uppercase tracking-[0.25em] text-gold/60 mb-3">
          Subcategorías · {categoryName}
        </p>
        <div className="flex flex-wrap justify-center gap-2">{links}</div>
      </div>
    </div>
  );
}
