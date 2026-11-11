#!/usr/bin/env bash
# Разворачивает студию из шаблона скилла (если её ещё нет) и ставит puppeteer-core.
# usage: bootstrap.sh [studio_dir]   (по умолчанию: $CARTOON_STUDIO или ~/cartoon-studio)
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; . "$HERE/studio-path.sh"
STUDIO="$(studio_path "${1:-}")"
TPL="$HERE/../template"
if [ -f "$STUDIO/render.mjs" ]; then echo "студия уже есть: $STUDIO"; else
  mkdir -p "$STUDIO" && cp -R "$TPL/." "$STUDIO/" && echo "студия создана: $STUDIO"; fi
command -v node >/dev/null || { echo "!! нужен node ≥ 18" >&2; exit 1; }
command -v ffmpeg >/dev/null || echo "!! нужен ffmpeg (macOS: brew install ffmpeg; Debian/Ubuntu: apt install ffmpeg)" >&2
if [ -z "${CHROME_PATH:-}" ] && [ ! -d "/Applications/Google Chrome.app" ] && ! command -v google-chrome >/dev/null; then
  echo "!! нужен Google Chrome, либо укажи CHROME_PATH=/путь/к/chromium" >&2; fi
[ -d "$STUDIO/node_modules/puppeteer-core" ] || (cd "$STUDIO" && npm install --silent)
[ -f "$STUDIO/.env" ] || { [ -f "$STUDIO/.env.example" ] && echo "озвучка: cp .env.example .env и впиши OPENROUTER_API_KEY (без неё всё остальное работает)"; }
echo "ok → cd \"$STUDIO\" && node render.mjs --stills 1.0"
