#!/usr/bin/env bash
set -euo pipefail

input="${1:?Usage: render_drawio.sh <file.drawio> [output-directory]}"
output_dir="${2:-$(dirname "$input")}" 
mkdir -p "$output_dir"

if command -v drawio >/dev/null 2>&1; then
  cli="$(command -v drawio)"
elif [[ -x /Applications/draw.io.app/Contents/MacOS/draw.io ]]; then
  cli="/Applications/draw.io.app/Contents/MacOS/draw.io"
else
  echo "draw.io CLI not found" >&2
  exit 1
fi

name="$(basename "$input" .drawio)"
png="$output_dir/${name}.png"
pdf="$output_dir/${name}.pdf"

"$cli" --export --format png --scale 2 --border 20 --output "$png" "$input"
"$cli" --export --format pdf --crop --border 20 --output "$pdf" "$input"
printf '%s\n%s\n' "$png" "$pdf"
