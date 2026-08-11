#!/usr/bin/env bash
# Credenciales de login para Admin → Accesos (sin claves API).
# Uso local o en Vercel — NUNCA commitees valores reales.
#
# Vercel (cuenta jonalparfum):
#   ADMIN_CRED_GMAIL_EMAIL='...' ADMIN_CRED_GMAIL_PASSWORD='...' ... \
#   ./scripts/set-admin-credentials-vercel.sh

set -euo pipefail

cd "$(dirname "$0")/.."

SCOPE="--scope jonalparfum-5944s-projects"

WHO=$(npx vercel whoami 2>/dev/null || true)
if echo "$WHO" | grep -qiE 'atrix|dental'; then
  echo "Error: Vercel CLI está en '$WHO'. Usa cuenta jonalparfum."
  exit 1
fi

add_env() {
  local name=$1
  local value=$2
  if [ -z "$value" ]; then
    echo "  (omitido $name — vacío)"
    return
  fi
  printf '%s' "$value" | npx vercel env add "$name" production preview $SCOPE --force --sensitive
  echo "  ✓ $name"
}

echo "→ Configurando ADMIN_CRED_* en Vercel..."
add_env ADMIN_CRED_GMAIL_EMAIL "${ADMIN_CRED_GMAIL_EMAIL:-}"
add_env ADMIN_CRED_GMAIL_PASSWORD "${ADMIN_CRED_GMAIL_PASSWORD:-}"
add_env ADMIN_CRED_STRIPE_EMAIL "${ADMIN_CRED_STRIPE_EMAIL:-}"
add_env ADMIN_CRED_STRIPE_PASSWORD "${ADMIN_CRED_STRIPE_PASSWORD:-}"
add_env ADMIN_CRED_STRIPE_AUTH "${ADMIN_CRED_STRIPE_AUTH:-}"
add_env ADMIN_CRED_VERCEL_EMAIL "${ADMIN_CRED_VERCEL_EMAIL:-}"
add_env ADMIN_CRED_VERCEL_PASSWORD "${ADMIN_CRED_VERCEL_PASSWORD:-}"
add_env ADMIN_CRED_SUPABASE_EMAIL "${ADMIN_CRED_SUPABASE_EMAIL:-}"
add_env ADMIN_CRED_SUPABASE_PASSWORD "${ADMIN_CRED_SUPABASE_PASSWORD:-}"
add_env ADMIN_CRED_GITHUB_EMAIL "${ADMIN_CRED_GITHUB_EMAIL:-}"
add_env ADMIN_CRED_GITHUB_PASSWORD "${ADMIN_CRED_GITHUB_PASSWORD:-}"

echo "✓ Listo. Redeploy en Vercel para ver /admin/accesos"
