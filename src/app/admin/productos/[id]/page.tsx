"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { useAdminToast } from "@/components/admin/AdminToast";
import { parseNotes, resolveProductImages } from "@/lib/product-utils";
import {
  adminLink,
  adminLoading,
  adminPageTitle,
  adminSubtitle,
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
  const { showToast } = useAdminToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [id, setId] = useState("");

  useEffect(() => {
    params.then(({ id: productId }) => {
      setId(productId);
      Promise.all([
        fetch(`/api/admin/products/${productId}`).then((r) => r.json()),
        fetch("/api/admin/categories").then((r) => r.json()),
      ]).then(([prod, cats]) => {
        setProduct(prod);
        setCategories(cats);
      });
    });
  }, [params]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/products/${id}`, {
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
    showToast("Producto guardado correctamente");
  };

  if (!product) {
    return <p className={adminLoading}>Cargando producto...</p>;
  }

  return (
    <div>
      <Link href="/admin/productos" className={`${adminLink} text-xs uppercase tracking-wider`}>
        ← Volver a productos
      </Link>
      <div className="mt-4 mb-8">
        <h1 className={adminPageTitle}>Editar producto</h1>
        <p className={adminSubtitle}>{product.name}</p>
      </div>
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
