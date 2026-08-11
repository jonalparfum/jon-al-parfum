# Despliegue — Jon Al Parfum

## Stack
- **Dominio:** jonalparfum.com (Cloudflare)
- **Hosting:** Vercel
- **Base de datos:** Supabase (PostgreSQL)
- **Código:** GitHub

## 1. Supabase

Settings → Database → Connection string:

- **Transaction pooler (6543)** → `DATABASE_URL`
- **Direct (5432)** → `DIRECT_URL`

```bash
npm run db:deploy
```

## 2. Vercel — Environment Variables

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | Pooler 6543 |
| `DIRECT_URL` | Direct 5432 |
| `AUTH_SECRET` | Secreto aleatorio |
| `AUTH_URL` | `https://jonalparfum.com` |
| `NEXT_PUBLIC_APP_URL` | `https://jonalparfum.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://qsbckliglejhyzeoymym.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key |
| Stripe keys | Según dashboard |

## 3. Cloudflare DNS

| Tipo | Nombre | Contenido | Proxy |
|------|--------|-----------|-------|
| A | @ | 76.76.21.21 | DNS only |
| CNAME | www | cname.vercel-dns.com | DNS only |

## 4. Stripe Webhook

URL: `https://jonalparfum.com/api/webhooks/stripe`

Evento: `checkout.session.completed`
