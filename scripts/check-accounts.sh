#!/usr/bin/env bash
# Verifica que este proyecto use cuentas jonalparfum, no DentalMate ni Atrix.

set -euo pipefail

cd "$(dirname "$0")/.."
ERR=0

echo "=== Jon Al Parfum — verificación de cuentas ==="
echo ""

REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
if [[ "$REMOTE" == *"jonalparfum/jon-al-parfum"* ]]; then
  echo "✓ Git remote: jonalparfum/jon-al-parfum"
else
  echo "✗ Git remote incorrecto: $REMOTE"
  ERR=1
fi

if [[ "$REMOTE" == *"DentalMate"* ]] || [[ "$REMOTE" == *"dentalmate"* ]]; then
  echo "✗ Remote apunta a DentalMate — debe ser jonalparfum/jon-al-parfum"
  ERR=1
fi

echo ""
VERCEL_USER=$(npx vercel whoami 2>/dev/null || echo "no logueado")
if [[ "$VERCEL_USER" == *"jonalparfum"* ]]; then
  echo "✓ Vercel CLI: $VERCEL_USER"
elif [[ "$VERCEL_USER" == *"atrix"* ]] || [[ "$VERCEL_USER" == *"Atrix"* ]]; then
  echo "✗ Vercel CLI está en Atrix ($VERCEL_USER)"
  echo "  Ejecuta: npx vercel logout && npx vercel login"
  echo "  (inicia sesión con la cuenta jonalparfum, NO Atrix)"
  ERR=1
else
  echo "⚠ Vercel CLI: $VERCEL_USER"
  echo "  Debe ser cuenta jonalparfum. Ejecuta: npx vercel login"
fi

echo ""
echo "Git push: si falla con DentalMate, usa:"
echo "  GITHUB_TOKEN='tu-token-jonalparfum' ./scripts/push-jonalparfum.sh"
echo ""
echo "O borra credenciales viejas: Acceso a Llaveros → github.com → elimina DentalMate"
echo ""

exit $ERR
