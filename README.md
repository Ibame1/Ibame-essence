# IBAME Essence — essence.ibame.ca

Static site on Vercel (auto-deploys from `main`). No framework, no runtime dependencies, no third-party requests.

## Files
- `index.html` home · `coaster.html` NFC tap page (`/coaster`) · `404.html`
- `assets/site.css` compiled Tailwind + custom CSS (generated) · `assets/fonts/` self-hosted Inter + Playfair Display (SIL OFL)
- `img/` AVIF/WebP variants, wordmark and social-share images (generated) · root `*.jpg` original photos (pixels untouched, metadata stripped)
- `vercel.json` clean URLs, security headers, cache rules · `robots.txt` · `sitemap.xml` · `tools/` build scripts (not deployed)

## After editing HTML or adding photos
1. New phone photo: `python3 tools/strip-exif.py photo.jpg` (removes GPS/device data), put it in the repo root.
2. Add a row to `PHOTOS` in `tools/optimize-images.mjs`, then `bash tools/build.sh` (rebuilds `assets/site.css` and `img/`).
3. Commit and push. Branch pushes get a protected preview URL; merging to `main` goes live.

## Open items
- Photos for the Valet & Desk Organizer Tray and the Coaster Set with Holder. `valet-tray-1.jpg` and `coaster-set-1.jpg` were referenced by the page but never added to the repo, so those cards show a "Photo coming soon" tile. Search `index.html` for `PHOTO PENDING`.
- Product structured data (`Product`/`Offer`) is intentionally absent until those photos exist.
