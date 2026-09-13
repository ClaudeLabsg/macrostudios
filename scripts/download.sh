#!/usr/bin/env bash
# Download originals from the legacy site into scripts/raw/<category>/
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
for f in scripts/urls/*.txt; do
  cat="$(basename "$f" .txt)"
  dest="scripts/raw/$cat"
  mkdir -p "$dest"
  while read -r url; do
    [ -z "$url" ] && continue
    name="$(basename "$url")"
    [ -s "$dest/$name" ] && continue
    curl -s -A "$UA" --max-time 45 "$url" -o "$dest/$name"
    # Discard anything that isn't actually an image (404 HTML etc.)
    case "$(file -b --mime-type "$dest/$name" 2>/dev/null)" in
      image/*) ;;
      *) rm -f "$dest/$name" ;;
    esac
  done < "$f"
  printf '%-14s %3s files  %s\n' "$cat" "$(ls -1 "$dest" 2>/dev/null | wc -l)" "$(du -sh "$dest" 2>/dev/null | cut -f1)"
done
