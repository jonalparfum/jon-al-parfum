# Jon Al Parfum

Tienda online de perfumería de lujo con panel de administración, pagos Stripe y base de datos.

**Repo:** [github.com/jonalparfum/jon-al-parfum](https://github.com/jonalparfum/jon-al-parfum)

## Características

- Tienda con catálogo, filtros y detalle de producto
- Carrito de compras con checkout Stripe
- Registro e inicio de sesión de usuarios
- Área de cuenta con historial de pedidos
- Panel de administración (productos, catálogos, pedidos, imágenes)
- Base de datos SQLite (desarrollo) / PostgreSQL (producción)

## Inicio rápido

```bash
npm install
npm run db:setup
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### Cuentas de prueba (tras el seed)

| Rol   | Email                    | Contraseña |
|-------|--------------------------|------------|
| Admin | admin@jonalparfum.com    | admin123   |
| User  | demo@jonalparfum.com     | demo123    |

## Configuración Stripe

1. Crea una cuenta en [Stripe](https://dashboard.stripe.com)
2. Copia las claves de test en `.env`:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

3. Para webhooks en local, usa [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Panel de administración

Accede en [http://localhost:3000/admin](http://localhost:3000/admin) con la cuenta admin.

- **Productos**: crear, editar, subir imágenes, gestionar stock
- **Catálogos**: categorías (Hombre, Mujer, Unisex, etc.)
- **Pedidos**: ver y actualizar estado de pedidos

## Scripts

| Comando           | Descripción                    |
|-------------------|--------------------------------|
| `npm run dev`     | Servidor de desarrollo         |
| `npm run build`   | Build de producción            |
| `npm run db:setup`| Crear DB y datos iniciales     |
| `npm run db:seed` | Repoblar datos de ejemplo      |

## Estructura

```
src/
├── app/
│   ├── (store)/      # Tienda pública
│   ├── admin/        # Panel de administración
│   └── api/          # APIs REST
├── components/
├── context/          # Carrito
├── lib/              # Prisma, Auth, Stripe
└── types/
prisma/
├── schema.prisma
└── seed.ts
```

## Producción con PostgreSQL

Cambia en `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Y en `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/jonalparfum"
```
