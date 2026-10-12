#!/usr/bin/env python3
"""Renders img/og-image.jpg, img/og-coaster.jpg, favicon files and apple-touch-icon from tools/social.html.
Needs: python3 + playwright + Pillow, and the site served locally (default http://127.0.0.1:8102).
Usage: python3 tools/render-social.py [base_url]"""
import io, os, sys
from playwright.sync_api import sync_playwright
from PIL import Image

base = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8102'
root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
chrome = os.environ.get('CHROME_PATH', '/opt/pw-browsers/chromium')

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=chrome, args=['--no-sandbox'])
    def shot(mode, w, h, transparent=False):
        page = browser.new_page(viewport={'width': w, 'height': h})
        page.goto(f'{base}/tools/social.html?mode={mode}')
        page.wait_for_load_state('networkidle')
        page.evaluate("""Promise.all([document.fonts.load('italic 500 56px "Playfair Display"'),
            document.fonts.load('400 68px "Playfair Display"'), document.fonts.load('italic 600 380px "Playfair Display"'),
            document.fonts.load('600 20px Inter')])""")
        page.wait_for_timeout(300)
        png = page.screenshot(omit_background=transparent)
        page.close()
        return Image.open(io.BytesIO(png))
    og = shot('og', 1200, 630).convert('RGB')
    og.save(os.path.join(root, 'img/og-image.jpg'), quality=82, optimize=True, progressive=True)
    co = shot('coaster', 1200, 630).convert('RGB')
    co.save(os.path.join(root, 'img/og-coaster.jpg'), quality=82, optimize=True, progressive=True)
    rnd = shot('icon', 512, 512, transparent=True).convert('RGBA')
    sq = shot('icon-square', 512, 512).convert('RGB')
    browser.close()

sq.resize((180, 180), Image.LANCZOS).save(os.path.join(root, 'apple-touch-icon.png'), optimize=True)
rnd.resize((32, 32), Image.LANCZOS).save(os.path.join(root, 'favicon-32.png'), optimize=True)
rnd.save(os.path.join(root, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)])
print('rendered: og-image.jpg, og-coaster.jpg, apple-touch-icon.png, favicon-32.png, favicon.ico')
