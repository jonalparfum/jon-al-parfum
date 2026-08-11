"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { parseNotes } from "@/lib/product-utils";

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
  size: string;
  notesTop: string;
  notesHeart: string;
  notesBase: string;
  featured: boolean;
  isNew: boolean;
  stock: number;
  active: boolean;
  categoryId: string;
};

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
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

    if (res.ok) {
      router.push("/admin/productos");
    } else {
      const err = await res.json();
      alert(err.error || "Error al actualizar producto");
    }
  };

  if (!product) {
    return <p className="text-gray-500">Cargando...</p>;
  }

  return (
    <div>
      <h1 className="font-serif text-2xl mb-6">Editar producto</h1>
      <ProductForm
        categories={categories}
        initial={{
          name: product.name,
          slug: product.slug,
          brand: product.brand,
          description: product.description,
          price: product.price,
          originalPrice: product.originalPrice ?? undefined,
          image: product.image,
          size: product.size,
          notesTop: parseNotes(product.notesTop),
          notesHeart: parseNotes(product.notesHeart),
          notesBase: parseNotes(product.notesBase),
          featured: product.featured,
          isNew: product.isNew,
          stock: product.stock,
          active: product.active,
          categoryId: product.categoryId,
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
