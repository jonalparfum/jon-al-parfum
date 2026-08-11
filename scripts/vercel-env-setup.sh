#!/usr/bin/env bash
# Configura variables de entorno en Vercel (cuenta jonalparfum).
# Uso: npx vercel login   # con cuenta jonalparfum, NO Atrix
#      DB_PASSWORD='tu-password-supabase' ./scripts/vercel-env-setup.sh

set -euo pipefail

if ! npx vercel whoami 2>/dev/null | grep -q jonalparfum; then
  echo "Error: inicia sesión con la cuenta jonalparfum: npx vercel login"
  exit 1
fi

if [ -z "${DB_PASSWORD:-}" ]; then
  echo "Error: define DB_PASSWORD (Supabase → Connect → Prisma → copia la URI)"
  exit 1
fi

PROJECT_REF="qsbckliglejhyzeoymym"
REGION="us-east-2"
SCOPE="--scope jonalparfum-5944s-projects"

ENC_PASS=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1], safe=''))" "$DB_PASSWORD")
DATABASE_URL="postgresql://postgres.${PROJECT_REF}:${ENC_PASS}@aws-0-${REGION}.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.${PROJECT_REF}:${ENC_PASS}@aws-0-${REGION}.pooler.supabase.com:5432/postgres"

add_env() {
  printf '%s' "$2" | npx vercel env add "$1" production $SCOPE --force
}

add_env DATABASE_URL "$DATABASE_URL"
add_env DIRECT_URL "$DIRECT_URL"
add_env AUTH_SECRET "${AUTH_SECRET:-zhDgf8QJMeNDrzws96jkPDMXFS56iMV4lJF0YgTl8so=}"
add_env AUTH_URL "https://jonalparfum.com"
add_env NEXT_PUBLIC_APP_URL "https://jonalparfum.com"
add_env NEXT_PUBLIC_SUPABASE_URL "https://${PROJECT_REF}.supabase.co"
add_env NEXT_PUBLIC_SUPABASE_ANON_KEY "${ANON_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzYmNrbGlnbGVqaHl6ZW95bXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0MTMyNjcsImV4cCI6MjEwMTk4OTI2N30.u_gWuOuojVA_ql8QauRUCud7Ib3_8eXaX6N4lEW3bBk}"

echo "✓ Variables configuradas. Redeploy: npx vercel deploy --prod $SCOPE"
