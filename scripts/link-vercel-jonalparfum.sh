#!/usr/bin/env bash
# Vincular este proyecto a Vercel — SOLO cuenta jonalparfum
#
# Uso:
#   npx vercel logout
#   npx vercel login          # inicia sesión con la cuenta JONALPARFUM, NO Atrix
#   ./scripts/link-vercel-jonalparfum.sh

set -euo pipefail

SCOPE="jonalparfum-5944s-projects"
PROJECT="jonalparfum01"

WHO=$(npx vercel whoami 2>/dev/null || true)
if echo "$WHO" | grep -qiE 'atrix|dental'; then
  echo "Error: estás logueado como '$WHO' (cuenta incorrecta)."
  echo "  Ejecuta: npx vercel logout && npx vercel login"
  echo "  Usa la cuenta de jonalparfum, NO Atrix ni DentalMate."
  exit 1
fi

if ! echo "$WHO" | grep -qi 'jonalparfum'; then
  echo "Advertencia: no parece la cuenta jonalparfum (actual: $WHO)."
  read -r -p "¿Continuar? (s/N) " ans
  [[ "${ans,,}" == "s" ]] || exit 1
fi

npx vercel link --yes --project "$PROJECT" --scope "$SCOPE"
echo "✓ Proyecto vinculado a ${SCOPE}/${PROJECT}"
