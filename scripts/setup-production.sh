#!/usr/bin/env bash
set -euo pipefail

# Uso: DB_PASSWORD='tu-password' ./scripts/setup-production.sh

if [ -z "${DB_PASSWORD:-}" ]; then
  echo "Error: define DB_PASSWORD con la contraseña de Supabase"
  echo "  Supabase → Settings → Database → Reset database password"
  exit 1
fi

PROJECT_REF="qsbckliglejhyzeoymym"
REGION="us-east-2"
AUTH_SECRET="${AUTH_SECRET:-zhDgf8QJMeNDrzws96jkPDMXFS56iMV4lJF0YgTl8so=}"
ANON_KEY="${ANON_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzYmNrbGlnbGVqaHl6ZW95bXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0MTMyNjcsImV4cCI6MjEwMTk4OTI2N30.u_gWuOuojVA_ql8QauRUCud7Ib3_8eXaX6N4lEW3bBk}"

ENC_PASS=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1], safe=''))" "$DB_PASSWORD")

DATABASE_URL="postgresql://postgres.${PROJECT_REF}:${ENC_PASS}@aws-0-${REGION}.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.${PROJECT_REF}:${ENC_PASS}@aws-0-${REGION}.pooler.supabase.com:5432/postgres"

echo "→ Creando tablas en Supabase..."
export DATABASE_URL DIRECT_URL
npx prisma db push
npx tsx prisma/seed.ts

echo "→ Configurando Vercel..."
add_env() {
  local name=$1 value=$2
  printf '%s' "$value" | npx vercel env add "$name" production --force 2>/dev/null || \
  printf '%s' "$value" | npx vercel env add "$name" production
}

add_env DATABASE_URL "$DATABASE_URL"
add_env DIRECT_URL "$DIRECT_URL"
add_env AUTH_SECRET "$AUTH_SECRET"
add_env AUTH_URL "https://jonalparfum.com"
add_env NEXT_PUBLIC_APP_URL "https://jonalparfum.com"
add_env NEXT_PUBLIC_SUPABASE_URL "https://${PROJECT_REF}.supabase.co"
add_env NEXT_PUBLIC_SUPABASE_ANON_KEY "$ANON_KEY"

echo "→ Desplegando..."
npx vercel deploy --prod --yes

echo "✓ Listo. Añade el dominio jonalparfum.com en Vercel y configura DNS en Cloudflare."
