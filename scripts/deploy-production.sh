#!/usr/bin/env bash
# Despliega a Vercel (cuenta jonalparfum).
# Repo GitHub único: jonalparfum/jon-al-parfum
#
# Uso:
#   npx vercel login          # cuenta jonalparfum, NO Atrix
#   ./scripts/deploy-production.sh

set -euo pipefail

if ! npx vercel whoami 2>/dev/null | grep -q jonalparfum; then
  echo "Error: inicia sesión con la cuenta jonalparfum:"
  echo "  npx vercel logout && npx vercel login"
  exit 1
fi

SCOPE="--scope jonalparfum-5944s-projects"
PROJECT="--project jonalparfum01"

echo "→ Repo: jonalparfum/jon-al-parfum"
echo "→ Desplegando a producción..."
npx vercel deploy --prod --yes $SCOPE $PROJECT

echo "✓ Listo. Prueba: https://www.jonalparfum.com/login"
