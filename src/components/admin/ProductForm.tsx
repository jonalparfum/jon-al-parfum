"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAdminToast } from "@/components/admin/AdminToast";
import { fetchJsonArray } from "@/lib/admin-fetch";
import {
  adminBtnGhost,
  adminBtnPrimary,
  adminFormSection,
  adminInput,
  adminLabel,
  adminLink,
  adminLinkDanger,
  adminMuted,
  adminSectionTitle,
  adminSelect,
} from "@/lib/admin-styles";
import {
  prepareProductPayload,
  type ProductFormPayload,
} from "@/lib/product-utils";
import { STRIPE_MIN_MXN } from "@/lib/stripe-limits";
import { validateProductVariants } from "@/lib/product-variants";

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
    <section className={adminFormSection}>
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
    price: initial?.price || STRIPE_MIN_MXN,
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
    useVariants: initial?.useVariants ?? Boolean(initial?.variants?.length),
    variants:
      initial?.variants?.length
        ? initial.variants
        : [
            { label: "3ml", price: STRIPE_MIN_MXN, stock: 0 },
            { label: "5ml", price: STRIPE_MIN_MXN, stock: 0 },
            { label: "10ml", price: STRIPE_MIN_MXN, stock: 0 },
          ],
  });
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const subsRequestRef = useRef(0);
  const subsFetchOkRef = useRef(false);

  const loadSubcategories = (categoryId: string) => {
    if (!categoryId) {
      setSubcategories([]);
      subsFetchOkRef.current = false;
      return;
    }
    const requestId = ++subsRequestRef.current;
    setLoadingSubs(true);
    fetchJsonArray<Subcategory>(
      `/api/admin/subcategories?categoryId=${categoryId}`
    )
      .then(({ ok, data, error }) => {
        if (requestId !== subsRequestRef.current) return;
        subsFetchOkRef.current = ok;
        setSubcategories(data);
        if (!ok && error) showToast(error, "error");
      })
      .finally(() => {
        if (requestId === subsRequestRef.current) setLoadingSubs(false);
      });
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
    if (loadingSubs || !subsFetchOkRef.current) return;
    if (!form.subcategoryId) return;
    if (!subcategories.some((sub) => sub.id === form.subcategoryId)) {
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

        if (res.ok && typeof data.url === "string" && data.url) {
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

    if (form.useVariants) {
      const variantError = validateProductVariants(form.variants ?? []);
      if (variantError) {
        showToast(variantError, "error");
        return;
      }
    } else if (!Number.isFinite(form.price) || form.price < STRIPE_MIN_MXN) {
      showToast(
        `El precio mínimo es ${STRIPE_MIN_MXN} MXN (límite de Stripe)`,
        "error"
      );
      return;
    }

    setSaving(true);
    try {
      await onSubmit(prepareProductPayload(form));
    } catch {
      // El padre ya muestra el error (toast o modal).
    } finally {
      setSaving(false);
    }
  };

  const updateVariant = (
    index: number,
    field: "label" | "price" | "stock",
    value: string
  ) => {
    setForm((prev) => {
      const variants = [...(prev.variants ?? [])];
      const current = variants[index];
      if (!current) return prev;

      if (field === "label") {
        variants[index] = { ...current, label: value };
      } else if (field === "price") {
        const val = parseFloat(value);
        variants[index] = {
          ...current,
          price: Number.isFinite(val) ? val : 0,
        };
      } else {
        const val = parseInt(value, 10);
        variants[index] = {
          ...current,
          stock: Number.isFinite(val) ? val : 0,
        };
      }

      return { ...prev, variants };
    });
  };

  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [
        ...(prev.variants ?? []),
        { label: "", price: STRIPE_MIN_MXN, stock: 0 },
      ],
    }));
  };

  const removeVariant = (index: number) => {
    setForm((prev) => ({
      ...prev,
      variants: (prev.variants ?? []).filter((_, i) => i !== index),
    }));
  };

  const checkboxClass =
    "h-4 w-4 rounded border-stone-300 bg-white text-gold focus:ring-gold/30";

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
        description={`Precios en pesos mexicanos (MXN). Mínimo ${STRIPE_MIN_MXN} MXN por presentación (límite de Stripe para pagos con tarjeta).`}
      >
        <label className="flex items-center gap-2.5 text-sm text-charcoal/80 cursor-pointer mb-5">
          <input
            type="checkbox"
            checked={Boolean(form.useVariants)}
            onChange={(e) => update("useVariants", e.target.checked)}
            className={checkboxClass}
          />
          Varios tamaños (3ml, 5ml, 10ml…) con precio y stock individual
        </label>

        {form.useVariants ? (
          <div className="space-y-3">
            {(form.variants ?? []).map((variant, index) => (
              <div
                key={index}
                className="grid grid-cols-1 sm:grid-cols-[1fr_120px_100px_auto] gap-3 items-end p-4 rounded-lg border border-stone-200 bg-stone-50/50"
              >
                <div>
                  <label className={adminLabel}>Tamaño</label>
                  <input
                    type="text"
                    required
                    value={variant.label}
                    onChange={(e) =>
                      updateVariant(index, "label", e.target.value)
                    }
                    className={adminInput}
                    placeholder="Ej: 5ml"
                  />
                </div>
                <div>
                  <label className={adminLabel}>Precio (MXN)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={STRIPE_MIN_MXN}
                    required
                    value={variant.price}
                    onChange={(e) =>
                      updateVariant(index, "price", e.target.value)
                    }
                    className={adminInput}
                  />
                </div>
                <div>
                  <label className={adminLabel}>Stock</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={variant.stock}
                    onChange={(e) =>
                      updateVariant(index, "stock", e.target.value)
                    }
                    className={adminInput}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  disabled={(form.variants?.length ?? 0) <= 1}
                  className={`${adminLinkDanger} pb-2.5 disabled:opacity-30`}
                >
                  Quitar
                </button>
              </div>
            ))}
            <button type="button" onClick={addVariant} className={adminBtnGhost}>
              + Agregar tamaño
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className={adminLabel}>Precio (MXN) *</label>
              <input
                type="number"
                step="0.01"
                min={STRIPE_MIN_MXN}
                required
                value={form.price}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  update("price", Number.isFinite(val) ? val : 0);
                }}
                className={adminInput}
              />
              <p className={`${adminMuted} mt-2 text-xs`}>
                Mínimo {STRIPE_MIN_MXN} MXN para que el cliente pueda pagar con tarjeta.
              </p>
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
        )}
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
          <label className={adminLabel}>
            {form.useVariants ? "Tamaño (referencia)" : "Tamaño"}
          </label>
          <input
            type="text"
            value={form.size}
            onChange={(e) => update("size", e.target.value)}
            className={adminInput}
            disabled={Boolean(form.useVariants)}
            placeholder={form.useVariants ? "Se genera desde los tamaños" : "100ml"}
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
                className="relative rounded-lg overflow-hidden border border-stone-200 bg-stone-50"
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
                <div className="flex flex-wrap gap-2 p-2 bg-white border-t border-stone-200">
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
                    className={adminLinkDanger}
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
          <label className="flex items-center gap-2.5 text-sm text-charcoal/80 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => update("featured", e.target.checked)}
              className={checkboxClass}
            />
            Destacado en tienda
          </label>
          <label className="flex items-center gap-2.5 text-sm text-charcoal/80 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isNew}
              onChange={(e) => update("isNew", e.target.checked)}
              className={checkboxClass}
            />
            Marcar como nuevo
          </label>
          <label className="flex items-center gap-2.5 text-sm text-charcoal/80 cursor-pointer">
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
