"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { slugify } from "@/lib/product-utils";
import {
  adminBtnPrimary,
  adminInput,
  adminLabel,
  adminLink,
  adminLinkDanger,
  adminLoading,
  adminMuted,
  adminPageTitle,
  adminPanel,
  adminPanelPadding,
  adminSectionTitle,
  adminSelect,
  adminTableHead,
  adminTd,
  adminTdMuted,
  adminTh,
  adminTr,
} from "@/lib/admin-styles";

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

  if (loading) return <p className={adminLoading}>Cargando...</p>;

  return (
    <div className="space-y-10">
      <div>
        <h1 className={`${adminPageTitle} mb-2`}>Categorías y subcategorías</h1>
        <p className={adminMuted}>
          Organiza tu catálogo: categorías principales (Hombre, Mujer…) y
          subcategorías (EDP, Nicho, Ofertas…).
        </p>
      </div>

      <section>
        <h2 className={adminSectionTitle}>Categorías</h2>
        <form
          onSubmit={handleCreateCategory}
          className={`${adminPanelPadding} mb-6 max-w-lg space-y-4`}
        >
          <h3 className="text-sm font-medium text-gold">Nueva categoría</h3>
          <div>
            <label className={adminLabel}>Nombre</label>
            <input
              type="text"
              required
              placeholder="Ej: Hombre"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              className={adminInput}
            />
          </div>
          <div>
            <label className={adminLabel}>Descripción (opcional)</label>
            <input
              type="text"
              value={catDescription}
              onChange={(e) => setCatDescription(e.target.value)}
              className={adminInput}
            />
          </div>
          <button type="submit" className={adminBtnPrimary}>
            Crear categoría
          </button>
        </form>

        <div className={`${adminPanel} overflow-x-auto`}>
          <table className="w-full text-sm min-w-[640px]">
            <thead className={adminTableHead}>
              <tr>
                <th className={adminTh}>Nombre</th>
                <th className={adminTh}>Slug</th>
                <th className={adminTh}>Productos</th>
                <th className={adminTh}>Subcategorías</th>
                <th className={`${adminTh} text-right`}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className={adminTr}>
                  <td className={adminTd}>
                    {editingCatId === cat.id ? (
                      <input
                        value={editCatName}
                        onChange={(e) => setEditCatName(e.target.value)}
                        className={adminInput}
                      />
                    ) : (
                      <span className="font-medium text-cream">{cat.name}</span>
                    )}
                  </td>
                  <td className={adminTdMuted}>{cat.slug}</td>
                  <td className={adminTd}>{cat._count.products}</td>
                  <td className={adminTd}>{cat._count.subcategories}</td>
                  <td className={`${adminTd} text-right space-x-3 whitespace-nowrap`}>
                    {editingCatId === cat.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => saveCategory(cat.id)}
                          className="text-green-400 hover:text-green-300"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCatId(null)}
                          className="text-cream/50 hover:text-cream"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEditCategory(cat)}
                          className={adminLink}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCategory(cat.id, cat.name)}
                          className={adminLinkDanger}
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
        <h2 className={adminSectionTitle}>Subcategorías</h2>
        <form
          onSubmit={handleCreateSubcategory}
          className={`${adminPanelPadding} mb-6 max-w-lg space-y-4`}
        >
          <h3 className="text-sm font-medium text-gold">Nueva subcategoría</h3>
          <div>
            <label className={adminLabel}>Categoría</label>
            <select
              required
              value={subCategoryId}
              onChange={(e) => setSubCategoryId(e.target.value)}
              className={adminSelect}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={adminLabel}>Nombre</label>
            <input
              type="text"
              required
              placeholder="Ej: Eau de Parfum"
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
              className={adminInput}
            />
          </div>
          <div>
            <label className={adminLabel}>Descripción (opcional)</label>
            <input
              type="text"
              value={subDescription}
              onChange={(e) => setSubDescription(e.target.value)}
              className={adminInput}
            />
          </div>
          <button type="submit" className={adminBtnPrimary}>
            Crear subcategoría
          </button>
        </form>

        <div className={`${adminPanel} overflow-x-auto`}>
          <table className="w-full text-sm min-w-[720px]">
            <thead className={adminTableHead}>
              <tr>
                <th className={adminTh}>Nombre</th>
                <th className={adminTh}>Categoría</th>
                <th className={adminTh}>Slug</th>
                <th className={adminTh}>Productos</th>
                <th className={`${adminTh} text-right`}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {subcategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`${adminTdMuted} p-6 text-center`}>
                    Aún no hay subcategorías. Crea la primera arriba.
                  </td>
                </tr>
              ) : (
                subcategories.map((sub) => (
                  <tr key={sub.id} className={adminTr}>
                    <td className={adminTd}>
                      {editingSubId === sub.id ? (
                        <input
                          value={editSubName}
                          onChange={(e) => setEditSubName(e.target.value)}
                          className={adminInput}
                        />
                      ) : (
                        <span className="font-medium text-cream">{sub.name}</span>
                      )}
                    </td>
                    <td className={adminTd}>
                      {editingSubId === sub.id ? (
                        <select
                          value={editSubCategoryId}
                          onChange={(e) => setEditSubCategoryId(e.target.value)}
                          className={adminSelect}
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
                    <td className={adminTdMuted}>{sub.slug}</td>
                    <td className={adminTd}>{sub._count.products}</td>
                    <td className={`${adminTd} text-right space-x-3 whitespace-nowrap`}>
                      {editingSubId === sub.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => saveSubcategory(sub.id)}
                            className="text-green-400 hover:text-green-300"
                          >
                            Guardar
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingSubId(null)}
                            className="text-cream/50 hover:text-cream"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEditSubcategory(sub)}
                            className={adminLink}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSubcategory(sub.id, sub.name)}
                            className={adminLinkDanger}
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

      <p className={adminMuted}>
        ¿Listo para agregar productos?{" "}
        <Link href="/admin/productos/nuevo" className={adminLink}>
          Crear producto →
        </Link>
      </p>
    </div>
  );
}
