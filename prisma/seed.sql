-- Ejecutar en Supabase → SQL Editor (después de prisma/init.sql si las tablas no existen)
-- O ejecutar todo junto si es base de datos vacía

-- Usuarios (admin123 / demo123)
INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "updatedAt")
VALUES
  ('admin_seed', 'Administrador', 'admin@jonalparfum.com', '$2b$12$Ospq03C4zXamBy4RdNtGKuDsboZ8H6AVLo9LTN1l/dA0Hlhicnana', 'ADMIN', NOW()),
  ('demo_seed', 'Usuario Demo', 'demo@jonalparfum.com', '$2b$12$B4izMrluAAbZHDeVmmbT8encPfY2Ni9AYc5rCleGOGMkvlugIdZAa', 'USER', NOW())
ON CONFLICT ("email") DO NOTHING;

-- Catálogos
INSERT INTO "Category" ("id", "name", "slug", "description", "updatedAt")
VALUES
  ('cat_hombre', 'Hombre', 'hombre', 'Fragancias masculinas', NOW()),
  ('cat_mujer', 'Mujer', 'mujer', 'Fragancias femeninas', NOW()),
  ('cat_unisex', 'Unisex', 'unisex', 'Fragancias unisex', NOW())
ON CONFLICT ("slug") DO NOTHING;

-- Productos (extracto — ver prisma/seed.ts para lista completa)
INSERT INTO "Product" ("id", "name", "slug", "description", "price", "originalPrice", "image", "notesTop", "notesHeart", "notesBase", "featured", "isNew", "categoryId", "updatedAt")
VALUES
  ('prod_1', 'Élégance Nocturne', 'elegance-nocturne', 'Una fragancia sofisticada que captura la esencia de las noches parisinas.', 89.99, 110, '/uploads/products/elegance-nocturne.jpg', '["Bergamota","Pimienta rosa"]', '["Rosa de Damasco","Iris"]', '["Sándalo","Vainilla bourbon","Ámbar"]', true, false, 'cat_mujer', NOW()),
  ('prod_2', 'Soleil d''Or', 'soleil-dor', 'Radiante y luminoso, evoca los atardeceres mediterráneos.', 79.99, NULL, '/uploads/products/soleil-dor.jpg', '["Limón siciliano","Neroli","Mandarina"]', '["Jazmín","Azahar"]', '["Cedro","Almizcle blanco"]', true, true, 'cat_unisex', NOW()),
  ('prod_3', 'Riviera', 'riviera', 'Fresco como la brisa marina de la Costa Azul.', 84.99, NULL, '/uploads/products/riviera.jpg', '["Menta","Limón","Sal marina"]', '["Lavanda","Geranio"]', '["Vetiver","Pachulí"]', true, false, 'cat_hombre', NOW()),
  ('prod_8', 'Heritage', 'heritage', 'Un homenaje a la tradición perfumística.', 99.99, NULL, '/uploads/products/heritage.jpg', '["Lavanda","Romero"]', '["Clavel","Canela"]', '["Tabaco","Cuero","Vetiver"]', true, false, 'cat_hombre', NOW())
ON CONFLICT ("slug") DO NOTHING;
