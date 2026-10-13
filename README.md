# SiteCraft

**A drag-and-drop website builder that runs in your browser, fully offline.**

In the spirit of CoffeeCup Site Designer and Webstudio: drag blocks onto a page, double-click text to edit it, style anything from the side panel, and save a finished `.html` page. Built on [GrapesJS](https://grapesjs.com/), with everything it needs (the editor and the fonts) in this folder, so it works with no internet connection.

![SiteCraft editing the bakery starter template: blocks on the left, the page in the middle, style panel on the right](docs/editor.png)

## Getting started

1. Download this repository (green **Code** button › **Download ZIP**) or clone it.
2. Double-click `index.html`. It opens in Chrome or Edge.
3. Start from the **starter template** (a small bakery page) or **File › New blank page**.
4. Drag blocks in from the left, double-click text to change it, then **File › Save** to save the page as an `.html` file.

Your work also autosaves in the browser, so closing the tab does not lose it.

## What it does

### Build the page
- **Blocks** to drag in:
  - **Layout**: section, 2 columns, 3 columns
  - **Basic**: heading, text, image, button, link
  - **Sections**: hero, card, quote, contact form
  - **Media**: video, map
- **Double-click** text on the page to edit it in place.
- **Layers** panel shows the page structure; select, reorder and nest elements.
- **Style** panel: typography, spacing, size, flex layout, borders, backgrounds, shadows, and hover/active **states**, using classes.
- **Settings** panel: link targets, image alt text and other attributes.
- **Device preview**: desktop, tablet and phone widths.

### Menus
- **File**: new blank page, new from starter template, open, save, save as, close file, clear page.
- **Edit**: undo, redo, copy / paste / duplicate / delete element, select parent, deselect, copy page HTML.
- **View**: preview, view code, element outlines, desktop / tablet / phone, blocks, layers, style, settings, light / dark / match system.
- **Help**: getting started, keyboard shortcuts, GrapesJS documentation, about.

### Code and preview
- **Code** shows the page's HTML and CSS.
- **Copy HTML** copies the finished page in one click.
- **Preview** hides the editor so you see the page as a visitor would. Press **Esc** or click Preview again to go back.

### Light and dark
The moon/sun button switches the editor between light and dark (or follow the system setting from the View menu). Your page's own colors are not affected.

## Keyboard shortcuts

| Action | Keys |
| --- | --- |
| Open a file | Ctrl+O |
| Save | Ctrl+S |
| Save as | Ctrl+Shift+S |
| Undo / Redo | Ctrl+Z / Ctrl+Shift+Z |
| Copy selected element | Ctrl+C |
| Paste after selected element | Ctrl+V |
| Delete selected element | Delete |
| Select parent / first child | A / D |
| Select next / previous sibling | S / W |
| Leave preview | Esc |

## For developers

The app is written in `sitecraft.src.html`. After changing it, run:

```
python build.py
```

This writes:
- `index.html`: the offline app, using `grapes.min.js`, `grapes.css` and `fonts/` from this folder
- `dist/artifact.html`: a single-file version that loads GrapesJS from a CDN

`python fetch_fonts.py` downloads the fonts into `fonts/` again if they are ever missing.

## Requirements

Chrome or Edge (recent versions). Firefox and Safari work too, but download files instead of saving straight into a folder.

## Credits

- [GrapesJS](https://grapesjs.com/) 0.21.13 (BSD-3-Clause)
- Fonts: Bricolage Grotesque, IBM Plex Sans, IBM Plex Mono (SIL Open Font License)
