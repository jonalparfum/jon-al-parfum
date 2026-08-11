"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/product-utils";

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
    return <p className="text-gray-500">Cargando productos...</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-2xl">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="bg-charcoal text-white px-4 py-2 text-sm hover:bg-gold transition-colors"
        >
          + Nuevo producto
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium">Producto</th>
              <th className="text-left p-4 font-medium">Categoría</th>
              <th className="text-left p-4 font-medium">Subcategoría</th>
              <th className="text-left p-4 font-medium">Precio</th>
              <th className="text-left p-4 font-medium">Stock</th>
              <th className="text-left p-4 font-medium">Estado</th>
              <th className="text-right p-4 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-gray-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden relative">
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
                      <p className="font-medium">{product.name}</p>
                      <div className="flex gap-2 mt-1">
                        {product.featured && (
                          <span className="text-xs bg-gold/20 text-gold px-1.5 py-0.5 rounded">
                            Destacado
                          </span>
                        )}
                        {product.isNew && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                            Nuevo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-gray-600">{product.category.name}</td>
                <td className="p-4 text-gray-500">
                  {product.subcategory?.name || "—"}
                </td>
                <td className="p-4">{formatPrice(product.price)}</td>
                <td className="p-4">
                  <span
                    className={
                      product.stock <= 10 ? "text-red-600 font-medium" : ""
                    }
                  >
                    {product.stock}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      product.active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {product.active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="p-4 text-right space-x-3">
                  <Link
                    href={`/admin/productos/${product.id}`}
                    className="text-gold hover:text-charcoal"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                    className="text-red-500 hover:text-red-700"
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
  );
}
