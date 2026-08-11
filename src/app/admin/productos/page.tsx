"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/product-utils";
import { useAdminToast } from "@/components/admin/AdminToast";
import {
  adminBadgeActive,
  adminBadgeFeatured,
  adminBadgeInactive,
  adminBadgeNew,
  adminBtnPrimary,
  adminEmptyState,
  adminFilterGroup,
  adminFilterPill,
  adminFilterPillActive,
  adminFilterPillInactive,
  adminInput,
  adminLabel,
  adminLink,
  adminLinkDanger,
  adminLoading,
  adminMuted,
  adminPageTitle,
  adminPanel,
  adminSelect,
  adminSubtitle,
  adminTableHead,
  adminTd,
  adminTdMuted,
  adminTh,
  adminToolbar,
  adminTr,
} from "@/lib/admin-styles";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  active: boolean;
  featured: boolean;
  isNew: boolean;
  image: string;
  createdAt: string;
  category: { id: string; name: string };
  subcategory: { id: string; name: string } | null;
};

type StatusFilter = "all" | "active" | "inactive" | "featured" | "lowStock";
type SortOption = "newest" | "name" | "price-asc" | "price-desc" | "stock";

export default function AdminProductsPage() {
  const { showToast } = useAdminToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortOption>("newest");

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => map.set(p.category.id, p.category.name));
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [products]);

  const subcategories = useMemo(() => {
    const map = new Map<string, { id: string; name: string; categoryId: string }>();
    products.forEach((p) => {
      if (p.subcategory && (!categoryId || p.category.id === categoryId)) {
        map.set(p.subcategory.id, {
          id: p.subcategory.id,
          name: p.subcategory.name,
          categoryId: p.category.id,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name, "es")
    );
  }, [products, categoryId]);

  const filtered = useMemo(() => {
    let list = [...products];
    const q = search.trim().toLowerCase();

    if (q) {
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (categoryId) {
      list = list.filter((p) => p.category.id === categoryId);
    }
    if (subcategoryId) {
      list = list.filter((p) => p.subcategory?.id === subcategoryId);
    }

    switch (statusFilter) {
      case "active":
        list = list.filter((p) => p.active);
        break;
      case "inactive":
        list = list.filter((p) => !p.active);
        break;
      case "featured":
        list = list.filter((p) => p.featured);
        break;
      case "lowStock":
        list = list.filter((p) => p.stock <= 10);
        break;
    }

    switch (sort) {
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name, "es"));
        break;
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "stock":
        list.sort((a, b) => a.stock - b.stock);
        break;
      default:
        list.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    return list;
  }, [products, search, categoryId, subcategoryId, statusFilter, sort]);

  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
    setSubcategoryId("");
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar "${name}"?`)) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast("Producto eliminado");
    } else {
      showToast("No se pudo eliminar el producto", "error");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryId("");
    setSubcategoryId("");
    setStatusFilter("all");
    setSort("newest");
  };

  const hasFilters =
    search || categoryId || subcategoryId || statusFilter !== "all";

  if (loading) {
    return <p className={adminLoading}>Cargando productos...</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h1 className={adminPageTitle}>Productos</h1>
          <p className={adminSubtitle}>
            {filtered.length} de {products.length} productos
            {hasFilters ? " · filtros activos" : ""}
          </p>
        </div>
        <Link href="/admin/productos/nuevo" className={adminBtnPrimary}>
          + Nuevo producto
        </Link>
      </div>

      <div className={adminToolbar}>
        <div className="flex-1 min-w-[200px]">
          <label className={adminLabel}>Buscar</label>
          <input
            type="search"
            placeholder="Nombre del producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={adminInput}
          />
        </div>

        <div className="w-full sm:w-44">
          <label className={adminLabel}>Categoría</label>
          <select
            value={categoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className={adminSelect}
          >
            <option value="">Todas</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-44">
          <label className={adminLabel}>Subcategoría</label>
          <select
            value={subcategoryId}
            onChange={(e) => setSubcategoryId(e.target.value)}
            className={adminSelect}
            disabled={!categoryId && subcategories.length === 0}
          >
            <option value="">Todas</option>
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-40">
          <label className={adminLabel}>Ordenar</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className={adminSelect}
          >
            <option value="newest">Más recientes</option>
            <option value="name">Nombre A–Z</option>
            <option value="price-asc">Precio ↑</option>
            <option value="price-desc">Precio ↓</option>
            <option value="stock">Stock</option>
          </select>
        </div>
      </div>

      <div className={`${adminFilterGroup} mb-6`}>
        {(
          [
            ["all", "Todos"],
            ["active", "Activos"],
            ["inactive", "Inactivos"],
            ["featured", "Destacados"],
            ["lowStock", "Stock bajo"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatusFilter(value)}
            className={`${adminFilterPill} ${
              statusFilter === value
                ? adminFilterPillActive
                : adminFilterPillInactive
            }`}
          >
            {label}
          </button>
        ))}
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className={`${adminFilterPill} ${adminFilterPillInactive}`}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className={adminEmptyState}>
          <p className="text-cream/70 mb-2">No hay productos con estos filtros.</p>
          <button type="button" onClick={clearFilters} className={adminLink}>
            Ver todos los productos
          </button>
        </div>
      ) : (
        <div className={adminPanel}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={adminTableHead}>
                <tr>
                  <th className={adminTh}>Producto</th>
                  <th className={adminTh}>Categoría</th>
                  <th className={adminTh}>Subcategoría</th>
                  <th className={adminTh}>Precio</th>
                  <th className={adminTh}>Stock</th>
                  <th className={adminTh}>Estado</th>
                  <th className={`${adminTh} text-right`}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className={adminTr}>
                    <td className={adminTd}>
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-luxury-black border border-gold/10 rounded-lg overflow-hidden relative shrink-0">
                          {product.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-cream">{product.name}</p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {product.featured && (
                              <span className={adminBadgeFeatured}>Destacado</span>
                            )}
                            {product.isNew && (
                              <span className={adminBadgeNew}>Nuevo</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={adminTd}>{product.category.name}</td>
                    <td className={adminTdMuted}>
                      {product.subcategory?.name || "—"}
                    </td>
                    <td className={`${adminTd} text-gold font-medium`}>
                      {formatPrice(product.price)}
                    </td>
                    <td className={adminTd}>
                      <span
                        className={
                          product.stock <= 10
                            ? "text-red-400 font-medium"
                            : "text-cream"
                        }
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className={adminTd}>
                      <span
                        className={
                          product.active ? adminBadgeActive : adminBadgeInactive
                        }
                      >
                        {product.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td
                      className={`${adminTd} text-right space-x-4 whitespace-nowrap`}
                    >
                      <Link
                        href={`/admin/productos/${product.id}`}
                        className={adminLink}
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id, product.name)}
                        className={adminLinkDanger}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
