#!/usr/bin/env bash
# Configura claves Stripe en Vercel (cuenta jonalparfum).
#
# Uso (NO pegues claves en el chat — solo en terminal local):
#   STRIPE_SECRET_KEY='sk_live_...' \
#   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY='pk_live_...' \
#   STRIPE_WEBHOOK_SECRET='whsec_...' \
#   ./scripts/set-stripe-vercel-env.sh
#
# Requiere: npx vercel logout && npx vercel login  (cuenta jonalparfum)

set -euo pipefail

cd "$(dirname "$0")/.."

SCOPE="--scope jonalparfum-5944s-projects"

WHO=$(npx vercel whoami 2>/dev/null || true)
if echo "$WHO" | grep -qiE 'atrix|dental'; then
  echo "Error: Vercel CLI está en '$WHO'. Usa cuenta jonalparfum:"
  echo "  npx vercel logout && npx vercel login"
  exit 1
fi

: "${STRIPE_SECRET_KEY:?Define STRIPE_SECRET_KEY}"
: "${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:?Define NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}"
: "${STRIPE_WEBHOOK_SECRET:?Define STRIPE_WEBHOOK_SECRET}"

add_env() {
  printf '%s' "$2" | npx vercel env add "$1" production preview $SCOPE --force --sensitive
}

echo "→ Configurando Stripe en Vercel (production + preview)..."
add_env STRIPE_SECRET_KEY "$STRIPE_SECRET_KEY"
add_env NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
add_env STRIPE_WEBHOOK_SECRET "$STRIPE_WEBHOOK_SECRET"

echo "✓ Listo. Redeploy: npx vercel deploy --prod $SCOPE"
