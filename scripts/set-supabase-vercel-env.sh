#!/usr/bin/env bash
# Configura SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en Vercel (jonalparfum01).
#
# Requiere sesión Vercel como jonalparfum (NO Atrix):
#   npx vercel logout && npx vercel login
#
# Uso:
#   SUPABASE_SERVICE_ROLE_KEY='eyJ...' ./scripts/set-supabase-vercel-env.sh
#   # o define la key en scripts/vercel-production.env (gitignored)

set -euo pipefail

cd "$(dirname "$0")/.."

SCOPE="--scope jonalparfum-5944s-projects"
PROJECT_REF="qsbckliglejhyzeoymym"
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"

if [ -f scripts/vercel-production.env ]; then
  # shellcheck disable=SC1091
  source scripts/vercel-production.env
fi

WHO=$(npx vercel whoami 2>/dev/null || true)
if echo "$WHO" | grep -qiE 'atrix|dental'; then
  echo "Error: Vercel CLI está en '$WHO'. Usa cuenta jonalparfum:"
  echo "  npx vercel logout && npx vercel login"
  exit 1
fi

if [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  echo "Error: define SUPABASE_SERVICE_ROLE_KEY"
  exit 1
fi

add_env() {
  printf '%s' "$2" | npx vercel env add "$1" production preview $SCOPE --force --sensitive
}

echo "→ Configurando Supabase en jonalparfum01 (production + preview)..."
add_env SUPABASE_URL "$SUPABASE_URL"
add_env SUPABASE_SERVICE_ROLE_KEY "$SUPABASE_SERVICE_ROLE_KEY"

echo "✓ Variables listas. Redeploy en Vercel → Deployments → Redeploy (production)."
