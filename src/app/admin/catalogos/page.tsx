"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { slugify } from "@/lib/product-utils";
import { useAdminToast } from "@/components/admin/AdminToast";
import { fetchJsonArray } from "@/lib/admin-fetch";
import {
  adminBtnDanger,
  adminBtnGhost,
  adminBtnPrimary,
  adminBtnSuccess,
  adminCard,
  adminEmptyState,
  adminFilterGroup,
  adminFilterPill,
  adminFilterPillActive,
  adminFilterPillInactive,
  adminInput,
  adminLabel,
  adminLink,
  adminLoading,
  adminMuted,
  adminPageTitle,
  adminPanelPadding,
  adminSelect,
  adminSubtitle,
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
  const { showToast } = useAdminToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewFilter, setViewFilter] = useState<string>("all");

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
    const [catsResult, subsResult] = await Promise.all([
      fetchJsonArray<Category>("/api/admin/categories"),
      fetchJsonArray<Subcategory>("/api/admin/subcategories"),
    ]);
    setCategories(catsResult.data);
    setSubcategories(subsResult.data);
    if (!subCategoryId && catsResult.data[0]?.id) {
      setSubCategoryId(catsResult.data[0].id);
    }
    if (!catsResult.ok && catsResult.error) {
      showToast(catsResult.error, "error");
    }
    if (!subsResult.ok && subsResult.error) {
      showToast(subsResult.error, "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleCategories = useMemo(() => {
    if (viewFilter === "all") return categories;
    return categories.filter((c) => c.id === viewFilter);
  }, [categories, viewFilter]);

  const subsByCategory = useMemo(() => {
    const map = new Map<string, Subcategory[]>();
    subcategories.forEach((sub) => {
      const list = map.get(sub.categoryId) || [];
      list.push(sub);
      map.set(sub.categoryId, list);
    });
    return map;
  }, [subcategories]);

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
      showToast("Categoría creada");
      load();
    } else {
      const err = await res.json();
      showToast(err.error || "Error al crear categoría", "error");
    }
  };

  const createSubcategory = async (
    categoryId: string,
    name: string,
    description: string
  ) => {
    const res = await fetch("/api/admin/subcategories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        categoryId,
        slug: slugify(name),
      }),
    });
    if (res.ok) {
      showToast("Subcategoría creada");
      load();
      return true;
    }
    const err = await res.json();
    showToast(err.error || "Error al crear subcategoría", "error");
    return false;
  };

  const handleCreateSubcategory = async (
    e: React.FormEvent,
    categoryId: string
  ) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const nameInput = form.elements.namedItem("subName") as HTMLInputElement;
    const descInput = form.elements.namedItem(
      "subDescription"
    ) as HTMLInputElement;
    const ok = await createSubcategory(
      categoryId,
      nameInput.value.trim(),
      descInput.value.trim()
    );
    if (ok) form.reset();
  };

  const handleCreateSubcategoryManual = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await createSubcategory(
      subCategoryId,
      subName.trim(),
      subDescription.trim()
    );
    if (ok) {
      setSubName("");
      setSubDescription("");
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
      showToast("Categoría actualizada");
      load();
    } else {
      const err = await res.json();
      showToast(err.error || "Error al guardar", "error");
    }
  };

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar categoría "${name}"?`)) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Categoría eliminada");
      if (viewFilter === id) setViewFilter("all");
      load();
    } else {
      const err = await res.json();
      showToast(err.error || "No se pudo eliminar", "error");
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
      showToast("Subcategoría actualizada");
      load();
    } else {
      const err = await res.json();
      showToast(err.error || "Error al guardar", "error");
    }
  };

  const deleteSubcategory = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar subcategoría "${name}"?`)) return;
    const res = await fetch(`/api/admin/subcategories/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Subcategoría eliminada");
      load();
    } else {
      const err = await res.json();
      showToast(err.error || "No se pudo eliminar", "error");
    }
  };

  if (loading) return <p className={adminLoading}>Cargando catálogo...</p>;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className={adminPageTitle}>Categorías y subcategorías</h1>
          <p className={adminSubtitle}>
            {categories.length} categorías · {subcategories.length} subcategorías
          </p>
        </div>
        <Link href="/admin/productos/nuevo" className={adminBtnGhost}>
          + Crear producto
        </Link>
      </div>

      <form
        onSubmit={handleCreateCategory}
        className={`${adminPanelPadding} grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end`}
      >
        <div>
          <label className={adminLabel}>Nueva categoría</label>
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

      <div>
        <p className={`${adminLabel} mb-3`}>Filtrar por categoría</p>
        <div className={adminFilterGroup}>
          <button
            type="button"
            onClick={() => setViewFilter("all")}
            className={`${adminFilterPill} ${
              viewFilter === "all"
                ? adminFilterPillActive
                : adminFilterPillInactive
            }`}
          >
            Todas ({categories.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setViewFilter(cat.id)}
              className={`${adminFilterPill} ${
                viewFilter === cat.id
                  ? adminFilterPillActive
                  : adminFilterPillInactive
              }`}
            >
              {cat.name} ({cat._count.products})
            </button>
          ))}
        </div>
      </div>

      {visibleCategories.length === 0 ? (
        <div className={adminEmptyState}>
          <p className="text-cream/70 mb-2">No hay categorías todavía.</p>
          <p className={adminMuted}>Crea la primera categoría arriba.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {visibleCategories.map((cat) => {
            const subs = subsByCategory.get(cat.id) || [];
            const isEditing = editingCatId === cat.id;

            return (
              <article key={cat.id} className={adminCard}>
                <div className="flex flex-wrap justify-between gap-3 mb-4 pb-4 border-b border-gold/10">
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          value={editCatName}
                          onChange={(e) => setEditCatName(e.target.value)}
                          className={adminInput}
                        />
                        <input
                          value={editCatDescription}
                          onChange={(e) => setEditCatDescription(e.target.value)}
                          placeholder="Descripción"
                          className={adminInput}
                        />
                      </div>
                    ) : (
                      <>
                        <h2 className="font-medium text-lg text-cream">{cat.name}</h2>
                        <p className={`${adminMuted} mt-1`}>
                          /{cat.slug}
                          {cat.description ? ` · ${cat.description}` : ""}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 rounded-full bg-gold/10 text-gold border border-gold/20">
                      {cat._count.products} productos
                    </span>
                    <span className="px-2 py-1 rounded-full bg-luxury-black/50 text-cream/60 border border-gold/10">
                      {subs.length} subcategorías
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-5">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => saveCategory(cat.id)}
                        className={adminBtnSuccess}
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCatId(null)}
                        className={adminBtnGhost}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startEditCategory(cat)}
                        className={adminBtnGhost}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCategory(cat.id, cat.name)}
                        className={adminBtnDanger}
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <p className={adminLabel}>Subcategorías</p>
                  {subs.length === 0 ? (
                    <p className={`${adminMuted} text-sm py-2`}>
                      Sin subcategorías en esta categoría.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {subs.map((sub) => (
                        <li
                          key={sub.id}
                          className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-luxury-black/40 border border-gold/10"
                        >
                          {editingSubId === sub.id ? (
                            <div className="flex-1 space-y-2 w-full">
                              <input
                                value={editSubName}
                                onChange={(e) => setEditSubName(e.target.value)}
                                className={adminInput}
                              />
                              <input
                                value={editSubDescription}
                                onChange={(e) =>
                                  setEditSubDescription(e.target.value)
                                }
                                placeholder="Descripción"
                                className={adminInput}
                              />
                              <select
                                value={editSubCategoryId}
                                onChange={(e) =>
                                  setEditSubCategoryId(e.target.value)
                                }
                                className={adminSelect}
                              >
                                {categories.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => saveSubcategory(sub.id)}
                                  className={adminBtnSuccess}
                                >
                                  Guardar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingSubId(null)}
                                  className={adminBtnGhost}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div>
                                <p className="text-sm font-medium text-cream">
                                  {sub.name}
                                </p>
                                <p className="text-xs text-cream/45">
                                  /{sub.slug} · {sub._count.products} productos
                                  {sub.description ? ` · ${sub.description}` : ""}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEditSubcategory(sub)}
                                  className={adminLink}
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteSubcategory(sub.id, sub.name)
                                  }
                                  className="text-red-400 hover:text-red-300 text-sm"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <form
                  onSubmit={(e) => handleCreateSubcategory(e, cat.id)}
                  className="pt-4 border-t border-gold/10 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-end"
                >
                  <div>
                    <label className={adminLabel}>Nueva subcategoría</label>
                    <input
                      name="subName"
                      type="text"
                      required
                      placeholder="Ej: Eau de Parfum"
                      className={adminInput}
                    />
                  </div>
                  <div>
                    <label className={adminLabel}>Descripción</label>
                    <input
                      name="subDescription"
                      type="text"
                      className={adminInput}
                    />
                  </div>
                  <button type="submit" className={adminBtnPrimary}>
                    Agregar
                  </button>
                </form>
              </article>
            );
          })}
        </div>
      )}

      <section className={adminPanelPadding}>
        <h2 className="text-sm font-medium text-gold mb-3">
          Crear subcategoría (selector manual)
        </h2>
        <form
          onSubmit={handleCreateSubcategoryManual}
          className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
        >
          <div>
            <label className={adminLabel}>Categoría</label>
            <select
              required
              value={subCategoryId}
              onChange={(e) => setSubCategoryId(e.target.value)}
              className={adminSelect}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={adminLabel}>Nombre</label>
            <input
              type="text"
              required
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
              className={adminInput}
            />
          </div>
          <div>
            <label className={adminLabel}>Descripción</label>
            <input
              type="text"
              value={subDescription}
              onChange={(e) => setSubDescription(e.target.value)}
              className={adminInput}
            />
          </div>
          <button type="submit" className={adminBtnPrimary}>
            Crear
          </button>
        </form>
      </section>
    </div>
  );
}
