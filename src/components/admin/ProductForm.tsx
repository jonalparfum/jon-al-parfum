"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAdminToast } from "@/components/admin/AdminToast";
import {
  adminBtnGhost,
  adminBtnPrimary,
  adminCard,
  adminInput,
  adminLabel,
  adminLink,
  adminMuted,
  adminSectionTitle,
  adminSelect,
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
  mode?: "create" | "edit";
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

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={adminCard}>
      <h2 className={adminSectionTitle}>{title}</h2>
      {description && <p className={`${adminMuted} mb-5`}>{description}</p>}
      {!description && <div className="mb-5" />}
      {children}
    </section>
  );
}

export default function ProductForm({
  categories,
  initial,
  onSubmit,
  mode = "create",
}: ProductFormProps) {
  const { showToast } = useAdminToast();
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
  const [manualUrl, setManualUrl] = useState("");

  const loadSubcategories = (categoryId: string) => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }
    setLoadingSubs(true);
    fetch(`/api/admin/subcategories?categoryId=${categoryId}`)
      .then(async (r) => {
        if (!r.ok) return [] as Subcategory[];
        const data: unknown = await r.json();
        return Array.isArray(data) ? (data as Subcategory[]) : [];
      })
      .then((data) => setSubcategories(data))
      .catch(() => setSubcategories([]))
      .finally(() => setLoadingSubs(false));
  };

  useEffect(() => {
    loadSubcategories(form.categoryId);
  }, [form.categoryId]);

  useEffect(() => {
    if (categories.length > 0 && !form.categoryId) {
      setForm((prev) =>
        prev.categoryId ? prev : { ...prev, categoryId: categories[0].id }
      );
    }
  }, [categories, form.categoryId]);

  useEffect(() => {
    if (loadingSubs) return;
    if (
      form.subcategoryId &&
      subcategories.length > 0 &&
      !subcategories.some((sub) => sub.id === form.subcategoryId)
    ) {
      update("subcategoryId", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subcategories, loadingSubs]);

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
          showToast(data.error || "Error al subir imagen", "error");
        }
      } catch {
        showToast("Error al subir imagen", "error");
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
      showToast(
        uploaded.length === 1
          ? "Imagen subida"
          : `${uploaded.length} imágenes subidas`
      );
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
    showToast("Imagen principal actualizada");
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
    setManualUrl("");
    showToast("URL agregada");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(prepareProductPayload(form));
    } finally {
      setSaving(false);
    }
  };

  const checkboxClass =
    "h-4 w-4 rounded border-gold/30 bg-luxury-black text-gold focus:ring-gold/30";

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      <FormSection
        title="Información básica"
        description="Nombre, descripción y datos de identificación del perfume."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

        <div className="mt-5">
          <label className={adminLabel}>Descripción *</label>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className={adminInput}
          />
        </div>
      </FormSection>

      <FormSection
        title="Precio e inventario"
        description="Precios en pesos mexicanos (MXN) y unidades disponibles."
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className={adminLabel}>Precio (MXN) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={form.price}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                update("price", Number.isFinite(val) ? val : 0);
              }}
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
                  e.target.value
                    ? (() => {
                        const val = parseFloat(e.target.value);
                        return Number.isFinite(val) ? val : undefined;
                      })()
                    : undefined
                )
              }
              className={adminInput}
              placeholder="Para ofertas"
            />
          </div>
          <div>
            <label className={adminLabel}>Stock</label>
            <input
              type="number"
              value={form.stock}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                update("stock", Number.isFinite(val) ? val : 0);
              }}
              className={adminInput}
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Catálogo"
        description="Clasifica el producto dentro de tu tienda."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label className={adminLabel}>Subcategoría</label>
              <button
                type="button"
                onClick={() => loadSubcategories(form.categoryId)}
                className="text-[10px] uppercase tracking-wider text-gold hover:text-gold-light"
              >
                {loadingSubs ? "Actualizando…" : "Actualizar"}
              </button>
            </div>
            <select
              value={form.subcategoryId || ""}
              onChange={(e) =>
                update("subcategoryId", e.target.value || undefined)
              }
              onFocus={() => loadSubcategories(form.categoryId)}
              className={adminSelect}
            >
              <option value="">
                {subcategories.length === 0
                  ? "Sin subcategorías"
                  : "Sin subcategoría"}
              </option>
              {subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
            {subcategories.length === 0 && (
              <p className={`${adminMuted} mt-2`}>
                <Link href="/admin/catalogos" className={adminLink}>
                  Crear subcategorías →
                </Link>
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 max-w-xs">
          <label className={adminLabel}>Tamaño</label>
          <input
            type="text"
            value={form.size}
            onChange={(e) => update("size", e.target.value)}
            className={adminInput}
          />
        </div>
      </FormSection>

      <FormSection
        title="Imágenes"
        description="La primera imagen es la foto principal en la tienda. Puedes subir varias o pegar URLs."
      >
        {form.images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-5">
            {form.images.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="relative rounded-lg overflow-hidden border border-gold/20 bg-luxury-black/50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Foto ${index + 1}`}
                  className="w-full aspect-[3/4] object-cover"
                />
                {index === 0 && (
                  <span className="absolute top-2 left-2 bg-gold text-luxury-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded">
                    Principal
                  </span>
                )}
                <div className="flex flex-wrap gap-2 p-2 bg-luxury-black/90 border-t border-gold/10">
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

        <div className="space-y-3">
          <label className="flex flex-col items-start gap-2 cursor-pointer">
            <span className={adminBtnGhost}>Seleccionar archivos</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageUpload}
              className="sr-only"
            />
          </label>
          {uploading && <p className={adminMuted}>Subiendo imágenes...</p>}
          <div className="flex gap-2">
            <input
              type="text"
              value={manualUrl}
              placeholder="Pegar URL de imagen"
              className={`${adminInput} flex-1`}
              onChange={(e) => setManualUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addImageUrl(manualUrl);
                }
              }}
            />
            <button
              type="button"
              onClick={() => addImageUrl(manualUrl)}
              className={adminBtnGhost}
            >
              Agregar URL
            </button>
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Notas olfativas"
        description="Separa cada nota con comas."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className={adminLabel}>Notas de salida</label>
            <input
              type="text"
              value={notesToString(form.notesTop)}
              onChange={(e) =>
                update("notesTop", stringToNotes(e.target.value))
              }
              className={adminInput}
              placeholder="Bergamota, limón…"
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
              placeholder="Rosa, jazmín…"
            />
          </div>
          <div>
            <label className={adminLabel}>Notas de fondo</label>
            <input
              type="text"
              value={notesToString(form.notesBase)}
              onChange={(e) =>
                update("notesBase", stringToNotes(e.target.value))
              }
              className={adminInput}
              placeholder="Vainilla, ámbar…"
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Visibilidad">
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2.5 text-sm text-cream/80 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => update("featured", e.target.checked)}
              className={checkboxClass}
            />
            Destacado en tienda
          </label>
          <label className="flex items-center gap-2.5 text-sm text-cream/80 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isNew}
              onChange={(e) => update("isNew", e.target.checked)}
              className={checkboxClass}
            />
            Marcar como nuevo
          </label>
          <label className="flex items-center gap-2.5 text-sm text-cream/80 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => update("active", e.target.checked)}
              className={checkboxClass}
            />
            Visible en tienda
          </label>
        </div>
      </FormSection>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className={`${adminBtnPrimary} px-8 py-3 disabled:opacity-50`}
        >
          {saving
            ? "Guardando..."
            : mode === "edit"
              ? "Guardar cambios"
              : "Crear producto"}
        </button>
        <Link href="/admin/productos" className={adminBtnGhost}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
