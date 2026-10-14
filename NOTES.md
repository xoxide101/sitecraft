# SiteCraft – development notes

How SiteCraft is built, why it is shaped the way it is, and the GrapesJS gotchas we hit. For what it does and how to use it, see [README.md](README.md).

## Aim

A website builder that feels like a familiar Windows word processor, so people can find and understand every feature: a ribbon of labelled tools, a styles gallery, right-click menus and a status bar. Underneath it is a real web builder, [GrapesJS](https://grapesjs.com/) 0.21.13. It must work offline from a double-clicked `index.html`.

## Files

| File | What it holds |
| --- | --- |
| `sitecraft.src.html` | Layout, CSS, the core editor (formatting engine, menus, dialogs, find and replace, paste clean-up, status bar) and the `window.SC` API |
| `js/sc-features.js` | HTML element gallery, widgets, libraries, compatibility and accessibility checks, design themes, layout tools, table tools, Draw Table |
| `js/sc-pages.js` | Pages panel, site menu, templates, the File start page (Backstage), save and open site folders |
| `js/sc-quick.js` | The Quick styles panel |
| `js/sc-hotspots.js` | Picture hotspots |
| `js/sc-ribbon.js` | The ribbon tabs, the logo menu, and the single top line (it moves the old top-bar controls into the tab row) |
| `build.py` | Writes `index.html` (offline: local GrapesJS, fonts and `js/`) and `dist/artifact.html` (one file with the modules inlined) |
| `fetch_fonts.py` | Downloads the interface fonts into `fonts/` |

**Edit the source, then run `python build.py`.** The source file links `grapes.css` itself, so it also works when opened directly; the builds inline that CSS.

## Title bar and ribbon (this app's own copy)

The title bar and ribbon code (`CraftTitlebar`, `CraftRibbon`, `CraftIcons`) started as one file shared by the Craft apps. **Each app now keeps its own copy and changes it on its own**: here it is js/craft-titlebar.js. Changes are not copied to the other apps, so the apps can be refined separately until it is clear how unified they should be. It provides:

- **`CraftTitlebar`:**
  - logo button that opens every classic menu side by side (F10)
  - quick buttons that people can hide or extend with any command (⌄; right-click a quick button to remove it; kept in localStorage `<app>-quick`)
  - file name and save state
  - **Search commands (Alt+Q)** over menus and ribbon, with recently used commands
  - info chips, theme and help
- **`CraftRibbon`:** tabs of labelled buttons in named groups (or Office-style icon-only buttons: `{ row: [...] }` with `iconOnly: true`, `'|'` for a divider), one color per tab, collapse with ⌃ or a double-click; remembers the last tab.
- **`CraftIcons`:** the shared icon set.

Ribbon buttons reuse the apps' own menu commands (looked up by label), so a button and its menu item always do the same thing. Each app has a matching logo in `docs/logo.svg` (also used as the browser-tab icon).

## Title bar

`js/craft-titlebar.js` is the shared `CraftTitlebar` component used by all the Craft apps (copied into each). `sc-ribbon.js` sets it up.

- **Left:** the logo menu button and quick buttons (save, undo, redo, preview in browser, print).
- **Middle:** the file name and save state.
- **Search:** Alt+Q, also inside the page canvas. It finds every menu command **and every ribbon button**, with its tab and group.
- **Info chips:** pages, screen size, HTML standard.
- **Right:** theme and help.

## How the pieces talk

- The main script builds the editor, then sets up `window.SC`: the editor, settings, helpers (`mk`, `dialog`, `toast`, `insertBlock`, …), `actions` (what every ribbon button runs), `refreshHooks`, `exportHooks` (head and body-end) and `importHooks`.
- Modules add actions and hooks. A ribbon button only names its action in `data-act`.
- **Settings saved with the project** (compatibility mode, libraries, page script, page titles and file names) go through GrapesJS's `storageManager.onStore` / `onLoad`.
- **`fullHtml(page)`** writes the saved file: the doctype for the chosen standard, title and description, library tags, the page's CSS and HTML, then widget and page scripts.
- **Text formatting:**
  - Selected words are formatted inline with `execCommand` in the page frame.
  - With no words selected, the whole element's style changes.
  - The text selection is remembered across clicks on the ribbon, its dropdowns and pickers.

## GrapesJS gotchas (learned the hard way)

1. **`projectData` in `grapesjs.init` makes GrapesJS skip the autosave.** Only pass the starter page when nothing is saved yet.
2. **Text editing stops on any mouse press outside the text**: GrapesJS listens for `mousedown` on both documents. Toolbars, pickers, menus and dialogs stop that event (`keepEditing`), as GrapesJS's own toolbar does.
3. **`Component.find()` only searches the page on screen.** For other pages, walk the objects with `onAll()`.
4. **Inline styles move into `#id` rules** in the page CSS, so they are not in `toHTML()`. Read positions and colors with `getStyle()`.
5. **Table cells and `<summary>` are not editable text by default.** The custom types `sc-cell` and `sc-summary` (extending `text`) fix that, and they are added in a plugin so they apply while the project loads.
6. **On `canvas:frame:load` the canvas document isn't attached yet.** Use the `window` passed to the event.
7. **Browsers pause `requestAnimationFrame` in background windows,** so the ribbon refresh uses a short timer.
8. **The element-to-object link:** `el.__gjsv.model`.

## Decisions

- **Shapes, text boxes and shadows (same features in every Craft app that places objects):** box, circle/oval, triangle, diamond, pentagon, hexagon, octagon, star and arrow (plus lines), with corners from sharp to round (`shapePath`: 100% rounds each corner to half the shortest side), words inside, text boxes with wrapping, border, background, corners and padding, a drop shadow and opacity. Each app has its own copy of the shape geometry.

- The **SiteCraft logo** (top left) is the one button for all the classic menus (F10). Undo/redo, screen size, Preview, Code and Copy HTML sit on the right of the tab row.
- **Each ribbon tab has its own color**, and contextual tabs (Table) appear only when they apply.
- **The File tab opens a Backstage start page** with live template thumbnails (sandboxed iframes scaled down).
- **Widgets** are small scripts written for SiteCraft (MIT). They are added once to the saved page, only when the page uses them, and they don't run inside the editor; **Preview in browser** runs them.
- **Libraries** load from cdnjs or jsDelivr at view time (online). CSS libraries are also injected into the editor canvas.
- **Hotspots** are positioned links in percentages (responsive) with CSS hover effects, plus an optional classic `<map>`. On touch screens they are always outlined.
- **The site menu** is a `nav[data-sitenav]` regenerated from the pages list whenever pages change. Each page marks its own link as current.
- **Compatibility modes** change the doctype, the charset tag and how void tags are written (`<br />` for XHTML, `<br>` otherwise). The checker lists elements the mode lacks.

## Version history

| Version | Changes |
| --- | --- |
| 0.1 | Drag-and-drop builder with starter page, blocks, style and settings panels |
| 0.2 | File/Edit/View/Help menus, open and save, working Code and Preview toggles, offline fonts, light/dark |
| 0.3 | Word-style editing: formatting bar, Insert/Format/Table menus, tables, find and replace, paste clean-up, right-click menu, status bar; autosave restore fixed |
| 0.4 | Ribbon, logo menu, Quick styles, pages and site menu, templates and start page, hotspots, HTML elements, widgets, libraries, 30+ screen sizes, compatibility modes, accessibility check, Draw Table, merge and split cells |

## Testing approach

- **Browser:** each feature driven through its real buttons and menus in a browser (served with `python -m http.server`).
- **Screenshots:** taken with headless Chrome over the DevTools protocol, using a throwaway profile.
- **Saving into a folder:** tested against the browser's private file system (OPFS), which uses the same API as a real folder.
- **Not yet tested:** the real Windows folder picker, printing on paper.

## Ideas for later

- Export a whole site as a `.zip`.
- One-click publishing to a web host.
- Image editing (crop, rotate).
- Undo for page-level settings (theme, libraries).

**2026-10-14:** Shapes (`.sc-shape`, SVG background from `shapePath`), curved text (`svg.sc-curve` with textPath, model in `data-curve`), Box look, rotation, opacity and drop shadow in Quick styles.

**2026-10-14:** Shapes can be 3-D in three colours (face = fill, side = `side`, edge = border) and have one border line or three (`lines`: outer, middle, inner; a middle line with no colour leaves a gap). `shapeLayers()` lists what to draw, back to front; it is the same code in each Craft app.

**2026-10-14:** Dingbats (`DINGBATS`, `DINGBAT_FONT`) and colour fills for see-through pictures (`FILL_MODES`: original, solid, tint, gradient, picture). Pictures are recoloured with a CSS mask (`setImageFill`, model in `data-fx`, the picture pixels moved out of view with `object-position`); the Symbol picker includes the dingbat groups.
