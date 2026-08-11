import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "Hombre", slug: "hombre", description: "Fragancias masculinas" },
  { name: "Mujer", slug: "mujer", description: "Fragancias femeninas" },
  { name: "Unisex", slug: "unisex", description: "Fragancias unisex" },
];

const products = [
  {
    name: "Élégance Nocturne",
    slug: "elegance-nocturne",
    description:
      "Una fragancia sofisticada que captura la esencia de las noches parisinas. Notas amaderadas y especiadas se entrelazan con un toque de vainilla bourbon.",
    price: 89.99,
    originalPrice: 110.0,
    image: "/uploads/products/elegance-nocturne.jpg",
    categorySlug: "mujer",
    notesTop: ["Bergamota", "Pimienta rosa"],
    notesHeart: ["Rosa de Damasco", "Iris"],
    notesBase: ["Sándalo", "Vainilla bourbon", "Ámbar"],
    featured: true,
  },
  {
    name: "Soleil d'Or",
    slug: "soleil-dor",
    description:
      "Radiante y luminoso, evoca los atardeceres mediterráneos. Cítricos vibrantes dan paso a un corazón floral y un fondo cálido de madera de cedro.",
    price: 79.99,
    image: "/uploads/products/soleil-dor.jpg",
    categorySlug: "unisex",
    notesTop: ["Limón siciliano", "Neroli", "Mandarina"],
    notesHeart: ["Jazmín", "Azahar"],
    notesBase: ["Cedro", "Almizcle blanco"],
    featured: true,
    isNew: true,
  },
  {
    name: "Riviera",
    slug: "riviera",
    description:
      "Fresco como la brisa marina de la Costa Azul. Acuático y aromático, perfecto para el hombre moderno y seguro de sí mismo.",
    price: 84.99,
    image: "/uploads/products/riviera.jpg",
    categorySlug: "hombre",
    notesTop: ["Menta", "Limón", "Sal marina"],
    notesHeart: ["Lavanda", "Geranio"],
    notesBase: ["Vetiver", "Pachulí"],
    featured: true,
  },
  {
    name: "Velours Rouge",
    slug: "velours-rouge",
    description:
      "Sensual y envolvente. Un bouquet de flores rojas sobre un lecho de almizcle y cuero suave.",
    price: 95.99,
    image: "/uploads/products/velours-rouge.jpg",
    categorySlug: "mujer",
    notesTop: ["Frambuesa", "Grosella negra"],
    notesHeart: ["Rosa roja", "Peonía"],
    notesBase: ["Cuero", "Almizcle", "Pachulí"],
  },
  {
    name: "Atlas",
    slug: "atlas",
    description:
      "Inspirado en los mercados de especias de Marrakech. Cálido, especiado y misterioso.",
    price: 92.99,
    image: "/uploads/products/atlas.jpg",
    categorySlug: "hombre",
    notesTop: ["Cardamomo", "Comino", "Bergamota"],
    notesHeart: ["Rosa", "Clavo"],
    notesBase: ["Oud", "Incienso", "Benjuí"],
    isNew: true,
  },
  {
    name: "Lune Blanche",
    slug: "lune-blanche",
    description:
      "Etéreo y delicado como la luz de la luna. Flores blancas y almizcle crean una aura de pureza.",
    price: 87.99,
    image: "/uploads/products/lune-blanche.jpg",
    categorySlug: "mujer",
    notesTop: ["Perla de jazmín", "Lila"],
    notesHeart: ["Tuberose", "Magnolia"],
    notesBase: ["Almizcle blanco", "Cashmeran"],
  },
  {
    name: "Urban Spirit",
    slug: "urban-spirit",
    description:
      "La energía de la ciudad condensada en un frasco. Notas verdes y amaderadas.",
    price: 74.99,
    image: "/uploads/products/urban-spirit.jpg",
    categorySlug: "unisex",
    notesTop: ["Pomelo", "Hoja de violeta"],
    notesHeart: ["Violeta", "Geranio"],
    notesBase: ["Cedro", "Vetiver", "Musgo"],
  },
  {
    name: "Heritage",
    slug: "heritage",
    description:
      "Un homenaje a la tradición perfumística. Clásico, refinado y atemporal.",
    price: 99.99,
    image: "/uploads/products/heritage.jpg",
    categorySlug: "hombre",
    notesTop: ["Lavanda", "Romero"],
    notesHeart: ["Clavel", "Canela"],
    notesBase: ["Tabaco", "Cuero", "Vetiver"],
    featured: true,
  },
];

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@jonalparfum.com" },
    update: {},
    create: {
      email: "admin@jonalparfum.com",
      name: "Administrador",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  const demoPassword = await bcrypt.hash("demo123", 12);
  await prisma.user.upsert({
    where: { email: "demo@jonalparfum.com" },
    update: {},
    create: {
      email: "demo@jonalparfum.com",
      name: "Usuario Demo",
      passwordHash: demoPassword,
      role: "USER",
    },
  });

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: cat,
    });
  }

  for (const product of products) {
    const category = await prisma.category.findUnique({
      where: { slug: product.categorySlug },
    });
    if (!category) continue;

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice ?? null,
        image: product.image,
        images: JSON.stringify([product.image]),
        notesTop: JSON.stringify(product.notesTop),
        notesHeart: JSON.stringify(product.notesHeart),
        notesBase: JSON.stringify(product.notesBase),
        featured: product.featured ?? false,
        isNew: product.isNew ?? false,
        categoryId: category.id,
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice ?? null,
        image: product.image,
        images: JSON.stringify([product.image]),
        notesTop: JSON.stringify(product.notesTop),
        notesHeart: JSON.stringify(product.notesHeart),
        notesBase: JSON.stringify(product.notesBase),
        featured: product.featured ?? false,
        isNew: product.isNew ?? false,
        categoryId: category.id,
      },
    });
  }

  console.log("Seed completado:");
  console.log("  Admin: admin@jonalparfum.com / admin123");
  console.log("  Demo:  demo@jonalparfum.com / demo123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
