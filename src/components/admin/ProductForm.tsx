"use client";

import { useState, useEffect } from "react";
import {
  adminBtnPrimary,
  adminInput,
  adminLabel,
  adminMuted,
  adminPanelPadding,
} from "@/lib/admin-styles";
import {
  prepareProductPayload,
  type ProductFormPayload,
} from "@/lib/product-utils";

type Category = { id: string; name: string; slug: string };
type Subcategory = { id: string; name: string; categoryId: string };

type ProductFormProps = {
  categories: Category[];
  initial?: Partial<ProductFormPayload>;
  onSubmit: (data: ReturnType<typeof prepareProductPayload>) => Promise<void>;
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
  const [form, setForm] = useState<ProductFormPayload>({
    name: initial?.name || "",
    slug: initial?.slug || "",
    brand: initial?.brand || "Jon Al Parfum",
    description: initial?.description || "",
    price: initial?.price || 0,
    originalPrice: initial?.originalPrice,
    image: initial?.image || initial?.images?.[0] || "",
    images:
      initial?.images?.length
        ? initial.images
        : initial?.image
          ? [initial.image]
          : [],
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
  const [loadingSubs, setLoadingSubs] = useState(false);

  const loadSubcategories = (categoryId: string) => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }
    setLoadingSubs(true);
    fetch(`/api/admin/subcategories?categoryId=${categoryId}`)
      .then((r) => r.json())
      .then((data: Subcategory[]) => setSubcategories(data))
      .catch(() => setSubcategories([]))
      .finally(() => setLoadingSubs(false));
  };

  useEffect(() => {
    loadSubcategories(form.categoryId);
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

  const update = (field: keyof ProductFormPayload, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    const uploaded: string[] = [];

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (res.ok) {
          uploaded.push(data.url);
        } else {
          alert(data.error || "Error al subir imagen");
        }
      } catch {
        alert("Error al subir imagen");
      }
    }

    if (uploaded.length > 0) {
      setForm((prev) => {
        const images = [...prev.images, ...uploaded];
        return {
          ...prev,
          images,
          image: images[0] || prev.image,
        };
      });
    }

    setUploading(false);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setForm((prev) => {
      const images = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images,
        image: images[0] || "",
      };
    });
  };

  const setPrimaryImage = (index: number) => {
    setForm((prev) => {
      const images = [...prev.images];
      const [selected] = images.splice(index, 1);
      if (!selected) return prev;
      images.unshift(selected);
      return {
        ...prev,
        images,
        image: images[0],
      };
    });
  };

  const addImageUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setForm((prev) => {
      const images = [...prev.images, trimmed];
      return {
        ...prev,
        images,
        image: prev.image || images[0],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(prepareProductPayload(form));
    } catch {
      alert("Error al guardar el producto. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
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
          <div className="flex items-center justify-between gap-2 mb-1">
            <label className={adminLabel}>Subcategoría</label>
            <button
              type="button"
              onClick={() => loadSubcategories(form.categoryId)}
              className="text-[10px] uppercase tracking-wider text-gold hover:text-gold-light"
            >
              {loadingSubs ? "Actualizando…" : "Actualizar lista"}
            </button>
          </div>
          <select
            value={form.subcategoryId || ""}
            onChange={(e) =>
              update("subcategoryId", e.target.value || undefined)
            }
            onFocus={() => loadSubcategories(form.categoryId)}
            className={adminInput}
          >
            <option value="">
              {subcategories.length === 0
                ? "Sin subcategorías — créalas en Categorías"
                : "Sin subcategoría"}
            </option>
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
        <label className={adminLabel}>Fotos del perfume</label>
        <p className={`${adminMuted} mb-3`}>
          Puedes subir varias imágenes. La primera es la foto principal en la
          tienda.
        </p>

        {form.images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
            {form.images.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="relative rounded overflow-hidden border border-gold/20 bg-luxury-black/50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Foto ${index + 1}`}
                  className="w-full aspect-[3/4] object-cover"
                />
                {index === 0 && (
                  <span className="absolute top-1 left-1 bg-gold text-luxury-black text-[9px] uppercase tracking-wider px-1.5 py-0.5">
                    Principal
                  </span>
                )}
                <div className="flex flex-wrap gap-1 p-2 bg-luxury-black/80">
                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(index)}
                      className="text-[9px] uppercase tracking-wider text-gold hover:text-gold-light"
                    >
                      Principal
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="text-[9px] uppercase tracking-wider text-red-400 hover:text-red-300"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleImageUpload}
            className="text-sm text-cream/70"
          />
          {uploading && (
            <p className={adminMuted}>Subiendo imágenes...</p>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              id="manual-image-url"
              placeholder="Pegar URL de imagen"
              className={`${adminInput} flex-1`}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addImageUrl((e.currentTarget as HTMLInputElement).value);
                  (e.currentTarget as HTMLInputElement).value = "";
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById(
                  "manual-image-url"
                ) as HTMLInputElement | null;
                if (!input) return;
                addImageUrl(input.value);
                input.value = "";
              }}
              className="shrink-0 px-3 py-2 text-[10px] uppercase tracking-wider border border-gold/30 text-gold hover:border-gold"
            >
              Agregar URL
            </button>
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
