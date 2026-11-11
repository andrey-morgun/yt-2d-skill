#!/usr/bin/env bash
# Студия → шаблон скилла. Запускать после улучшений движка, чтобы следующий bootstrap их получил.
# usage: sync-template.sh [studio_dir]   (по умолчанию: $CARTOON_STUDIO, ~/Documents/cartoon-studio.nosync или ~/cartoon-studio)
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; . "$HERE/studio-path.sh"
STUDIO="$(studio_path "${1:-}")"
TPL="$HERE/../template"
[ -f "$STUDIO/render.mjs" ] || { echo "нет студии: $STUDIO" >&2; exit 1; }
# секреты, рендеры, кэши кадров и сведённые стемы в шаблон не попадают
rsync -a --delete --exclude='.env' --exclude='mix.wav' --exclude='.DS_Store' \
  --include='/index.html' --include='/render.mjs' --include='/new-episode.mjs' \
  --include='/package.json' --include='/package-lock.json' --include='/.gitignore' --include='/.env.example' \
  --include='/src/***' --include='/fonts/***' --include='/sfx/' --include='/sfx/build.mjs' \
  --include='/voice/' --include='/voice/build.mjs' \
  --include='/episodes/' --include='/episodes/_template/***' --include='/episodes/tolyan/***' --include='/episodes/garazh/***' \
  --exclude='*' "$STUDIO/" "$TPL/"
du -sh "$TPL"
