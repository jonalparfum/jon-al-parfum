"use client";

import { useState } from "react";
import Image from "next/image";

type Category = { id: string; name: string; slug: string };

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
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

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
      className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 max-w-3xl space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
            placeholder="auto-generado si vacío"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción *</label>
        <textarea
          required
          rows={4}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Precio (€) *</label>
          <input
            type="number"
            step="0.01"
            required
            value={form.price}
            onChange={(e) => update("price", parseFloat(e.target.value))}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Precio original</label>
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
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Stock</label>
          <input
            type="number"
            value={form.stock}
            onChange={(e) => update("stock", parseInt(e.target.value))}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Catálogo *</label>
          <select
            required
            value={form.categoryId}
            onChange={(e) => update("categoryId", e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tamaño</label>
          <input
            type="text"
            value={form.size}
            onChange={(e) => update("size", e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Imagen del perfume</label>
        <div className="flex items-start gap-4">
          {form.image && (
            <div className="relative w-24 h-32 rounded overflow-hidden border">
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
              className="text-sm"
            />
            {uploading && (
              <p className="text-sm text-gray-500 mt-1">Subiendo...</p>
            )}
            <input
              type="text"
              value={form.image}
              onChange={(e) => update("image", e.target.value)}
              placeholder="URL de imagen"
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm mt-2"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Notas de salida (separadas por coma)
          </label>
          <input
            type="text"
            value={notesToString(form.notesTop)}
            onChange={(e) => update("notesTop", stringToNotes(e.target.value))}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Notas de corazón</label>
          <input
            type="text"
            value={notesToString(form.notesHeart)}
            onChange={(e) =>
              update("notesHeart", stringToNotes(e.target.value))
            }
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Notas de fondo</label>
          <input
            type="text"
            value={notesToString(form.notesBase)}
            onChange={(e) => update("notesBase", stringToNotes(e.target.value))}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => update("featured", e.target.checked)}
          />
          Destacado
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isNew}
            onChange={(e) => update("isNew", e.target.checked)}
          />
          Nuevo
        </label>
        <label className="flex items-center gap-2 text-sm">
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
        className="bg-charcoal text-white px-6 py-3 text-sm uppercase tracking-wider hover:bg-gold transition-colors disabled:opacity-50"
      >
        {saving ? "Guardando..." : "Guardar producto"}
      </button>
    </form>
  );
}
