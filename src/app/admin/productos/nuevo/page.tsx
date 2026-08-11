"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { useAdminToast } from "@/components/admin/AdminToast";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { fetchJsonArray } from "@/lib/admin-fetch";
import { adminLink, adminLoading, adminMuted } from "@/lib/admin-styles";

type Category = { id: string; name: string; slug: string };

export default function NewProductPage() {
  const router = useRouter();
  const { showToast } = useAdminToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    fetchJsonArray<Category>("/api/admin/categories").then(({ ok, data, error }) => {
      setCategories(data);
      if (!ok && error) showToast(error, "error");
      setLoadingCategories(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (data: Record<string, unknown>) => {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showToast(
        (err as { error?: string }).error || "Error al crear producto",
        "error"
      );
      throw new Error("create failed");
    }

    showToast("Producto creado correctamente");
    router.replace("/admin/productos");
  };

  return (
    <div>
      <AdminPageHeader
        title="Nuevo producto"
        subtitle="Completa la información para publicar un perfume en la tienda."
      />

      {loadingCategories ? (
        <p className={adminLoading}>Cargando categorías...</p>
      ) : categories.length === 0 ? (
        <p className={adminMuted}>
          Primero crea una categoría en{" "}
          <Link href="/admin/catalogos" className={adminLink}>
            Categorías
          </Link>
          .
        </p>
      ) : (
        <ProductForm
          categories={categories}
          onSubmit={handleSubmit}
          mode="create"
        />
      )}
    </div>
  );
}
