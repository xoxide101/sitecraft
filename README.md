# SiteCraft

A drag-and-drop website builder that runs in the browser, in the spirit of CoffeeCup Site Designer and Webstudio. Built on [GrapesJS](https://grapesjs.com/).

- File / Edit / View / Help menus: new, open, save, clear template
- Code view and Preview toggles (Esc leaves preview)
- Light/dark toggle
- Works fully offline: GrapesJS and the fonts are in this folder

## Use it
Open `index.html` in Chrome or Edge.

## Change it
Edit `sitecraft.src.html`, then run:

```
python build.py
```

This writes `index.html` (offline, uses the local files) and `dist/artifact.html` (single file).
`fetch_fonts.py` downloads the fonts into `fonts/` again if needed.

## Third-party
GrapesJS 0.21.13 (BSD-3-Clause). Fonts: Bricolage Grotesque, IBM Plex Sans, IBM Plex Mono (SIL Open Font License).
