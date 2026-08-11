"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/product-utils";
import {
  adminBadgeActive,
  adminBadgeFeatured,
  adminBadgeInactive,
  adminBadgeNew,
  adminBtnPrimary,
  adminLink,
  adminLinkDanger,
  adminLoading,
  adminPageTitle,
  adminPanel,
  adminTableHead,
  adminTd,
  adminTdMuted,
  adminTh,
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
  category: { name: string };
  subcategory: { name: string } | null;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar "${name}"?`)) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading) {
    return <p className={adminLoading}>Cargando productos...</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className={adminPageTitle}>Productos</h1>
        <Link href="/admin/productos/nuevo" className={adminBtnPrimary}>
          + Nuevo producto
        </Link>
      </div>

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
              {products.map((product) => (
                <tr key={product.id} className={adminTr}>
                  <td className={adminTd}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-luxury-black border border-gold/10 rounded overflow-hidden relative shrink-0">
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
                        <div className="flex gap-2 mt-1">
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
                  <td className={`${adminTd} text-right space-x-4 whitespace-nowrap`}>
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
    </div>
  );
}
