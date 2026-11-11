#!/usr/bin/env bash
# Регрессии движка: эталонные стиллы существующих эпизодов, сравнение байт-в-байт (cmp).
# usage (из template/):
#   bash tests/regress.sh          # = check: отрендерить стиллы и сравнить с tests/baseline/<ep>/
#   bash tests/regress.sh save     # перезаписать эталоны — только когда изменение задумано (отдельным коммитом с объяснением)
#   bash tests/regress.sh check tolyan   # только указанные эпизоды
# Стиллы рендерятся с --dsf 1 (в размер кадра эпизода): эталоны лёгкие для git, а любое изменение кадра всё равно ловится.
# Нужен Chrome: см. CHROME_PATH в render.mjs.
set -euo pipefail
cd "$(dirname "$0")/.."

# моменты — по одному на каждый тип шота/сета/режима эпизода (кратны 1/30 с, т.е. совпадают с кадрами видео)
declare -A STILLS=(
  [tolyan]="0.5,2.1,4.3,4.9,5.8,7.6"
  [garazh]="2,5.5,7.8,9.5,14,16.3,20,26,40,44,48,52,57.8,67.5,77,79.5"
  [hd-test]="1.5,7,9.5"   # 1920×1080: общий план + бейдж + субтитры, крупный план, блэкаут
)

mode=${1:-check}; shift || true
[[ $mode == check || $mode == save ]] || { echo "usage: $0 [check|save] [ep…]" >&2; exit 2; }
eps=("$@"); [[ ${#eps[@]} -gt 0 ]] || mapfile -t eps < <(printf '%s\n' "${!STILLS[@]}" | sort)

tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
fail=0
for ep in "${eps[@]}"; do
  [[ -n ${STILLS[$ep]:-} ]] || { echo "нет списка стиллов для эпизода $ep" >&2; exit 2; }
  FRAMES_DIR="$tmp/$ep" node render.mjs --ep "$ep" --stills "${STILLS[$ep]}" --dsf 1 >/dev/null
  base="tests/baseline/$ep"
  if [[ $mode == save ]]; then
    rm -rf "$base"; mkdir -p "$base"; cp "$tmp/$ep"/still_*.png "$base/"
    echo "$ep: эталоны сохранены ($(ls "$base" | wc -l) шт.) → $base"
    continue
  fi
  [[ -d $base ]] || { echo "$ep: нет эталонов в $base (сначала: bash tests/regress.sh save $ep)"; fail=1; continue; }
  diffs=()
  for f in "$tmp/$ep"/still_*.png; do
    n=$(basename "$f")
    if [[ ! -f $base/$n ]]; then diffs+=("$n (нет эталона)")
    elif ! cmp -s "$f" "$base/$n"; then diffs+=("$n"); fi
  done
  for b in "$base"/still_*.png; do [[ -f $tmp/$ep/$(basename "$b") ]] || diffs+=("$(basename "$b") (эталон без кадра)"); done
  if [[ ${#diffs[@]} -eq 0 ]]; then echo "$ep: ok ($(ls "$base" | wc -l) стиллов совпали)"
  else
    fail=1; echo "$ep: ОТЛИЧАЮТСЯ ${#diffs[@]}: ${diffs[*]}"
    keep="${TMPDIR:-/tmp}/regress-$ep"; rm -rf "$keep"; mkdir -p "$keep"; cp "$tmp/$ep"/still_*.png "$keep/"
    echo "  новые кадры: $keep (сравни глазами с $base)"
  fi
done
exit $fail
