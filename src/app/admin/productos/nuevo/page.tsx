"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { adminPageTitle } from "@/lib/admin-styles";

type Category = { id: string; name: string; slug: string };

export default function NewProductPage() {
  const router = useRouter();
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
      alert(
        (err as { error?: string }).error || "Error al crear producto"
      );
      throw new Error("create failed");
    }

    router.replace("/admin/productos");
  };

  return (
    <div>
      <h1 className={`${adminPageTitle} mb-6`}>Nuevo producto</h1>
      <ProductForm categories={categories} onSubmit={handleSubmit} />
    </div>
  );
}
