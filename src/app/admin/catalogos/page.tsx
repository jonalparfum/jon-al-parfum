"use client";

import { useEffect, useState } from "react";
import { slugify } from "@/lib/product-utils";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: { products: number };
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then(setCategories)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, slug: slugify(name) }),
    });
    if (res.ok) {
      setName("");
      setDescription("");
      load();
    } else {
      const err = await res.json();
      alert(err.error || "Error al crear catálogo");
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`¿Eliminar catálogo "${catName}"?`)) return;
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      load();
    } else {
      const err = await res.json();
      alert(err.error || "No se pudo eliminar");
    }
  };

  if (loading) return <p className="text-gray-500">Cargando...</p>;

  return (
    <div>
      <h1 className="font-serif text-2xl mb-6">Catálogos</h1>

      <form
        onSubmit={handleCreate}
        className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8 max-w-lg space-y-4"
      >
        <h2 className="font-medium">Nuevo catálogo</h2>
        <input
          type="text"
          required
          placeholder="Nombre (ej: Hombre)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
        />
        <input
          type="text"
          placeholder="Descripción opcional"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="bg-charcoal text-white px-4 py-2 text-sm hover:bg-gold transition-colors"
        >
          Crear catálogo
        </button>
      </form>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4">Nombre</th>
              <th className="text-left p-4">Slug</th>
              <th className="text-left p-4">Productos</th>
              <th className="text-right p-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-gray-50">
                <td className="p-4 font-medium">{cat.name}</td>
                <td className="p-4 text-gray-500">{cat.slug}</td>
                <td className="p-4">{cat._count.products}</td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
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
