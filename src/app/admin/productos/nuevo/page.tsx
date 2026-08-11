"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { useAdminToast } from "@/components/admin/AdminToast";
import {
  adminLink,
  adminPageTitle,
  adminSubtitle,
} from "@/lib/admin-styles";

type Category = { id: string; name: string; slug: string };

export default function NewProductPage() {
  const router = useRouter();
  const { showToast } = useAdminToast();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then(setCategories);
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
      <Link href="/admin/productos" className={`${adminLink} text-xs uppercase tracking-wider`}>
        ← Volver a productos
      </Link>
      <div className="mt-4 mb-8">
        <h1 className={adminPageTitle}>Nuevo producto</h1>
        <p className={adminSubtitle}>
          Completa la información para publicar un perfume en la tienda.
        </p>
      </div>
      <ProductForm
        categories={categories}
        onSubmit={handleSubmit}
        mode="create"
      />
    </div>
  );
}
