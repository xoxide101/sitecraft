"""Builds SiteCraft from sitecraft.src.html.

  index.html          standalone app that works offline: loads the local grapes.min.js and
                      the fonts in fonts/ (run fetch_fonts.py once to download them)
  dist/artifact.html  page fragment for publishing as a Claude artifact (GrapesJS from unpkg,
                      fonts from Google Fonts)

Run:  python build.py
"""
import pathlib
import re

root = pathlib.Path(__file__).parent
src = (root / "sitecraft.src.html").read_text(encoding="utf-8")
css = (root / "grapes.css").read_text(encoding="utf-8")
page = src.replace("/*GRAPES_CSS*/", css)
# sitecraft.src.html links grapes.css so it also works when opened directly; the builds inline it.
page = page.replace('<link rel="stylesheet" href="grapes.css" data-src-only>\n', "")

CDN = '<script src="https://unpkg.com/grapesjs@0.21.13/dist/grapes.min.js"></script>'
LOCAL = '<script src="grapes.min.js"></script>'
assert CDN in page, "GrapesJS script tag not found"
assert (root / "grapes.min.js").exists(), "grapes.min.js is missing"

# Swap the two Google Fonts <link> tags for the local stylesheet.
GOOGLE_FONTS = re.compile(r'<link rel="preconnect" href="https://fonts\.googleapis\.com">\n'
                          r'<link rel="stylesheet" href="https://fonts\.googleapis\.com/[^"]+">')
assert GOOGLE_FONTS.search(page), "Google Fonts links not found"
assert (root / "fonts" / "fonts.css").exists(), "fonts/fonts.css is missing: run python fetch_fonts.py"
offline = GOOGLE_FONTS.sub('<link rel="stylesheet" href="fonts/fonts.css">', page, count=1)

head, body = offline.split('<div class="app">', 1)
standalone = (
    '<!doctype html>\n<html lang="en">\n<head>\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
    + head.strip() + '\n</head>\n<body>\n<div class="app">'
    + body.replace(CDN, LOCAL) + '</body>\n</html>\n'
)
(root / "index.html").write_text(standalone, encoding="utf-8")
(root / "dist").mkdir(exist_ok=True)
(root / "dist" / "artifact.html").write_text(page, encoding="utf-8")
print("Built index.html (offline) and dist/artifact.html")
