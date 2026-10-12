# IBAME Essence — essence.ibame.ca

Static site on Vercel (auto-deploys from `main`). No framework, no runtime dependencies, no third-party requests.

## Files
- `index.html` home · `coaster.html` NFC tap page (`/coaster`) · `404.html`
- `assets/site.css` compiled Tailwind + custom CSS (generated) · `assets/fonts/` self-hosted Inter + Playfair Display (SIL OFL)
- `img/` AVIF/WebP variants, wordmark and social-share images (generated) · root `*.jpg` original photos (pixels untouched, metadata stripped). Exception: `valet-tray-1.jpg` and `coaster-set-1.jpg` are AI-generated concept images, not photographs.
- `vercel.json` clean URLs, security headers, cache rules · `robots.txt` · `sitemap.xml` · `tools/` build scripts (not deployed)

## After editing HTML or adding photos
1. New phone photo: `python3 tools/strip-exif.py photo.jpg` (removes GPS/device data), put it in the repo root.
2. Add a row to `PHOTOS` in `tools/optimize-images.mjs`, then `bash tools/build.sh` (rebuilds `assets/site.css` and `img/`).
3. Commit and push. Branch pushes get a protected preview URL; merging to `main` goes live.

## Open items
- Replace the AI concept images with real photos of the finished pieces. The source PNGs carried signed OpenAI content credentials ("AI-generated"); those do not survive re-encoding, so the page discloses it visibly: an "AI concept image" tag on both cards plus a footnote under the New Arrivals grid (search `index.html` for `AI concept image` and `AI-generated concept`). With real photos: `python3 tools/strip-exif.py photo.jpg`, swap the files or rows in `tools/optimize-images.mjs`, `bash tools/build.sh`, then remove the tags and the footnote.
- New Arrivals copy says "birdseye maple inlay" and "maple inlay"; neither concept image shows an inlay. Align the copy or the images before launch.
- Product structured data (`Product`/`Offer`) is intentionally absent until real product photos and a real checkout exist.
