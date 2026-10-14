#!/usr/bin/env bash
# Fetches each URL on stdin (one per line) into OUT_DIR as <slug>.html, <slug>.headers.txt and
# <slug>.meta.json, and prints a Markdown table row per URL. No retries, no CAPTCHA solving.
set -euo pipefail
OUT_DIR=${OUT_DIR:-out}
UA=${UA:-'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130 Safari/537.36'}
DELAY=${DELAY:-5}
mkdir -p "$OUT_DIR"
n=0
while IFS= read -r url; do
  url=$(echo "$url" | tr -d '\r' | xargs)
  [ -z "$url" ] && continue
  [ "$n" -gt 0 ] && sleep "$DELAY"
  n=$((n + 1))
  slug=$(printf '%02d-%s' "$n" "$(echo "$url" | sed -E 's#^https?://##; s#[^A-Za-z0-9]+#-#g; s#-+$##' | cut -c1-80)")
  status=$(curl -sS -L --max-time 45 -A "$UA" -D "$OUT_DIR/$slug.headers.txt" -o "$OUT_DIR/$slug.html" -w '%{http_code} %{url_effective}' "$url" || echo "000 curl-failed")
  code=${status%% *}
  final=${status#* }
  [ -f "$OUT_DIR/$slug.html" ] || : > "$OUT_DIR/$slug.html"
  bytes=$(wc -c < "$OUT_DIR/$slug.html" | tr -d ' ')
  sha=$(sha256sum "$OUT_DIR/$slug.html" | cut -d' ' -f1)
  jq -n --arg url "$url" --arg final "$final" --argjson status "${code:-0}" \
    --argjson bytes "$bytes" --arg sha "$sha" --arg time "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    '{url:$url, final_url:$final, status:$status, bytes:$bytes, sha256:$sha, fetched_at_utc:$time}' > "$OUT_DIR/$slug.meta.json"
  echo "| $slug | $code | $bytes | $final |"
done
