#!/usr/bin/env bash
# Scrape the legacy WordPress site for original-size image URLs, grouped by category.
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
OUT=scripts/urls
mkdir -p "$OUT"

declare -A PAGES=(
  [events]="corporate-events"
  [corporate]="portfolio/corporate-photos"
  [products]="portfolio/products"
  [ads]="portfolio/ads"
  [celebrities]="celebrities"
  [portraiture]="portfolio/portraiture"
  [home]=""
)

for key in "${!PAGES[@]}"; do
  curl -s -A "$UA" "https://www.macrostudios.sg/${PAGES[$key]}/" \
    | grep -oE 'https://www\.macrostudios\.sg/wp-content/uploads/[^"'"'"' ]*\.(jpg|jpeg|png|JPG|JPEG|PNG)' \
    | sed -E 's/-[0-9]+x[0-9]+(\.[a-zA-Z]+)$/\1/' \
    | grep -viE 'logo|icon|favicon|cropped' \
    | sort -u > "$OUT/$key.txt"
  printf '%-14s %s originals\n' "$key" "$(wc -l < "$OUT/$key.txt")"
done
