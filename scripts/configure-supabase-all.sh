#!/usr/bin/env bash
# Configura Supabase en local + Vercel (jonalparfum01).
# Uso: ./scripts/configure-supabase-all.sh
#
# Requiere una de:
#   - npx vercel login  (cuenta jonalparfum)
#   - VERCEL_TOKEN=...  (https://vercel.com/account/tokens, cuenta jonalparfum)

set -euo pipefail
cd "$(dirname "$0")/.."

echo "→ 1/3 Variables locales (.env.local) — ya configuradas si corriste este script antes"
echo "→ 2/3 Vercel (production + preview)..."
./scripts/set-supabase-vercel-env.sh

if [ -n "${DB_PASSWORD:-}" ]; then
  echo "→ 3/3 Base de datos (prisma db push)..."
  ./scripts/setup-production.sh
else
  echo "→ 3/3 Base de datos: omite (define DB_PASSWORD para migrar)"
  echo "    DB_PASSWORD='...' npx prisma db push  # con DATABASE_URL y DIRECT_URL en .env.local"
fi

echo "✓ Supabase configurado. Redeploy: ./scripts/deploy-production.sh"
