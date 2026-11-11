# Источник: путь к студии. CARTOON_STUDIO → ~/Documents/cartoon-studio.nosync (если есть) → ~/cartoon-studio
# Не держи студию в синхронизируемой iCloud-папке без суффикса .nosync (macOS выгружает файлы в облако).
studio_path() {
  if [ -n "${1:-}" ]; then echo "$1"; return; fi
  if [ -n "${CARTOON_STUDIO:-}" ]; then echo "$CARTOON_STUDIO"; return; fi
  if [ -d "$HOME/Documents/cartoon-studio.nosync" ]; then echo "$HOME/Documents/cartoon-studio.nosync"; return; fi
  echo "$HOME/cartoon-studio"
}
