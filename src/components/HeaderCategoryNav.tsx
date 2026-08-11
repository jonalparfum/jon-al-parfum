"use client";

import Link from "next/link";
import { useState } from "react";
import type { CatalogCategory } from "@/lib/catalog";

type HeaderCategoryNavProps = {
  categories: CatalogCategory[];
  onNavigate?: () => void;
  variant?: "desktop" | "mobile";
};

export default function HeaderCategoryNav({
  categories,
  onNavigate,
  variant = "desktop",
}: HeaderCategoryNavProps) {
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

  if (variant === "mobile") {
    return (
      <>
        {categories.map((category) => {
          const hasSubs = category.subcategories.length > 0;
          const isOpen = openCategoryId === category.id;

          if (!hasSubs) {
            return (
              <Link
                key={category.id}
                href={`/tienda?categoria=${category.slug}`}
                onClick={onNavigate}
                className="block py-3 text-xs uppercase tracking-[0.2em] text-cream/70 hover:text-gold transition-colors"
              >
                {category.name}
              </Link>
            );
          }

          return (
            <div key={category.id}>
              <button
                type="button"
                onClick={() =>
                  setOpenCategoryId(isOpen ? null : category.id)
                }
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-2 py-3 text-xs uppercase tracking-[0.2em] text-cream/70 hover:text-gold transition-colors"
              >
                <span>{category.name}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`w-4 h-4 shrink-0 opacity-60 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {isOpen && (
                <div className="pl-4 border-l border-gold/10 ml-2 mb-2 space-y-1">
                  <Link
                    href={`/tienda?categoria=${category.slug}`}
                    onClick={onNavigate}
                    className="block py-2 text-[11px] uppercase tracking-[0.15em] text-gold/80 hover:text-gold transition-colors"
                  >
                    Ver todo {category.name}
                  </Link>
                  {category.subcategories.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/tienda?categoria=${category.slug}&subcategoria=${sub.slug}`}
                      onClick={onNavigate}
                      className="block py-2 text-[11px] uppercase tracking-[0.15em] text-cream/50 hover:text-gold transition-colors"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </>
    );
  }

  return (
    <>
      {categories.map((category) =>
        category.subcategories.length > 0 ? (
          <div
            key={category.id}
            className="relative group"
            onMouseEnter={() => setOpenCategoryId(category.id)}
            onMouseLeave={() => setOpenCategoryId(null)}
          >
            <Link
              href={`/tienda?categoria=${category.slug}`}
              className="text-xs uppercase tracking-[0.2em] text-cream/70 hover:text-gold transition-colors duration-300 inline-flex items-center gap-1"
            >
              {category.name}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3 h-3 opacity-60"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
            <div
              className={`absolute top-full left-0 pt-2 min-w-[180px] transition-all duration-200 ${
                openCategoryId === category.id
                  ? "opacity-100 visible translate-y-0"
                  : "opacity-0 invisible -translate-y-1"
              }`}
            >
              <div className="bg-luxury-panel border border-gold/15 shadow-xl py-2">
                <Link
                  href={`/tienda?categoria=${category.slug}`}
                  className="block px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-gold/90 hover:bg-gold/5 hover:text-gold"
                >
                  Ver todo {category.name}
                </Link>
                {category.subcategories.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/tienda?categoria=${category.slug}&subcategoria=${sub.slug}`}
                    className="block px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-cream/60 hover:bg-gold/5 hover:text-gold"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Link
            key={category.id}
            href={`/tienda?categoria=${category.slug}`}
            className="text-xs uppercase tracking-[0.2em] text-cream/70 hover:text-gold transition-colors duration-300"
          >
            {category.name}
          </Link>
        )
      )}
    </>
  );
}
