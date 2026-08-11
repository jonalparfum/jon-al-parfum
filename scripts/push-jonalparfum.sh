#!/usr/bin/env bash
# Push a GitHub SOLO como jonalparfum/jon-al-parfum.
# No usa el Keychain de macOS (evita cuenta DentalMate u otras).
#
# Uso:
#   GITHUB_TOKEN='ghp_...' ./scripts/push-jonalparfum.sh
#
# Crea el token en: GitHub → jonalparfum → Settings → Developer settings → PAT

set -euo pipefail

REPO="jonalparfum/jon-al-parfum"
BRANCH="${1:-main}"

if [ -z "${GITHUB_TOKEN:-}" ] && [ -f ".env.local" ]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

if [ -z "${GITHUB_TOKEN:-}" ]; then
  echo "Error: define GITHUB_TOKEN con un Personal Access Token de la cuenta jonalparfum."
  echo "  GITHUB_TOKEN='ghp_...' ./scripts/push-jonalparfum.sh"
  exit 1
fi

echo "→ Push a https://github.com/${REPO}.git (${BRANCH})"
git push "https://x-access-token:${GITHUB_TOKEN}@github.com/${REPO}.git" "HEAD:${BRANCH}"

echo "✓ Listo. Vercel desplegará desde jonalparfum/jon-al-parfum si el repo está conectado."
