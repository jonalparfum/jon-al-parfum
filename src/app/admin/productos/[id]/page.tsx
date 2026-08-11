"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { useAdminToast } from "@/components/admin/AdminToast";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { fetchJson, fetchJsonArray } from "@/lib/admin-fetch";
import { parseNotes, resolveProductImages } from "@/lib/product-utils";
import {
  adminBtnGhost,
  adminEmptyState,
  adminLink,
  adminLoading,
} from "@/lib/admin-styles";

type Category = { id: string; name: string; slug: string };

type Product = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  description: string;
  price: number;
  originalPrice: number | null;
  image: string;
  images: string;
  size: string;
  notesTop: string;
  notesHeart: string;
  notesBase: string;
  featured: boolean;
  isNew: boolean;
  stock: number;
  active: boolean;
  categoryId: string;
  subcategoryId: string | null;
  updatedAt?: string;
};

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { showToast, showActionModal } = useAdminToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const loadRequestRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const requestId = ++loadRequestRef.current;

    params.then(async ({ id: productId }) => {
      if (cancelled || requestId !== loadRequestRef.current) return;

      const [prodResult, catsResult] = await Promise.all([
        fetchJson<Product>(`/api/admin/products/${productId}`),
        fetchJsonArray<Category>("/api/admin/categories"),
      ]);

      if (cancelled || requestId !== loadRequestRef.current) return;

      setCategories(catsResult.data);

      if (!prodResult.ok || !prodResult.data?.id) {
        setLoadError(prodResult.error || "Producto no encontrado");
        setProduct(null);
        setLoading(false);
        return;
      }

      setProduct(prodResult.data);
      setLoadError("");
      setLoading(false);

      if (!catsResult.ok && catsResult.error) {
        showToast(catsResult.error, "error");
      }
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (!product) return;

    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showToast(
        (err as { error?: string }).error || "Error al actualizar producto",
        "error"
      );
      throw new Error("update failed");
    }

    const saved = (await res.json()) as Product;
    setProduct(saved);
    showActionModal("Producto modificado");
  };

  if (loading) {
    return <p className={adminLoading}>Cargando producto...</p>;
  }

  if (loadError || !product) {
    return (
      <div className={adminEmptyState}>
        <p className="text-charcoal/70 mb-4">{loadError || "Producto no encontrado"}</p>
        <Link href="/admin/productos" className={adminLink}>
          ← Volver a productos
        </Link>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader title="Editar producto" subtitle={product.name}>
        <Link href="/admin/productos" className={adminBtnGhost}>
          ← Volver
        </Link>
      </AdminPageHeader>

      <ProductForm
        key={`${product.id}-${product.updatedAt ?? product.image}`}
        categories={categories}
        initial={{
          name: product.name,
          slug: product.slug,
          brand: product.brand,
          description: product.description,
          price: product.price,
          originalPrice: product.originalPrice ?? undefined,
          image: product.image,
          images: resolveProductImages(product.image, product.images),
          size: product.size,
          notesTop: parseNotes(product.notesTop),
          notesHeart: parseNotes(product.notesHeart),
          notesBase: parseNotes(product.notesBase),
          featured: product.featured,
          isNew: product.isNew,
          stock: product.stock,
          active: product.active,
          categoryId: product.categoryId,
          subcategoryId: product.subcategoryId ?? undefined,
        }}
        onSubmit={handleSubmit}
        mode="edit"
      />
    </div>
  );
}
