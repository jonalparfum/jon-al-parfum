"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  adminBtnPrimary,
  adminInput,
  adminLabel,
  adminMuted,
  adminPanelPadding,
  adminSelect,
} from "@/lib/admin-styles";

type Category = { id: string; name: string; slug: string };
type Subcategory = { id: string; name: string; categoryId: string };

type ProductFormData = {
  name: string;
  slug: string;
  brand: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  size: string;
  notesTop: string[];
  notesHeart: string[];
  notesBase: string[];
  featured: boolean;
  isNew: boolean;
  stock: number;
  active: boolean;
  categoryId: string;
  subcategoryId?: string;
};

type ProductFormProps = {
  categories: Category[];
  initial?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
};

function notesToString(notes: string[]): string {
  return notes.join(", ");
}

function stringToNotes(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function ProductForm({
  categories,
  initial,
  onSubmit,
}: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>({
    name: initial?.name || "",
    slug: initial?.slug || "",
    brand: initial?.brand || "Jon Al Parfum",
    description: initial?.description || "",
    price: initial?.price || 0,
    originalPrice: initial?.originalPrice,
    image: initial?.image || "",
    size: initial?.size || "100ml",
    notesTop: initial?.notesTop || [],
    notesHeart: initial?.notesHeart || [],
    notesBase: initial?.notesBase || [],
    featured: initial?.featured ?? false,
    isNew: initial?.isNew ?? false,
    stock: initial?.stock ?? 100,
    active: initial?.active ?? true,
    categoryId: initial?.categoryId || categories[0]?.id || "",
    subcategoryId: initial?.subcategoryId || "",
  });
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!form.categoryId) {
      setSubcategories([]);
      return;
    }
    fetch(`/api/admin/subcategories?categoryId=${form.categoryId}`)
      .then((r) => r.json())
      .then((data: Subcategory[]) => setSubcategories(data))
      .catch(() => setSubcategories([]));
  }, [form.categoryId]);

  useEffect(() => {
    if (
      form.subcategoryId &&
      !subcategories.some((sub) => sub.id === form.subcategoryId)
    ) {
      update("subcategoryId", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subcategories]);

  const update = (field: keyof ProductFormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (res.ok) {
      update("image", data.url);
    } else {
      alert(data.error || "Error al subir imagen");
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSubmit(form);
    setSaving(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`${adminPanelPadding} max-w-3xl space-y-6`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={adminLabel}>Nombre *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={adminInput}
          />
        </div>
        <div>
          <label className={adminLabel}>Slug</label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            className={adminInput}
            placeholder="auto-generado si vacío"
          />
        </div>
      </div>

      <div>
        <label className={adminLabel}>Descripción *</label>
        <textarea
          required
          rows={4}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className={adminInput}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className={adminLabel}>Precio (MXN) *</label>
          <input
            type="number"
            step="0.01"
            required
            value={form.price}
            onChange={(e) => update("price", parseFloat(e.target.value))}
            className={adminInput}
          />
        </div>
        <div>
          <label className={adminLabel}>Precio original (MXN)</label>
          <input
            type="number"
            step="0.01"
            value={form.originalPrice || ""}
            onChange={(e) =>
              update(
                "originalPrice",
                e.target.value ? parseFloat(e.target.value) : undefined
              )
            }
            className={adminInput}
          />
        </div>
        <div>
          <label className={adminLabel}>Stock</label>
          <input
            type="number"
            value={form.stock}
            onChange={(e) => update("stock", parseInt(e.target.value))}
            className={adminInput}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className={adminLabel}>Marca</label>
          <input
            type="text"
            value={form.brand}
            onChange={(e) => update("brand", e.target.value)}
            className={adminInput}
            placeholder="Ej: Dior, Tom Ford…"
          />
        </div>
        <div>
          <label className={adminLabel}>Categoría *</label>
          <select
            required
            value={form.categoryId}
            onChange={(e) => {
              update("categoryId", e.target.value);
              update("subcategoryId", "");
            }}
            className={adminInput}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={adminLabel}>Subcategoría</label>
          <select
            value={form.subcategoryId || ""}
            onChange={(e) =>
              update("subcategoryId", e.target.value || undefined)
            }
            className={adminInput}
          >
            <option value="">Sin subcategoría</option>
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={adminLabel}>Tamaño</label>
          <input
            type="text"
            value={form.size}
            onChange={(e) => update("size", e.target.value)}
            className={adminInput}
          />
        </div>
      </div>

      <div>
        <label className={adminLabel}>Imagen del perfume</label>
        <div className="flex items-start gap-4">
          {form.image && (
            <div className="relative w-24 h-32 rounded overflow-hidden border border-gold/20">
              <Image
                src={form.image}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          )}
          <div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
              className="text-sm text-cream/70"
            />
            {uploading && (
              <p className={`${adminMuted} mt-1`}>Subiendo...</p>
            )}
            <input
              type="text"
              value={form.image}
              onChange={(e) => update("image", e.target.value)}
              placeholder="URL de imagen"
              className={`${adminInput} mt-2`}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className={adminLabel}>
            Notas de salida (separadas por coma)
          </label>
          <input
            type="text"
            value={notesToString(form.notesTop)}
            onChange={(e) => update("notesTop", stringToNotes(e.target.value))}
            className={adminInput}
          />
        </div>
        <div>
          <label className={adminLabel}>Notas de corazón</label>
          <input
            type="text"
            value={notesToString(form.notesHeart)}
            onChange={(e) =>
              update("notesHeart", stringToNotes(e.target.value))
            }
            className={adminInput}
          />
        </div>
        <div>
          <label className={adminLabel}>Notas de fondo</label>
          <input
            type="text"
            value={notesToString(form.notesBase)}
            onChange={(e) => update("notesBase", stringToNotes(e.target.value))}
            className={adminInput}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-cream/80">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => update("featured", e.target.checked)}
          />
          Destacado
        </label>
        <label className="flex items-center gap-2 text-sm text-cream/80">
          <input
            type="checkbox"
            checked={form.isNew}
            onChange={(e) => update("isNew", e.target.checked)}
          />
          Nuevo
        </label>
        <label className="flex items-center gap-2 text-sm text-cream/80">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => update("active", e.target.checked)}
          />
          Activo
        </label>
      </div>

      <button
        type="submit"
        disabled={saving}
        className={`${adminBtnPrimary} px-6 py-3 disabled:opacity-50`}
      >
        {saving ? "Guardando..." : "Guardar producto"}
      </button>
    </form>
  );
}
