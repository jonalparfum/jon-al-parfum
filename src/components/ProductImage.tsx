"use client";

import Image from "next/image";
import { useState } from "react";

const gradients: Record<string, string> = {
  hombre: "from-stone-800 via-amber-900 to-stone-950",
  mujer: "from-purple-900 via-rose-800 to-red-950",
  unisex: "from-emerald-700 via-teal-600 to-cyan-700",
};

type ProductImageProps = {
  src: string;
  alt: string;
  category?: string;
  className?: string;
  priority?: boolean;
};

export default function ProductImage({
  src,
  alt,
  category = "unisex",
  className = "",
  priority = false,
}: ProductImageProps) {
  const [error, setError] = useState(false);
  const gradient = gradients[category] || gradients.unisex;

  if (error || !src || src.includes("placeholder")) {
    return (
      <div
        className={`relative bg-gradient-to-br ${gradient} flex items-end justify-center overflow-hidden ${className}`}
      >
        <div className="relative mb-8 w-16 h-32 bg-white/20 backdrop-blur-sm rounded-t-full border border-white/30 shadow-2xl" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 25vw"
        priority={priority}
        onError={() => setError(true)}
      />
    </div>
  );
}
