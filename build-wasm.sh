#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd -- "$(dirname -- "$0")" && pwd)"
export EM_CACHE="${EM_CACHE:-$HOME/.cache/emscripten}"
mkdir -p "$EM_CACHE"
ulimit -d "${BUILD_MEMORY_KB:-5242880}"

if [[ -z "${EM_CONFIG:-}" && -f /usr/share/emscripten/.emscripten ]]; then
  export EM_CONFIG="$ROOT/CMake/emscripten.config"
  cp /usr/share/emscripten/.emscripten "$EM_CONFIG"
  sed -i 's/^FROZEN_CACHE = True.*/FROZEN_CACHE = False/' "$EM_CONFIG"
fi

EMSCRIPTEN_ROOT="$(em-config EMSCRIPTEN_ROOT)"
python3 "$ROOT/package-assets.py" \
  "$ROOT/SuperTuxKart-0.8.1/data" \
  "$ROOT/Web" \
  "$EMSCRIPTEN_ROOT/tools/file_packager.py"

emcmake cmake \
  -S "$ROOT/SuperTuxKart-0.8.1" \
  -B "$ROOT/CMake" \
  -DCMAKE_BUILD_TYPE=Release \
  -DUSE_WIIUSE=OFF \
  -DUSE_FRIBIDI=OFF

cmake --build "$ROOT/CMake" --parallel "${JOBS:-1}"

BUILD_ID="${STK_BUILD_ID:-$(git -C "$ROOT" rev-parse --short HEAD)-$(date -u +%Y%m%d%H%M%S)}"
python3 - "$ROOT/Web/supertuxkart.html" "$BUILD_ID" <<'PY'
from pathlib import Path
import sys

html_path = Path(sys.argv[1])
build_id = sys.argv[2]
html = html_path.read_text(encoding="utf-8")
script_tag = '<script async type="text/javascript" src="supertuxkart.js"></script>'
if "__STK_BUILD_ID__" not in html or script_tag not in html:
    raise SystemExit("Generated HTML is missing expected build cache-busting markers")

html = html.replace("__STK_BUILD_ID__", build_id)
html = html.replace(
    script_tag,
    f'<script async type="text/javascript" src="supertuxkart.js?v={build_id}"></script>')
html_path.write_text(html, encoding="utf-8")
PY
