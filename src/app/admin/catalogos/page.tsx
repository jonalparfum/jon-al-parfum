"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { slugify } from "@/lib/product-utils";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: { products: number; subcategories: number };
};

type Subcategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  categoryId: string;
  category: { id: string; name: string; slug: string };
  _count: { products: number };
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [catName, setCatName] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [subName, setSubName] = useState("");
  const [subDescription, setSubDescription] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");

  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatDescription, setEditCatDescription] = useState("");

  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editSubName, setEditSubName] = useState("");
  const [editSubDescription, setEditSubDescription] = useState("");
  const [editSubCategoryId, setEditSubCategoryId] = useState("");

  const load = async () => {
    const [catsRes, subsRes] = await Promise.all([
      fetch("/api/admin/categories"),
      fetch("/api/admin/subcategories"),
    ]);
    const cats = await catsRes.json();
    const subs = await subsRes.json();
    setCategories(cats);
    setSubcategories(subs);
    if (!subCategoryId && cats[0]?.id) setSubCategoryId(cats[0].id);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: catName,
        description: catDescription,
        slug: slugify(catName),
      }),
    });
    if (res.ok) {
      setCatName("");
      setCatDescription("");
      load();
    } else {
      const err = await res.json();
      alert(err.error || "Error al crear categoría");
    }
  };

  const handleCreateSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/subcategories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: subName,
        description: subDescription,
        categoryId: subCategoryId,
        slug: slugify(subName),
      }),
    });
    if (res.ok) {
      setSubName("");
      setSubDescription("");
      load();
    } else {
      const err = await res.json();
      alert(err.error || "Error al crear subcategoría");
    }
  };

  const startEditCategory = (cat: Category) => {
    setEditingCatId(cat.id);
    setEditCatName(cat.name);
    setEditCatDescription(cat.description || "");
  };

  const saveCategory = async (id: string) => {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editCatName,
        description: editCatDescription || null,
      }),
    });
    if (res.ok) {
      setEditingCatId(null);
      load();
    } else {
      const err = await res.json();
      alert(err.error || "Error al guardar");
    }
  };

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar categoría "${name}"?`)) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (res.ok) load();
    else {
      const err = await res.json();
      alert(err.error || "No se pudo eliminar");
    }
  };

  const startEditSubcategory = (sub: Subcategory) => {
    setEditingSubId(sub.id);
    setEditSubName(sub.name);
    setEditSubDescription(sub.description || "");
    setEditSubCategoryId(sub.categoryId);
  };

  const saveSubcategory = async (id: string) => {
    const res = await fetch(`/api/admin/subcategories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editSubName,
        description: editSubDescription || null,
        categoryId: editSubCategoryId,
      }),
    });
    if (res.ok) {
      setEditingSubId(null);
      load();
    } else {
      const err = await res.json();
      alert(err.error || "Error al guardar");
    }
  };

  const deleteSubcategory = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar subcategoría "${name}"?`)) return;
    const res = await fetch(`/api/admin/subcategories/${id}`, { method: "DELETE" });
    if (res.ok) load();
    else {
      const err = await res.json();
      alert(err.error || "No se pudo eliminar");
    }
  };

  if (loading) return <p className="text-gray-500">Cargando...</p>;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-2xl mb-2">Categorías y subcategorías</h1>
        <p className="text-sm text-gray-500 mb-6">
          Organiza tu catálogo: categorías principales (Hombre, Mujer…) y subcategorías (EDP, Nicho, Ofertas…).
        </p>
      </div>

      <section>
        <h2 className="font-medium text-lg mb-4">Categorías</h2>
        <form
          onSubmit={handleCreateCategory}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6 max-w-lg space-y-4"
        >
          <h3 className="text-sm font-medium text-gray-700">Nueva categoría</h3>
          <input
            type="text"
            required
            placeholder="Nombre (ej: Hombre)"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Descripción opcional"
            value={catDescription}
            onChange={(e) => setCatDescription(e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="bg-charcoal text-white px-4 py-2 text-sm hover:bg-gold transition-colors"
          >
            Crear categoría
          </button>
        </form>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4">Nombre</th>
                <th className="text-left p-4">Slug</th>
                <th className="text-left p-4">Productos</th>
                <th className="text-left p-4">Subcategorías</th>
                <th className="text-right p-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-gray-50">
                  <td className="p-4">
                    {editingCatId === cat.id ? (
                      <input
                        value={editCatName}
                        onChange={(e) => setEditCatName(e.target.value)}
                        className="border border-gray-200 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      <span className="font-medium">{cat.name}</span>
                    )}
                  </td>
                  <td className="p-4 text-gray-500">{cat.slug}</td>
                  <td className="p-4">{cat._count.products}</td>
                  <td className="p-4">{cat._count.subcategories}</td>
                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
                    {editingCatId === cat.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => saveCategory(cat.id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCatId(null)}
                          className="text-gray-500"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEditCategory(cat)}
                          className="text-gold hover:text-charcoal"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCategory(cat.id, cat.name)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-medium text-lg mb-4">Subcategorías</h2>
        <form
          onSubmit={handleCreateSubcategory}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6 max-w-lg space-y-4"
        >
          <h3 className="text-sm font-medium text-gray-700">Nueva subcategoría</h3>
          <select
            required
            value={subCategoryId}
            onChange={(e) => setSubCategoryId(e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            required
            placeholder="Nombre (ej: Eau de Parfum)"
            value={subName}
            onChange={(e) => setSubName(e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Descripción opcional"
            value={subDescription}
            onChange={(e) => setSubDescription(e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="bg-charcoal text-white px-4 py-2 text-sm hover:bg-gold transition-colors"
          >
            Crear subcategoría
          </button>
        </form>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4">Nombre</th>
                <th className="text-left p-4">Categoría</th>
                <th className="text-left p-4">Slug</th>
                <th className="text-left p-4">Productos</th>
                <th className="text-right p-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {subcategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    Aún no hay subcategorías. Crea la primera arriba.
                  </td>
                </tr>
              ) : (
                subcategories.map((sub) => (
                  <tr key={sub.id} className="border-b border-gray-50">
                    <td className="p-4">
                      {editingSubId === sub.id ? (
                        <input
                          value={editSubName}
                          onChange={(e) => setEditSubName(e.target.value)}
                          className="border border-gray-200 rounded px-2 py-1 w-full"
                        />
                      ) : (
                        <span className="font-medium">{sub.name}</span>
                      )}
                    </td>
                    <td className="p-4">
                      {editingSubId === sub.id ? (
                        <select
                          value={editSubCategoryId}
                          onChange={(e) => setEditSubCategoryId(e.target.value)}
                          className="border border-gray-200 rounded px-2 py-1"
                        >
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        sub.category.name
                      )}
                    </td>
                    <td className="p-4 text-gray-500">{sub.slug}</td>
                    <td className="p-4">{sub._count.products}</td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      {editingSubId === sub.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => saveSubcategory(sub.id)}
                            className="text-green-600 hover:text-green-800"
                          >
                            Guardar
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingSubId(null)}
                            className="text-gray-500"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEditSubcategory(sub)}
                            className="text-gold hover:text-charcoal"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSubcategory(sub.id, sub.name)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-sm text-gray-500">
        ¿Listo para agregar productos?{" "}
        <Link href="/admin/productos/nuevo" className="text-gold hover:text-charcoal">
          Crear producto →
        </Link>
      </p>
    </div>
  );
}
