#!/usr/bin/env bash
# Rebuild site.css (Tailwind) and the optimized images. Run from anywhere: bash tools/build.sh
# Photos are not touched; run `python3 tools/strip-exif.py new-photo.jpg` on any new phone photo first (removes GPS).
set -euo pipefail
cd "$(dirname "$0")/.."
[ -d tools/node_modules ] || (cd tools && npm install --no-audit --no-fund)
./tools/node_modules/.bin/tailwindcss -c tools/tailwind.config.js -i tools/input.css -o assets/site.css --minify
node tools/optimize-images.mjs
echo "done: assets/site.css + img/"
