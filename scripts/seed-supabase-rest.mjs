#!/usr/bin/env node
/**
 * Seed Supabase via REST API (service role) when Prisma direct connection unavailable.
 */
const URL = process.env.SUPABASE_URL || "https://qsbckliglejhyzeoymym.supabase.co";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!KEY) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
  Prefer: "resolution=merge-duplicates",
};

async function upsert(table, rows) {
  const res = await fetch(`${URL}/rest/v1/${table}`, {
    method: "POST",
    headers: { ...headers, Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${table}: ${res.status} ${text}`);
  }
  console.log(`✓ ${table}: ${rows.length} rows`);
}

const categories = [
  { id: "cat_hombre", name: "Hombre", slug: "hombre", description: "Fragancias masculinas", updatedAt: new Date().toISOString() },
  { id: "cat_mujer", name: "Mujer", slug: "mujer", description: "Fragancias femeninas", updatedAt: new Date().toISOString() },
  { id: "cat_unisex", name: "Unisex", slug: "unisex", description: "Fragancias unisex", updatedAt: new Date().toISOString() },
];

const users = [
  { id: "admin_seed", name: "Administrador", email: "admin@jonalparfum.com", passwordHash: "$2b$12$Ospq03C4zXamBy4RdNtGKuDsboZ8H6AVLo9LTN1l/dA0Hlhicnana", role: "ADMIN", updatedAt: new Date().toISOString() },
  { id: "demo_seed", name: "Usuario Demo", email: "demo@jonalparfum.com", passwordHash: "$2b$12$B4izMrluAAbZHDeVmmbT8encPfY2Ni9AYc5rCleGOGMkvlugIdZAa", role: "USER", updatedAt: new Date().toISOString() },
];

const products = [
  { id: "prod_1", name: "Élégance Nocturne", slug: "elegance-nocturne", description: "Una fragancia sofisticada que captura la esencia de las noches parisinas.", price: 89.99, originalPrice: 110, image: "/uploads/products/elegance-nocturne.jpg", notesTop: '["Bergamota","Pimienta rosa"]', notesHeart: '["Rosa de Damasco","Iris"]', notesBase: '["Sándalo","Vainilla bourbon","Ámbar"]', featured: true, isNew: false, stock: 100, active: true, categoryId: "cat_mujer", updatedAt: new Date().toISOString() },
  { id: "prod_2", name: "Soleil d'Or", slug: "soleil-dor", description: "Radiante y luminoso, evoca los atardeceres mediterráneos.", price: 79.99, originalPrice: null, image: "/uploads/products/soleil-dor.jpg", notesTop: '["Limón siciliano","Neroli","Mandarina"]', notesHeart: '["Jazmín","Azahar"]', notesBase: '["Cedro","Almizcle blanco"]', featured: true, isNew: true, stock: 100, active: true, categoryId: "cat_unisex", updatedAt: new Date().toISOString() },
  { id: "prod_3", name: "Riviera", slug: "riviera", description: "Fresco como la brisa marina de la Costa Azul.", price: 84.99, originalPrice: null, image: "/uploads/products/riviera.jpg", notesTop: '["Menta","Limón","Sal marina"]', notesHeart: '["Lavanda","Geranio"]', notesBase: '["Vetiver","Pachulí"]', featured: true, isNew: false, stock: 100, active: true, categoryId: "cat_hombre", updatedAt: new Date().toISOString() },
  { id: "prod_4", name: "Velours Rouge", slug: "velours-rouge", description: "Sensual y envolvente.", price: 95.99, originalPrice: null, image: "/uploads/products/velours-rouge.jpg", notesTop: '["Frambuesa","Grosella negra"]', notesHeart: '["Rosa roja","Peonía"]', notesBase: '["Cuero","Almizcle","Pachulí"]', featured: false, isNew: false, stock: 100, active: true, categoryId: "cat_mujer", updatedAt: new Date().toISOString() },
  { id: "prod_5", name: "Atlas", slug: "atlas", description: "Inspirado en los mercados de especias de Marrakech.", price: 92.99, originalPrice: null, image: "/uploads/products/atlas.jpg", notesTop: '["Cardamomo","Comino","Bergamota"]', notesHeart: '["Rosa","Clavo"]', notesBase: '["Oud","Incienso","Benjuí"]', featured: false, isNew: true, stock: 100, active: true, categoryId: "cat_hombre", updatedAt: new Date().toISOString() },
  { id: "prod_6", name: "Lune Blanche", slug: "lune-blanche", description: "Etéreo y delicado como la luz de la luna.", price: 87.99, originalPrice: null, image: "/uploads/products/lune-blanche.jpg", notesTop: '["Perla de jazmín","Lila"]', notesHeart: '["Tuberose","Magnolia"]', notesBase: '["Almizcle blanco","Cashmeran"]', featured: false, isNew: false, stock: 100, active: true, categoryId: "cat_mujer", updatedAt: new Date().toISOString() },
  { id: "prod_7", name: "Urban Spirit", slug: "urban-spirit", description: "La energía de la ciudad condensada en un frasco.", price: 74.99, originalPrice: null, image: "/uploads/products/urban-spirit.jpg", notesTop: '["Pomelo","Hoja de violeta"]', notesHeart: '["Violeta","Geranio"]', notesBase: '["Cedro","Vetiver","Musgo"]', featured: false, isNew: false, stock: 100, active: true, categoryId: "cat_unisex", updatedAt: new Date().toISOString() },
  { id: "prod_8", name: "Heritage", slug: "heritage", description: "Un homenaje a la tradición perfumística.", price: 99.99, originalPrice: null, image: "/uploads/products/heritage.jpg", notesTop: '["Lavanda","Romero"]', notesHeart: '["Clavel","Canela"]', notesBase: '["Tabaco","Cuero","Vetiver"]', featured: true, isNew: false, stock: 100, active: true, categoryId: "cat_hombre", updatedAt: new Date().toISOString() },
];

async function main() {
  await upsert("Category", categories);
  await upsert("User", users);
  await upsert("Product", products);
  console.log("Seed REST completado.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
