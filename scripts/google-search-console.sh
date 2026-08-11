#!/usr/bin/env bash
# Guía rápida para indexar Jon Al Parfum en Google Search Console.
#
# Uso:
#   ./scripts/google-search-console.sh
#   GOOGLE_SITE_VERIFICATION='tu-codigo' ./scripts/google-search-console.sh --set-vercel

set -euo pipefail

SITE="https://www.jonalparfum.com"
SITEMAP="${SITE}/sitemap.xml"
ROBOTS="${SITE}/robots.txt"

echo "=== Jon Al Parfum · Indexación Google ==="
echo ""
echo "1) Abre Search Console e inicia sesión:"
echo "   https://search.google.com/search-console/welcome"
echo ""
echo "2) Agrega la propiedad (prefijo de URL):"
echo "   ${SITE}"
echo ""
echo "3) Verifica el sitio con etiqueta HTML:"
echo "   - Copia el código que te da Google (solo el content, sin comillas)"
echo "   - Ejecuta:"
echo "     GOOGLE_SITE_VERIFICATION='TU_CODIGO' npx vercel env add GOOGLE_SITE_VERIFICATION production --scope jonalparfum-5944s-projects --force"
echo "   - Redeploy: npx vercel deploy --prod --scope jonalparfum-5944s-projects"
echo ""
echo "4) Envía el sitemap en Search Console → Sitemaps:"
echo "   ${SITEMAP}"
echo ""
echo "5) Solicita indexación de la home:"
echo "   Inspección de URLs → ${SITE} → Solicitar indexación"
echo ""

echo "=== Comprobando archivos SEO en producción ==="
for url in "$SITEMAP" "$ROBOTS" "$SITE"; do
  status=$(curl -sI "$url" | awk 'NR==1{print $2}')
  echo "  [$status] $url"
done

echo ""
first_url=$(curl -s "$SITEMAP" | rg -o 'https://[^<]+' | head -1 || true)
echo "Primera URL del sitemap: ${first_url:-no detectada}"
if [[ "$first_url" == *"www.jonalparfum.com"* ]]; then
  echo "✓ Sitemap usa dominio www (correcto)"
else
  echo "! Sitemap aún sin www — redeploy pendiente tras este commit"
fi

if [[ "${1:-}" == "--set-vercel" ]]; then
  if [ -z "${GOOGLE_SITE_VERIFICATION:-}" ]; then
    echo "Error: define GOOGLE_SITE_VERIFICATION"
    exit 1
  fi
  printf '%s' "$GOOGLE_SITE_VERIFICATION" | npx vercel env add GOOGLE_SITE_VERIFICATION production --scope jonalparfum-5944s-projects --force
  echo "✓ Variable GOOGLE_SITE_VERIFICATION configurada en Vercel"
  echo "  Redeploy: npx vercel deploy --prod --scope jonalparfum-5944s-projects"
fi
