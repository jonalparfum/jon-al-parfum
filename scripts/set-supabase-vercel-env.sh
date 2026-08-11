#!/usr/bin/env bash
# Configura variables Supabase en Vercel (jonalparfum01).
#
# Opción A — CLI (cuenta jonalparfum):
#   npx vercel logout && npx vercel login
#   ./scripts/set-supabase-vercel-env.sh
#
# Opción B — API (sin CLI jonalparfum):
#   VERCEL_TOKEN='...' ./scripts/set-supabase-vercel-env.sh

set -euo pipefail

cd "$(dirname "$0")/.."

SCOPE="--scope jonalparfum-5944s-projects"
TEAM_SLUG="jonalparfum-5944s-projects"
PROJECT="jonalparfum01"
PROJECT_REF="qsbckliglejhyzeoymym"
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"
ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzYmNrbGlnbGVqaHl6ZW95bXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0MTMyNjcsImV4cCI6MjEwMTk4OTI2N30.u_gWuOuojVA_ql8QauRUCud7Ib3_8eXaX6N4lEW3bBk}"

if [ -f scripts/vercel-production.env ]; then
  # shellcheck disable=SC1091
  source scripts/vercel-production.env
fi

if [ -f .env.local ]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

if [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  echo "Error: define SUPABASE_SERVICE_ROLE_KEY"
  exit 1
fi

add_env_cli() {
  printf '%s' "$2" | npx vercel env add "$1" production preview $SCOPE --force --sensitive
}

add_env_api() {
  local key=$1
  local value=$2
  local type=${3:-sensitive}
  curl -sf -X POST \
    "https://api.vercel.com/v10/projects/${PROJECT}/env?upsert=true&slug=${TEAM_SLUG}" \
    -H "Authorization: Bearer ${VERCEL_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "[{\"key\":\"${key}\",\"value\":\"${value}\",\"type\":\"${type}\",\"target\":[\"production\",\"preview\"]}]" \
    >/dev/null
  echo "  ✓ ${key} (API)"
}

use_api=false
if [ -n "${VERCEL_TOKEN:-}" ]; then
  use_api=true
elif npx vercel whoami 2>/dev/null | grep -qi jonalparfum; then
  use_api=false
else
  WHO=$(npx vercel whoami 2>/dev/null || echo "no logueado")
  echo "Error: Vercel CLI está en '$WHO' (necesitas cuenta jonalparfum)."
  echo "  npx vercel logout && npx vercel login"
  echo "  o define VERCEL_TOKEN (https://vercel.com/account/tokens)"
  exit 1
fi

echo "→ Configurando Supabase en ${PROJECT} (production + preview)..."

if [ "$use_api" = true ]; then
  add_env_api SUPABASE_URL "$SUPABASE_URL"
  add_env_api SUPABASE_SERVICE_ROLE_KEY "$SUPABASE_SERVICE_ROLE_KEY"
  add_env_api NEXT_PUBLIC_SUPABASE_URL "$SUPABASE_URL" encrypted
  add_env_api NEXT_PUBLIC_SUPABASE_ANON_KEY "$ANON_KEY" encrypted
else
  add_env_cli SUPABASE_URL "$SUPABASE_URL"
  add_env_cli SUPABASE_SERVICE_ROLE_KEY "$SUPABASE_SERVICE_ROLE_KEY"
  printf '%s' "$SUPABASE_URL" | npx vercel env add NEXT_PUBLIC_SUPABASE_URL production preview $SCOPE --force
  printf '%s' "$ANON_KEY" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview $SCOPE --force
fi

echo "✓ Variables Supabase listas. Redeploy: ./scripts/deploy-production.sh"

