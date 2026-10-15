/* SiteCraft ribbon: the tabs above the page (File, Home, Insert, Design, Layout, View, Developer and
   Table when a table is selected). Every button has a label and sits in a named group, so features are
   easy to find. Buttons name an action in data-act; the actions live in SC.actions.
   Uses window.SC, which the main script sets up. */
(function () {
  'use strict';
  const SC = window.SC;
  const { editor, mk, toast, dialog, field } = SC;
  const A = SC.actions;

  // ---- Icons (24 × 24, drawn with the tab's color; .fill parts are tinted) ----
  const I = {
    curve: '<path d="M4 17a8 8 0 0 1 16 0" class="fill"/><path d="M4 17a8 8 0 0 1 16 0M7.2 10.6 6 9.2M12 9V7M16.8 10.6 18 9.2"/>',
    textbox: '<rect x="3" y="4" width="18" height="16" rx="1.5" class="fill"/><path d="M7 9h10M7 12.5h10M7 16h6"/>',
    sh_rect: '<path d="M0 0L18 0L18 16L0 16Z" transform="translate(3 4)" class="fill"/>',
    sh_rounded: '<path d="M0 2.4Q0 0 2.4 0L15.6 0Q18 0 18 2.4L18 13.6Q18 16 15.6 16L2.4 16Q0 16 0 13.6Z" transform="translate(3 4)" class="fill"/>',
    sh_ellipse: '<path d="M0 8A9 8 0 1 0 18 8A9 8 0 1 0 0 8Z" transform="translate(3 4)" class="fill"/>',
    sh_triangle: '<path d="M9 0L18 16L0 16Z" transform="translate(3 4)" class="fill"/>',
    sh_diamond: '<path d="M9 0L18 8L9 16L0 8Z" transform="translate(3 4)" class="fill"/>',
    sh_pentagon: '<path d="M9 0L17.56 5.53L14.29 14.47L3.71 14.47L0.44 5.53Z" transform="translate(3 4)" class="fill"/>',
    sh_hexagon: '<path d="M18 8L13.5 14.93L4.5 14.93L0 8L4.5 1.07L13.5 1.07Z" transform="translate(3 4)" class="fill"/>',
    sh_octagon: '<path d="M12.44 0.61L17.31 4.94L17.31 11.06L12.44 15.39L5.56 15.39L0.69 11.06L0.69 4.94L5.56 0.61Z" transform="translate(3 4)" class="fill"/>',
    sh_star: '<path d="M9 0L11.38 5.09L17.56 5.53L12.85 9.11L14.29 14.47L9 11.6L3.71 14.47L5.15 9.11L0.44 5.53L6.62 5.09Z" transform="translate(3 4)" class="fill"/>',
    sh_arrow: '<path d="M0 4.8L10.8 4.8L10.8 0L18 8L10.8 16L10.8 11.2L0 11.2Z" transform="translate(3 4)" class="fill"/>',
    page: '<path d="M6 3h8l4 4v14H6Z" class="fill"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    table: '<rect x="3" y="4" width="18" height="16" rx="2" class="fill"/><path d="M3 9h18M3 14h18M9 4v16M15 4v16"/>',
    draw: '<rect x="3" y="4" width="14" height="12" rx="1.5" stroke-dasharray="3 2"/><path d="m14 21 7-7-2-2-7 7-1 3Z" class="fill"/>',
    picture: '<rect x="3" y="5" width="18" height="14" rx="2" class="fill"/><circle cx="9" cy="10" r="1.8"/><path d="m3 17 5-4 4 3 3-2 6 4"/>',
    web: '<circle cx="12" cy="12" r="9" class="fill"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    video: '<rect x="3" y="5" width="18" height="14" rx="2" class="fill"/><path d="m10 9 5 3-5 3Z"/>',
    map: '<path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12Z" class="fill"/><circle cx="12" cy="9" r="2.5"/>',
    embed: '<rect x="3" y="4" width="18" height="16" rx="2" class="fill"/><path d="M3 8h18M8 13l-2 2 2 2M16 13l2 2-2 2"/>',
    tag: '<path d="M3 12 12 3h8v8l-9 9Z" class="fill"/><circle cx="16" cy="8" r="1.5"/><path d="m8 13 3 3"/>',
    section: '<rect x="3" y="6" width="18" height="12" rx="2" class="fill"/><path d="M7 10h10M7 14h6"/>',
    cols2: '<rect x="3" y="5" width="8" height="14" rx="1.5" class="fill"/><rect x="13" y="5" width="8" height="14" rx="1.5" class="fill"/>',
    cols3: '<rect x="2" y="5" width="6" height="14" rx="1.2" class="fill"/><rect x="9" y="5" width="6" height="14" rx="1.2" class="fill"/><rect x="16" y="5" width="6" height="14" rx="1.2" class="fill"/>',
    button: '<rect x="3" y="8" width="18" height="8" rx="4" class="fill"/><path d="M8 12h8"/>',
    divider: '<path d="M3 12h18"/><path d="M6 7h12M6 17h12" stroke-dasharray="2 3"/>',
    details: '<path d="m6 8 3 3 3-3"/><path d="M14 9h7M3 14h18M3 18h12"/>',
    heading: '<path d="M6 5v14M18 5v14M6 12h12"/>',
    para: '<path d="M4 6h16M4 10h16M4 14h16M4 18h10"/>',
    bullets: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1.2"/><circle cx="4.5" cy="12" r="1.2"/><circle cx="4.5" cy="18" r="1.2"/>',
    numbers: '<path d="M10 6h10M10 12h10M10 18h10"/><path d="M4 5h1v3M4 8h2M4 11h2l-2 2h2"/>',
    quote: '<path d="M5 17c0-5 2-8 5-9M13 17c0-5 2-8 5-9"/>',
    code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13 5l-2 14"/>',
    toc: '<path d="M4 6h3M10 6h10M6 12h3M12 12h8M6 18h3M12 18h8"/>',
    symbol: '<path d="M7 19h4v-2a6 6 0 1 1 2 0v2h4"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    bookmark: '<path d="M6 3h12v18l-6-4-6 4Z" class="fill"/>',
    nav: '<rect x="3" y="5" width="18" height="5" rx="1.5" class="fill"/><path d="M6 7.5h3M11 7.5h3M16 7.5h2M5 14h14M5 18h9"/>',
    widget: '<rect x="3" y="3" width="8" height="8" rx="2" class="fill"/><rect x="13" y="3" width="8" height="8" rx="4"/><rect x="3" y="13" width="8" height="8" rx="4"/><path d="M17 13v8M13 17h8"/>',
    theme: '<circle cx="12" cy="12" r="9" class="fill"/><circle cx="8" cy="10" r="1.5"/><circle cx="12" cy="7" r="1.5"/><circle cx="16" cy="10" r="1.5"/><path d="M12 21c-2 0-2-3 0-4s2-3 0-3"/>',
    font: '<path d="M4 19 9 5h1l5 14M6 14h7M16 19l2.5-7h.5L21 19M17 17h3"/>',
    color: '<path d="M12 3s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12Z" class="fill"/>',
    width: '<path d="M3 12h18M6 9l-3 3 3 3M18 9l3 3-3 3M3 4v4M21 4v4"/>',
    props: '<rect x="4" y="3" width="16" height="18" rx="2" class="fill"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    smart: '<path d="M6 8c0-2 2-3 3-3M6 8v3h3V8ZM13 8c0-2 2-3 3-3M13 8v3h3V8Z"/><path d="M5 17h14"/>',
    pad: '<rect x="3" y="3" width="18" height="18" rx="2" class="fill"/><rect x="8" y="8" width="8" height="8" rx="1"/>',
    margin: '<rect x="7" y="7" width="10" height="10" rx="1" class="fill"/><path d="M3 3h18v18H3Z" stroke-dasharray="2 2"/>',
    alignL: '<path d="M4 4v16"/><rect x="7" y="8" width="10" height="8" rx="1" class="fill"/>',
    alignC: '<path d="M12 4v16"/><rect x="6" y="8" width="12" height="8" rx="1" class="fill"/>',
    alignR: '<path d="M20 4v16"/><rect x="7" y="8" width="10" height="8" rx="1" class="fill"/>',
    stack: '<rect x="5" y="4" width="14" height="6" rx="1" class="fill"/><rect x="5" y="14" width="14" height="6" rx="1" class="fill"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2" class="fill"/><path d="M5 15V5a1 1 0 0 1 1-1h9"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    parent: '<rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="3 2"/><rect x="8" y="8" width="8" height="8" rx="1" class="fill"/>',
    desktop: '<rect x="2" y="4" width="20" height="13" rx="1.5" class="fill"/><path d="M8 21h8M12 17v4"/>',
    tablet: '<rect x="5" y="2" width="14" height="20" rx="2" class="fill"/><path d="M11 18h2"/>',
    phone: '<rect x="7" y="2" width="10" height="20" rx="2" class="fill"/><path d="M11 18h2"/>',
    rotate: '<rect x="7" y="3" width="10" height="16" rx="2" class="fill"/><path d="M3 14a9 9 0 0 0 8 7l-2-2M21 10a9 9 0 0 0-8-7l2 2"/>',
    sizes: '<rect x="2" y="5" width="12" height="9" rx="1"/><rect x="15" y="8" width="7" height="12" rx="1.5" class="fill"/><path d="M5 18h6"/>',
    zoomIn: '<circle cx="10.5" cy="10.5" r="6.5" class="fill"/><path d="m15.5 15.5 5 5M8 10.5h5M10.5 8v5"/>',
    zoomOut: '<circle cx="10.5" cy="10.5" r="6.5" class="fill"/><path d="m15.5 15.5 5 5M8 10.5h5"/>',
    zoom100: '<circle cx="10.5" cy="10.5" r="6.5" class="fill"/><path d="m15.5 15.5 5 5"/><text x="10.5" y="13" font-size="6.5" text-anchor="middle" stroke="none" fill="currentColor">1:1</text>',
    fit: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/><rect x="8" y="8" width="8" height="8" rx="1" class="fill"/>',
    outline: '<rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="3 2" class="fill"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" class="fill"/><circle cx="12" cy="12" r="3"/>',
    browser: '<rect x="3" y="4" width="18" height="16" rx="2" class="fill"/><path d="M3 8h18M6 6h.01M8.5 6h.01M14 12l3 2.5-3 2.5M10 12l-3 2.5 3 2.5"/>',
    full: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    status: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 16h18" /><rect x="3" y="16" width="18" height="4" class="fill"/>',
    spell: '<path d="M4 16 8 6l4 10M5.5 12.5h5M14 14l3 3 5-7"/>',
    sun: '<circle cx="12" cy="12" r="4" class="fill"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11Z" class="fill"/>',
    pagesP: '<path d="M6 3h8l4 4v14H6Z" class="fill"/><path d="M14 3v4h4"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5Z" class="fill"/><path d="m3 13 9 5 9-5"/>',
    blocks: '<rect x="3" y="3" width="8" height="8" rx="1.5" class="fill"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5" class="fill"/>',
    brush: '<path d="M14 4 20 10l-7 7-6-6Z" class="fill"/><path d="M7 11l-4 9 9-4"/>',
    htmlcode: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4" /><rect x="3" y="3" width="18" height="18" rx="2" class="fill" stroke="none"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16Z" class="fill"/><path d="m13 7 4 4"/>',
    lib: '<rect x="3" y="4" width="4" height="16" rx="1" class="fill"/><rect x="8" y="4" width="4" height="16" rx="1"/><path d="m14 5 4-1 3 15-4 1Z" class="fill"/>',
    script: '<path d="M8 3h9a2 2 0 0 1 2 2v12a4 4 0 0 1-4 4H7a3 3 0 0 1-3-3v-1h11v1a3 3 0 0 0 3 3" class="fill"/><path d="M9 8h6M9 12h6"/>',
    compat: '<circle cx="12" cy="12" r="9" class="fill"/><path d="m8 12 3 3 5-6"/>',
    a11y: '<circle cx="12" cy="4.5" r="1.8"/><path d="M5 8l7 1.5L19 8M12 9.5V14l-3 6M12 14l3 6"/>',
    rowAbove: '<rect x="3" y="11" width="18" height="10" rx="1.5" class="fill"/><path d="M12 3v6M9 6h6"/>',
    rowBelow: '<rect x="3" y="3" width="18" height="10" rx="1.5" class="fill"/><path d="M12 15v6M9 18h6"/>',
    colLeft: '<rect x="11" y="3" width="10" height="18" rx="1.5" class="fill"/><path d="M3 12h6M6 9v6"/>',
    colRight: '<rect x="3" y="3" width="10" height="18" rx="1.5" class="fill"/><path d="M15 12h6M18 9v6"/>',
    delRow: '<rect x="3" y="8" width="18" height="8" rx="1.5" class="fill"/><path d="m9 10 6 4M15 10l-6 4"/>',
    delCol: '<rect x="8" y="3" width="8" height="18" rx="1.5" class="fill"/><path d="m10 9 4 6M14 9l-4 6"/>',
    mergeR: '<rect x="3" y="6" width="18" height="12" rx="1.5" class="fill"/><path d="M8 12h8M13 9l3 3-3 3"/>',
    mergeD: '<rect x="6" y="3" width="12" height="18" rx="1.5" class="fill"/><path d="M12 8v8M9 13l3 3 3-3"/>',
    split: '<rect x="3" y="6" width="18" height="12" rx="1.5" class="fill"/><path d="M12 6v12"/>',
    headRow: '<rect x="3" y="4" width="18" height="16" rx="1.5"/><rect x="3" y="4" width="18" height="5" class="fill"/><path d="M3 14h18M9 9v11M15 9v11"/>',
    banded: '<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 9h18v4H3Z" class="fill"/><path d="M3 17h18"/>',
    bGrid: '<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 12h18M12 4v16"/>',
    bLines: '<path d="M3 5h18M3 12h18M3 19h18"/>',
    bNone: '<rect x="3" y="4" width="18" height="16" rx="1.5" stroke-dasharray="2 3"/>',
    template: '<rect x="3" y="3" width="18" height="18" rx="2" class="fill"/><path d="M3 9h18M9 9v12"/>',
    save: '<path d="M5 3h11l3 3v15H5Z" class="fill"/><path d="M8 3v5h7V3M8 21v-7h8v7"/>',
    folder: '<path d="M3 6h6l2 2h10v11H3Z" class="fill"/>',
    hotspot: '<rect x="3" y="4" width="18" height="16" rx="2" class="fill"/><rect x="6" y="7" width="6" height="5" rx="1" stroke-dasharray="2 1.5"/><circle cx="16" cy="14" r="2.5"/><path d="m16 14 4 5"/>',
  };
  const svg = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${I[k] || ''}</svg>`;
  const big = (act, label, icon, title) => ({ big: true, act, label, icon, title });
  const small = (act, label, icon, title) => ({ act, label, icon, title });
  const col = (...items) => ({ col: items });
  const select = (act, label, options, title) => ({ select: true, act, label, options, title });

  // ---- Actions the ribbon adds (the rest come from the main script and the feature modules) ----
  const ins = (key) => () => SC.insertBlock(SC.INSERTS[key]);
  Object.assign(A, {
    'table-grid': (b) => SC.tablePop(b),
    'table-dialog': SC.tableDialog,
    picture: SC.insertImageFile, 'picture-url': SC.imageUrlDialog,
    video: () => SC.insertBlock({ type: 'video', src: '', style: { width: '100%', height: '360px' } }),
    map: () => SC.insertBlock({ type: 'map', style: { width: '100%', height: '320px' } }),
    embed: () => {
      const url = mk('input', { type: 'text', placeholder: 'https://www.youtube.com/embed/… or any page address' });
      dialog({ title: 'Embed a web page', body: [mk('p', { textContent: 'Shows another web page inside yours: a YouTube or Vimeo player, a Google map, a form, a calendar…' }), field('Address to embed', url)],
        actions: [{ label: 'Cancel' }, { label: 'Embed', primary: true, run: () => {
          if (!/^https?:\/\//i.test(url.value.trim())) { toast('Type a web address starting with https://'); return false; }
          SC.insertBlock(`<iframe src="${SC.esc(url.value.trim())}" title="Embedded content" style="width:100%;height:400px;border:0" allowfullscreen></iframe>`);
        } }] });
    },
    'ins-section': () => SC.insertBlock('<section style="padding:56px 6%"><h2>New section</h2><p style="line-height:1.6">Write something here.</p></section>'),
    'ins-cols2': () => SC.insertBlock('<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px;padding:24px 6%"><div style="min-height:80px;padding:12px"><p>Left column</p></div><div style="min-height:80px;padding:12px"><p>Right column</p></div></div>'),
    'ins-cols3': () => SC.insertBlock('<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;padding:24px 6%"><div style="min-height:80px;padding:12px"><p>One</p></div><div style="min-height:80px;padding:12px"><p>Two</p></div><div style="min-height:80px;padding:12px"><p>Three</p></div></div>'),
    'ins-button': ins('button'), 'ins-divider': ins('divider'), 'ins-details': ins('details'),
    'ins-heading': ins('heading'), 'ins-paragraph': ins('paragraph'), 'ins-bullets': ins('bullets'), 'ins-numbers': ins('numbers'),
    'ins-quote': ins('quote'), 'ins-code': ins('codeblock'), toc: SC.insertToc,
    bookmark: () => {
      const c = editor.getSelected();
      if (!c || c === editor.getWrapper()) { toast('Select the place the bookmark should point to first.'); return; }
      const id = mk('input', { type: 'text', value: c.getAttributes().id || '' , placeholder: 'for example: prices' });
      dialog({ title: 'Bookmark', body: [mk('p', { textContent: 'Give this element a name, then link to it with #name (for example a menu link to #prices).' }), field('Bookmark name', id)],
        actions: [{ label: 'Cancel' }, { label: 'Save', primary: true, run: () => {
          const v = id.value.trim().replace(/[^\w-]+/g, '-');
          if (!v) { toast('Type a name.'); return false; }
          c.addAttributes({ id: v }); toast(`Link to it with #${v}`);
        } }] });
    },
    smart: SC.smartTypography,
    'dev-desktop': () => SC.setDevice('Desktop'), 'dev-tablet': () => SC.setDevice('Tablet'), 'dev-phone': () => SC.setDevice('Mobile'),
    rotate: () => document.getElementById('rotate').click(),
    'more-sizes': () => { const s = document.getElementById('device-sel'); s.focus(); try { s.showPicker(); } catch (e) { toast('Pick a size from the list at the top of the window.'); } },
    'zoom-in': () => SC.zoomStep(1), 'zoom-out': () => SC.zoomStep(-1), 'zoom-100': () => SC.setZoom(100),
    'zoom-fit': () => SC.setDevice(SC.getDevice()),
    outlines: () => SC.outlineBtn.click(), preview: SC.togglePreview, code: SC.toggleCode, fullscreen: SC.toggleFullScreen,
    'tog-status': () => SC.toggleUi('statusbar'), 'tog-spell': () => SC.toggleUi('spell'),
    'ui-light': () => SC.setTheme('light'), 'ui-dark': () => SC.setTheme('dark'), 'ui-system': () => SC.setTheme('system'),
    'panel-pages': () => SC.showTab('tab-pages'), 'panel-objects': () => SC.showTab('tab-layers'), 'panel-blocks': () => SC.showTab('tab-blocks'),
    'panel-quick': () => SC.showTab('tab-quick'), 'panel-style': () => SC.showTab('tab-style'),
    'page-code': SC.openCodeDialog, 'edit-html': SC.editHtmlDialog, print: SC.printPage,
    'save-file': () => SC.save(false), 'open-file': SC.openFile,
  });

  // ---- The tabs ----
  const PADS = [['', 'Padding…'], ['0', 'None'], ['8', 'Small (8px)'], ['16', 'Medium (16px)'], ['32', 'Large (32px)'], ['64', 'Extra large (64px)']];
  const MARGINS = [['', 'Space around…'], ['0', 'None'], ['8', 'Small'], ['24', 'Medium'], ['48', 'Large'], ['auto', 'Center the block']];
  const WIDTHS = [['', 'Width…'], ['auto', 'Automatic'], ['25%', 'A quarter (25%)'], ['33.33%', 'A third (33%)'], ['50%', 'Half (50%)'], ['66.66%', 'Two thirds (66%)'], ['75%', 'Three quarters (75%)'], ['100%', 'Full width (100%)'], ['320px', '320 pixels'], ['640px', '640 pixels']];
  const PAGE_WIDTHS = [['', 'Page width…'], ['full', 'Full window'], ['1200', 'Wide (1200px)'], ['960', 'Medium (960px)'], ['720', 'Narrow (720px)']];
  const TABS = [
    { id: 'insert', label: 'Insert', groups: [
      ['Pages', [big('new-page', 'New page', 'page', 'Add a page to your site'), col(small('sitenav', 'Site menu', 'nav', 'A menu of all your pages that updates itself'), small('templates', 'Templates', 'template', 'Start from a ready-made design'))]],
      ['Tables', [big('table-grid', 'Table', 'table', 'Pick the size of a new table'), big('draw-table', 'Draw table', 'draw', 'Drag a box on the page to draw a table')]],
      ['Pictures and media', [big('picture', 'Picture', 'picture', 'A picture from this computer'), col(small('picture-url', 'Online picture', 'web', 'A picture from a web address'), small('video', 'Video', 'video', 'A video (YouTube, Vimeo or a file)'), small('map', 'Map', 'map', 'A Google map'))]],
      ['Elements', [big('html-element', 'HTML element', 'tag', 'Any HTML element, from a searchable list'), col(small('ins-section', 'Section', 'section'), small('ins-cols2', '2 columns', 'cols2'), small('ins-cols3', '3 columns', 'cols3')), col(small('ins-button', 'Button', 'button'), small('ins-divider', 'Divider line', 'divider'), small('ins-details', 'Collapsible', 'details'))]],
      ['Text', [col(small('ins-heading', 'Heading', 'heading'), small('ins-paragraph', 'Paragraph', 'para'), small('ins-quote', 'Quote', 'quote')), col(small('ins-bullets', 'Bulleted list', 'bullets'), small('ins-numbers', 'Numbered list', 'numbers'), small('ins-code', 'Code block', 'code')), col(small('toc', 'Contents list', 'toc', 'A table of contents from your headings'), small('symbol', 'Symbols & emoji', 'symbol', 'Dingbats, knitting symbols and emoji'))]],
      ['Shapes', [big('ins-textbox', 'Text box', 'textbox', 'Words in a box that wrap, with a border, background, corners, padding and shadow'), col(small('ins-shape-rect', 'Box', 'sh_rect', 'Box with words inside; corners from sharp to round in Quick styles'), small('ins-shape-rounded', 'Rounded box', 'sh_rounded', 'Rounded box with words inside; corners from sharp to round in Quick styles'), small('ins-shape-ellipse', 'Circle', 'sh_ellipse', 'Circle with words inside; corners from sharp to round in Quick styles')), col(small('ins-shape-triangle', 'Triangle', 'sh_triangle', 'Triangle with words inside; corners from sharp to round in Quick styles'), small('ins-shape-diamond', 'Diamond', 'sh_diamond', 'Diamond with words inside; corners from sharp to round in Quick styles'), small('ins-shape-pentagon', 'Pentagon', 'sh_pentagon', 'Pentagon with words inside; corners from sharp to round in Quick styles')), col(small('ins-shape-hexagon', 'Hexagon', 'sh_hexagon', 'Hexagon with words inside; corners from sharp to round in Quick styles'), small('ins-shape-octagon', 'Octagon', 'sh_octagon', 'Octagon with words inside; corners from sharp to round in Quick styles'), small('ins-shape-star', 'Star', 'sh_star', 'Star with words inside; corners from sharp to round in Quick styles')), col(small('ins-curve', 'Curved text', 'curve', 'Words along a circle: type them, choose up or down, then OK'), small('ins-shape-arrow', 'Arrow', 'sh_arrow', 'Arrow with words inside; corners from sharp to round in Quick styles'))]],
      ['Links', [col(small('link', 'Link', 'link', 'Link the selected words (Ctrl+K)'), small('bookmark', 'Bookmark', 'bookmark', 'Name a place on the page to link to'))]],
      ['Interactive', [big('hotspots', 'Picture hotspots', 'hotspot', 'Draw areas on a picture that react to hovering and clicking'), big('widgets', 'Widgets', 'widget', 'Sliders, tabs, pop-ups, countdowns and more'), big('ins-date', 'Date and time', 'calendar', 'Today’s date or the time: fixed words, or always up to date for each visitor'), big('embed', 'Embed', 'embed', 'Show another web page inside this one')]],
    ] },
    { id: 'design', label: 'Design', groups: [
      ['Themes', [{ themes: true }]],
      ['Fonts', [{ select: true, act: 'font-pair', label: 'Fonts', options: () => [['', 'Font pair…'], ...SC.FONT_PAIRS.map((f) => [f[0], f[0]])], title: 'Matching fonts for headings and text' }, small('smart', 'Smart quotes', 'smart', 'Curly quotes, dashes and ellipses across the page')]],
      ['Page', [big('page-color', 'Page color', 'color', 'The background color of the page'), col({ select: true, act: 'page-width', options: PAGE_WIDTHS, title: 'How wide the page content can get' }, small('page-props', 'Page properties', 'props', 'Title, description and language for search engines'))]],
    ] },
    { id: 'layout', label: 'Layout', groups: [
      ['Spacing', [col(select('padding', 'Padding', PADS, 'Space inside the selected element'), select('margin', 'Margin', MARGINS, 'Space around the selected element'), select('width', 'Width', WIDTHS, 'How wide the selected element is'))]],
      ['Position', [col(small('block-left', 'Left', 'alignL', 'Move the block to the left'), small('block-center', 'Center', 'alignC', 'Center the block'), small('block-right', 'Right', 'alignR', 'Move the block to the right'))]],
      ['Columns', [col(small('cols-1', 'Stacked', 'stack', 'Items one under another'), small('cols-2', '2 columns', 'cols2', 'Put the items inside into 2 columns'), small('cols-3', '3 columns', 'cols3', 'Put the items inside into 3 columns'))]],
      ['Arrange', [col(small('move-up', 'Move up', 'up'), small('move-down', 'Move down', 'down'), small('select-parent', 'Select parent', 'parent')), col(small('duplicate', 'Duplicate', 'copy'), small('delete', 'Delete', 'trash'))]],
      ['Show on', [col(small('show-desktop', 'Computers', 'desktop', 'Show the selected element on computers'), small('show-tablet', 'Tablets', 'tablet', 'Show it on tablets'), small('show-phone', 'Phones', 'phone', 'Show it on phones'))]],
    ] },
    { id: 'view', label: 'View', groups: [
      ['Screens', [big('dev-desktop', 'Computer', 'desktop'), big('dev-tablet', 'Tablet', 'tablet'), big('dev-phone', 'Phone', 'phone'), col(small('rotate', 'Sideways', 'rotate', 'Turn the phone or tablet'), small('more-sizes', 'More sizes', 'sizes', 'iPhone, Samsung, Pixel, iPad, Galaxy Tab and PC sizes'))]],
      ['Zoom', [col(small('zoom-in', 'Zoom in', 'zoomIn'), small('zoom-out', 'Zoom out', 'zoomOut'), small('zoom-100', '100%', 'zoom100')), small('zoom-fit', 'Fit', 'fit', 'Fit the screen size in the window')]],
      ['Look', [big('preview', 'Preview', 'eye', 'See the page without the editor (Esc to return)'), col(small('outlines', 'Outlines', 'outline', 'Dashed lines around every element'), small('fullscreen', 'Full screen', 'full'), small('code', 'Page code', 'htmlcode'))]],
      ['Show', [col(small('tog-status', 'Status bar', 'status'), small('tog-spell', 'Spelling', 'spell', 'Underline spelling mistakes as you type'))]],
      ['Panels', [col(small('panel-pages', 'Pages', 'pagesP'), small('panel-objects', 'Objects', 'layers'), small('panel-blocks', 'Blocks', 'blocks')), col(small('panel-quick', 'Quick styles', 'brush'), small('panel-style', 'Style', 'brush'))]],
      ['Theme', [col(small('ui-light', 'Light', 'sun'), small('ui-dark', 'Dark', 'moon'), small('ui-system', 'Like Windows', 'desktop'))]],
    ] },
    { id: 'developer', label: 'Developer', groups: [
      ['Code', [big('page-code', 'Page code', 'htmlcode', 'Edit the HTML and CSS of the page'), big('edit-html', 'Element HTML', 'edit', 'Edit the HTML of the selected element')]],
      ['Add-ons', [big('libraries', 'Libraries', 'lib', 'Bootstrap, Font Awesome, jQuery and more'), col(small('widgets', 'Widgets', 'widget'), small('page-script', 'Page script', 'script', 'Your own JavaScript for this page'))]],
      ['Compatibility', [big('compat', 'Mode', 'compat', 'Which HTML standard the saved page follows'), col({ label: '', compat: true }, small('compat-check', 'Check page', 'compat', 'List anything the chosen standard does not support'))]],
      ['Check', [big('a11y', 'Accessibility', 'a11y', 'Find missing descriptions, weak contrast and more'), big('preview-browser', 'Preview in browser', 'browser', 'Open the saved page in a new tab, with scripts running')]],
    ] },
    { id: 'table', label: 'Table', contextual: 'Table tools', groups: [
      ['Rows and columns', [col(small('row-above', 'Insert above', 'rowAbove'), small('row-below', 'Insert below', 'rowBelow')), col(small('col-left', 'Insert left', 'colLeft'), small('col-right', 'Insert right', 'colRight'))]],
      ['Delete', [col(small('del-row', 'Delete row', 'delRow'), small('del-col', 'Delete column', 'delCol'), small('del-table', 'Delete table', 'trash'))]],
      ['Merge', [col(small('merge-right', 'Merge right', 'mergeR', 'Join this cell with the one to its right'), small('merge-down', 'Merge down', 'mergeD', 'Join this cell with the one below'), small('split-cell', 'Split cell', 'split', 'Split a merged cell again'))]],
      ['Table style', [col(small('header-row', 'Heading row', 'headRow', 'Make the first row a heading row, or a normal row'), small('banded', 'Striped rows', 'banded')), col(small('borders-grid', 'Grid', 'bGrid'), small('borders-lines', 'Lines only', 'bLines'), small('borders-none', 'No borders', 'bNone'))]],
      ['New', [big('table-grid', 'Another table', 'table'), big('draw-table', 'Draw table', 'draw')]],
    ] },
  ];

  // ---- Building the ribbon ----
  const ribbon = document.getElementById('fmtbar'), tabsEl = document.getElementById('rb-tabs'), body = document.getElementById('rb-body');
  function button(it) {
    const b = mk('button', { className: it.big ? 'rb-big' : 'rb-small', type: 'button', title: it.title || it.label });
    b.dataset.act = it.act;
    b.innerHTML = svg(it.icon);
    b.append(it.big ? mk('span', { textContent: it.label }) : document.createTextNode(it.label));
    return b;
  }
  function selectEl(it) {
    const s = mk('select', { className: 'rb-sel', title: it.title || it.label, 'aria-label': it.title || it.label });
    (typeof it.options === 'function' ? it.options() : it.options).forEach(([v, l], i) => s.append(mk('option', { value: v, textContent: l, disabled: i === 0 })));
    s.value = '';
    s.addEventListener('change', () => { const v = s.value; s.value = ''; if (A[it.act]) A[it.act](s, v); });
    return s;
  }
  function item(it) {
    if (it.col) return mk('div', { className: 'rb-col' }, it.col.map(item));
    if (it.select) return selectEl(it);
    if (it.compat) return mk('span', { className: 'rb-small', style: 'cursor:default;font-weight:600', 'data-compat-label': '1', textContent: 'HTML5' });
    if (it.themes) return mk('div', { className: 'rb-styles' }, SC.THEMES.map((t) => mk('button', { className: 'rb-style', type: 'button', title: `${t.name} theme: colors and fonts for the whole page`, style: `background:${t.bg};color:${t.fg}`, onclick: () => SC.applyTheme(t) },
      mk('span', { style: `font-family:${t.hfont};font-weight:700;color:${t.head}`, textContent: 'Aa' }),
      mk('small', { style: `color:${t.link};font-weight:600`, textContent: t.name }))));
    return button(it);
  }
  const panels = { home: body.querySelector('[data-tab="home"]') };
  TABS.forEach((t) => {
    const p = mk('div', { className: 'rb-panel', role: 'tabpanel', 'aria-label': t.label, hidden: true });
    p.dataset.tab = t.id;
    t.groups.forEach(([label, items]) => p.append(mk('div', { className: 'rb-group', role: 'group', 'aria-label': label },
      mk('div', { className: 'rb-group-body' }, items.map(item)), mk('div', { className: 'rb-label', textContent: label }))));
    body.append(p);
    panels[t.id] = p;
  });
  const HUES = { home: '#2f5bea', insert: '#1e9e6a', design: '#d1408a', layout: '#e07a1f', view: '#138a9e', developer: '#7b4fd6', table: '#b0127a' };
  const tabDefs = [{ id: 'file', label: 'File', file: true }, { id: 'home', label: 'Home' }, ...TABS.map((t) => ({ id: t.id, label: t.label, contextual: t.contextual }))];
  const tabBtns = {};
  tabDefs.forEach((t) => {
    const b = mk('button', { className: 'rb-tab' + (t.file ? ' file' : '') + (t.contextual ? ' contextual' : ''), role: t.file ? 'button' : 'tab', type: 'button', title: t.file ? 'Open, save, templates and more' : '' });
    b.dataset.tab = t.id;
    if (t.contextual) { b.append(mk('small', { textContent: t.contextual }), t.label); b.hidden = true; } else b.textContent = t.label;
    b.style.setProperty('--tab-hue', HUES[t.id] || 'var(--accent)');
    b.addEventListener('click', () => (t.file ? SC.openBackstage() : selectTab(t.id, true)));
    b.addEventListener('dblclick', () => { if (!t.file) toggleCollapse(); });
    tabsEl.append(b); tabBtns[t.id] = b;
  });
  const collapseBtn = mk('button', { className: 'rb-collapse', type: 'button', title: 'Hide or show the ribbon buttons (double-click a tab does the same)', textContent: '⌃' });
  collapseBtn.addEventListener('click', toggleCollapse);
  tabsEl.append(collapseBtn);
  let current = 'home';
  function selectTab(id, user) {
    if (!panels[id]) id = 'home';
    current = id;
    Object.entries(panels).forEach(([k, p]) => { p.hidden = k !== id; });
    Object.entries(tabBtns).forEach(([k, b]) => b.setAttribute('aria-selected', k === id));
    if (user && ribbon.classList.contains('collapsed')) toggleCollapse();
    if (user && id !== 'table') { try { localStorage.setItem('sitecraft-tab', id); } catch (e) {} }
    SC.refreshSoon();
  }
  function toggleCollapse() {
    const c = ribbon.classList.toggle('collapsed');
    collapseBtn.textContent = c ? '⌄' : '⌃';
    try { localStorage.setItem('sitecraft-ribbon-collapsed', c ? '1' : ''); } catch (e) {}
  }
  try { if (localStorage.getItem('sitecraft-ribbon-collapsed')) toggleCollapse(); } catch (e) {}
  let start = 'home';
  try { start = localStorage.getItem('sitecraft-tab') || 'home'; } catch (e) {}
  selectTab(start);
  SC.selectTab = selectTab;

  // The Table tab appears while you work in a table, like a word processor's table tools.
  let wasInTable = false;
  SC.refreshHooks.push(() => {
    const inTable = !!SC.tableCtx();
    tabBtns.table.hidden = !inTable;
    if (inTable && !wasInTable && current !== 'table') tabBtns.table.classList.add('pulse');
    if (!inTable && current === 'table') selectTab('home');
    wasInTable = inTable;
    const d = SC.getDevice();
    [['dev-desktop', 'Desktop'], ['dev-tablet', 'Tablet'], ['dev-phone', 'Mobile']].forEach(([a, id]) => ribbon.querySelectorAll(`[data-act="${a}"]`).forEach((b) => b.setAttribute('aria-pressed', d === id)));
    ribbon.querySelectorAll('[data-act="rotate"]').forEach((b) => b.setAttribute('aria-pressed', SC.isSideways()));
    ribbon.querySelectorAll('[data-act="outlines"]').forEach((b) => b.setAttribute('aria-pressed', SC.outlineBtn.getAttribute('aria-pressed') === 'true'));
    ribbon.querySelectorAll('[data-act="tog-status"]').forEach((b) => b.setAttribute('aria-pressed', !!SC.getUi().statusbar));
    ribbon.querySelectorAll('[data-act="tog-spell"]').forEach((b) => b.setAttribute('aria-pressed', !!SC.getUi().spell));
    const th = SC.getTheme();
    [['ui-light', 'light'], ['ui-dark', 'dark'], ['ui-system', 'system']].forEach(([a, v]) => ribbon.querySelectorAll(`[data-act="${a}"]`).forEach((b) => b.setAttribute('aria-pressed', th === v)));
    SC.refreshCompat && SC.refreshCompat();
  });
  editor.on('change:device', SC.refreshSoon);

  // =====================================================================
  // One clean top line: the ribbon's tab row holds the brand, Undo / Redo and the Menus button on the
  // left, and the screen size, Preview, Code, Copy HTML and light / dark on the right. The old top bar
  // goes away; the file name and autosave status move to the status bar.
  // =====================================================================
  const $ = (id) => document.getElementById(id);
  const bar = document.querySelector('header.bar');
  const left = mk('div', { className: 'rb-quick rb-left' });
  const right = mk('div', { className: 'rb-quick rb-right' });
  // The SiteCraft logo is the one button for all the menus (like the round Office button).
  const menusBtn = mk('button', { className: 'rb-logo', type: 'button', title: 'SiteCraft menus: File, Edit, View, Insert, Format, Table and Help (F10)', 'aria-label': 'SiteCraft menus', 'aria-haspopup': 'true' });
  menusBtn.innerHTML = `<svg viewBox="0 0 40 40" aria-hidden="true">
    <defs><linearGradient id="sc-logo-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2f5bea"/><stop offset=".55" stop-color="#7b4fd6"/><stop offset="1" stop-color="#d1408a"/></linearGradient></defs>
    <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#sc-logo-g)"/>
    <rect x="8" y="10" width="24" height="19" rx="3.5" fill="none" stroke="#fff" stroke-width="2.4"/>
    <path d="M8 15.5h24" stroke="#fff" stroke-width="2.4"/>
    <circle cx="11.6" cy="12.8" r="1.1" fill="#fff"/><circle cx="15" cy="12.8" r="1.1" fill="#fff"/>
    <path d="M13 20.5h8M13 24.5h5" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M27.5 19.5l1.2 2.8 2.8 1.2-2.8 1.2-1.2 2.8-1.2-2.8-2.8-1.2 2.8-1.2Z" fill="#ffe066"/>
  </svg>`;
  // Look everything up before moving it (moved elements are not in the page until the row is added).
  const [tl, tr, undo, redo, prev, code, copy, theme] = ['toggle-left', 'toggle-right', 'undo', 'redo', 'preview', 'code', 'copy', 'theme-btn'].map($);
  [undo, redo, prev, code].forEach((b) => b.classList.add('rb-qbtn'));
  left.append(tl, menusBtn);
  document.querySelector('.brand').hidden = true;
  right.append(undo, redo, mk('span', { className: 'rb-qsep' }), document.querySelector('.devpick'), prev, code, copy, theme, tr);
  tabsEl.prepend(left);
  tabsEl.insertBefore(right, collapseBtn);
  $('outline').hidden = true;                       // View › Outlines does this now
  const docinfo = document.querySelector('.docinfo');
  document.getElementById('statusbar').prepend(docinfo, mk('span', { className: 'sb-sep' }));
  bar.hidden = true;
  document.querySelector('.app').classList.add('no-topbar');

  // The Menus button opens all the classic menus side by side.
  let mega = null;
  function closeMega() { if (!mega) return; mega.remove(); mega = null; menusBtn.setAttribute('aria-expanded', 'false'); }
  function openMega() {
    if (mega) { closeMega(); return; }
    SC.closePop();
    mega = SC.keepEditing(mk('div', { className: 'mega', role: 'menu', 'aria-label': 'All menus' }));
    SC.menus.forEach(([name, items]) => {
      const list = SC.buildList(items);
      mega.append(mk('div', { className: 'mega-col' }, mk('h4', { textContent: name }), list));
    });
    document.body.append(mega);
    const r = menusBtn.getBoundingClientRect();
    mega.style.top = (r.bottom + 6) + 'px';
    mega.style.left = Math.max(8, Math.min(r.left, innerWidth - mega.offsetWidth - 8)) + 'px';
    menusBtn.setAttribute('aria-expanded', 'true');
    mega.addEventListener('click', (e) => { if (e.target.closest('.menu-item')) closeMega(); });
    mega.querySelector('.menu-item:not(:disabled)')?.focus();
  }
  menusBtn.addEventListener('mousedown', (e) => e.preventDefault());
  menusBtn.addEventListener('click', openMega);
  document.addEventListener('mousedown', (e) => { if (mega && !mega.contains(e.target) && !menusBtn.contains(e.target)) closeMega(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mega) { closeMega(); menusBtn.focus(); }
    if (e.key === 'F10' || (e.altKey && e.key === 'm')) { e.preventDefault(); openMega(); }
  });
  editor.on('canvas:frame:load', ({ window: w }) => w.document.addEventListener('mousedown', closeMega));
  window.addEventListener('blur', closeMega);

  // =====================================================================
  // Title bar at the very top (Office style): logo menu and quick buttons, file name and save state,
  // command search (Alt+Q), and small info. The tab row below keeps only the tabs and page tools.
  // =====================================================================
  if (!window.CraftTitlebar) return;
  [undo, redo].forEach((b) => { b.hidden = true; });
  right.querySelector('.rb-qsep')?.remove();
  document.head.append(mk('style', { textContent: '.app.no-topbar.has-ctb { grid-template-rows: auto auto 1fr auto; } .statusbar .docinfo, .statusbar .docinfo + .sb-sep { display: none !important; } .ctb .rb-logo { width: 32px; height: 32px; border-radius: 9px; box-shadow: 0 0 0 1.5px rgba(255,255,255,.55); } .ctb .rb-logo svg { width: 32px; height: 32px; } .rb-left { display: none; }' }));
  const devSel = document.getElementById('device-sel');
  const menuCommands = () => SC.menus.flatMap(([name, items]) => items.filter((it) => it && it !== '-' && !it.heading && it.run)
    .map((it) => ({ label: typeof it.label === 'function' ? it.label() : it.label, path: name + ' menu', key: it.key, run: it.run, disabled: it.disabled })));
  const ribbonCommands = () => [...ribbon.querySelectorAll('.rb-panel [data-act]')].map((b) => {
    const panel = b.closest('.rb-panel'), group = b.closest('.rb-group');
    const text = (b.textContent || '').trim();
    const label = (text.length > 3 ? text : '') || b.getAttribute('aria-label') || (b.getAttribute('title') || '').replace(/\s*\(.*\)$/, '') || text;
    const tab = (tabDefs.find((t) => t.id === panel.dataset.tab) || {}).label || '';
    return label && A[b.dataset.act] ? { label, path: `${tab} tab › ${group ? group.getAttribute('aria-label') : ''}`, words: b.getAttribute('title') || '', run: () => { selectTab(panel.dataset.tab, true); A[b.dataset.act](b); } } : null;
  });
  const tb = window.CraftTitlebar({
    appName: 'SiteCraft', storageKey: 'sitecraft', colors: ['#2f5bea', '#7b4fd6'],
    mount: document.querySelector('.app'), toast,
    leftEls: [menusBtn],
    quick: [
      { icon: 'save', title: 'Save', key: 'Ctrl+S', run: () => SC.save(false) },
      { icon: 'undo', title: 'Undo', key: 'Ctrl+Z', run: () => editor.UndoManager.undo(), disabled: () => !editor.UndoManager.hasUndo() },
      { icon: 'redo', title: 'Redo', key: 'Ctrl+Shift+Z', run: () => editor.UndoManager.redo(), disabled: () => !editor.UndoManager.hasRedo() },
      { icon: 'preview', title: 'Preview in browser', run: () => A['preview-browser']() },
      { icon: 'print', title: 'Print', key: 'Ctrl+P', run: SC.printPage },
    ],
    getTitle: () => SC.getDocName(),
    getStatus: () => (document.getElementById('docname').classList.contains('dirty') ? { text: 'Unsaved changes', dirty: true } : { text: document.getElementById('status').textContent }),
    getInfo: () => [
      { text: `${editor.Pages.getAll().length} page${editor.Pages.getAll().length === 1 ? '' : 's'}`, title: 'Pages in this site (opens the Pages panel)', run: () => SC.showTab('tab-pages') },
      { text: devSel.value === 'Desktop' ? 'Computer' : ((devSel.options[devSel.selectedIndex] || {}).text || '').replace(/\s\d+ × \d+$/, ''), title: 'Screen size being previewed', run: () => { devSel.focus(); try { devSel.showPicker(); } catch (e) {} } },
      { text: (SC.DOCTYPES[SC.settings.doctype] || SC.DOCTYPES.html5).label.replace(/ \(.*\)/, ''), title: 'HTML standard (click to change)', run: () => A.compat() },
    ],
    rightEls: [theme],
    onHelp: () => (SC.menus.find(([n]) => n === 'Help')[1].find((it) => it.label === 'Getting started') || {}).run?.(),
    getCommands: () => [...menuCommands(), ...ribbonCommands()],
  });
  document.querySelector('.app').classList.add('has-ctb');
  editor.on('canvas:frame:load', ({ window: w }) => tb.listenTo(w.document));
  if (SC.fdoc()) tb.listenTo(SC.fdoc());
})();
