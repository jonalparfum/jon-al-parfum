# Despliegue — Jon Al Parfum

> **Un solo repo GitHub:** [jonalparfum/jon-al-parfum](https://github.com/jonalparfum/jon-al-parfum)  
> Dominio: `www.jonalparfum.com` · Vercel proyecto: `jonalparfum01`

## ⚠️ Cuentas — SOLO jonalparfum

Este proyecto **no** usa DentalMate ni Atrix.

| Servicio | Cuenta correcta | Incorrecto |
|----------|-----------------|------------|
| GitHub | **jonalparfum** | DentalMatemx, otras |
| Vercel | **jonalparfum** (`jonalparfum-5944s-projects`) | Atrix, atrixtechno |
| Supabase | **qsbckliglejhyzeoymym** | otros proyectos |

**Git push falla con DentalMate:** macOS guardó otra cuenta en Llaveros. Solución:

```bash
GITHUB_TOKEN='ghp_...' ./scripts/push-jonalparfum.sh
```

O Acceso a Llaveros → `github.com` → borra entradas de DentalMate.

**Vercel en Atrix:** `npx vercel logout` → `npx vercel login` con **jonalparfum**.

Verificar: `./scripts/check-accounts.sh`

## Stack

| Servicio | Recurso |
|----------|---------|
| GitHub | `jonalparfum/jon-al-parfum` (único repo) |
| Vercel | Cuenta **jonalparfum** → proyecto `jonalparfum01` |
| Supabase | `qsbckliglejhyzeoymym` |
| Cloudflare | `jonalparfum.com` |

---

## 1. GitHub (único repositorio)

```
https://github.com/jonalparfum/jon-al-parfum
```

Todo el código va aquí. No uses otros repos.

---

## 2. Vercel — conectar el repo

1. [Settings → Git](https://vercel.com/jonalparfum-5944s-projects/jonalparfum01/settings/git)
2. Conecta **`jonalparfum/jon-al-parfum`** (branch `main`)
3. Si había otro repo conectado, desconéctalo primero

CLI (cuenta jonalparfum):

```bash
npx vercel logout && npx vercel login
npx vercel link --scope jonalparfum-5944s-projects --project jonalparfum01
./scripts/deploy-production.sh
```

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
| `AUTH_URL` | `https://www.jonalparfum.com` |
| `NEXT_PUBLIC_APP_URL` | `https://www.jonalparfum.com` |
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
