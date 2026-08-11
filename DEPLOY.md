# Despliegue — Jon Al Parfum

> **Proyecto independiente.** No usar la cuenta/equipo de Atrix en Vercel.
> GitHub: `jonalparfum/jon-al-parfum` · Dominio: `jonalparfum.com`

## Stack

| Servicio | Cuenta |
|----------|--------|
| GitHub | `jonalparfum` |
| Vercel | Cuenta **jonalparfum** (no Atrix) |
| Supabase | `qsbckliglejhyzeoymym` |
| Cloudflare | `jonalparfum.com` |

---

## 1. Vercel (cuenta correcta)

1. Cierra sesión de Atrix en CLI si aplica: `npx vercel logout`
2. Inicia sesión con la cuenta de **jonalparfum**: `npx vercel login`
3. En esta carpeta:

```bash
npx vercel link --project jon-al-parfum
```

4. Importa el repo en [vercel.com/new](https://vercel.com/new) → `jonalparfum/jon-al-parfum`

---

## 2. Supabase — Connection strings (region: us-east-2)

En Supabase → **Connect** → Prisma:

```env
DATABASE_URL="postgresql://postgres.qsbckliglejhyzeoymym:[PASSWORD]@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.qsbckliglejhyzeoymym:[PASSWORD]@aws-0-us-east-2.pooler.supabase.com:5432/postgres"
```

Setup local (con contraseña real):

```bash
DB_PASSWORD='tu-contraseña' ./scripts/setup-production.sh
```

---

## 3. Variables en Vercel

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | Pooler 6543 (us-east-2) |
| `DIRECT_URL` | Session pooler 5432 |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | `https://jonalparfum.com` |
| `NEXT_PUBLIC_APP_URL` | `https://jonalparfum.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://qsbckliglejhyzeoymym.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase |

---

## 4. Cloudflare DNS

| Tipo | Nombre | Contenido | Proxy |
|------|--------|-----------|-------|
| A | `@` | `76.76.21.21` | DNS only |
| CNAME | `www` | `cname.vercel-dns.com` | DNS only |

Luego en Vercel → Domains: `jonalparfum.com` y `www.jonalparfum.com`

---

## 5. Datos iniciales

Tablas y productos ya pueden estar en Supabase. Si no:

```bash
SUPABASE_SERVICE_ROLE_KEY='...' node scripts/seed-supabase-rest.mjs
```

Admin: `admin@jonalparfum.com` / `admin123`
