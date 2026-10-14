/* SiteCraft Quick styles: click any object to see what it is, its classes, handy actions and a gallery of
   ready-made looks for that kind of object. Hover a look to preview it on the page; click to keep it.
   Uses window.SC, which the main script sets up. */
(function () {
  'use strict';
  const SC = window.SC;
  const { editor, mk, toast, dialog, field } = SC;
  const A = SC.actions;

  // ---- The panel lives in a new first tab on the right ----
  const tabs = document.querySelector('#right .tabs');
  const tabBtn = mk('button', { className: 'tab', role: 'tab', id: 'tab-quick', textContent: 'Quick styles' });
  tabBtn.setAttribute('aria-selected', 'false'); tabBtn.dataset.pane = 'pane-quick';
  tabs.prepend(tabBtn);
  const pane = mk('div', { className: 'pane', id: 'pane-quick', hidden: true });
  document.getElementById('pane-style').before(pane);
  setTimeout(() => tabBtn.click(), 0);   // the friendliest panel opens first

  const style = mk('style', { textContent: `
    .qs { padding: 12px; display: grid; gap: 12px; }
    .qs-head { display: grid; gap: 4px; padding: 12px; border-radius: 10px; background: var(--panel-2); border: 1px solid var(--line); }
    .qs-kind { display: flex; align-items: center; gap: 8px; font-family: var(--font-display); font-size: 16px; font-weight: 700; }
    .qs-kind i { font-style: normal; font-size: 18px; }
    .qs-meta { font-family: var(--font-mono); font-size: 11px; color: var(--muted); word-break: break-all; }
    .qs-classes { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
    .qs-chip { display: inline-flex; align-items: center; gap: 4px; padding: 2px 4px 2px 8px; border-radius: 999px; background: var(--accent); color: var(--accent-ink); font-size: 11.5px; font-family: var(--font-mono); }
    .qs-chip button { border: 0; background: transparent; color: inherit; cursor: pointer; font-size: 13px; line-height: 1; padding: 0 4px; }
    .qs-add { width: 110px; height: 24px; border: 1px dashed var(--line); border-radius: 999px; background: transparent; color: var(--fg); padding: 0 10px; font: inherit; font-size: 11.5px; }
    .qs h4 { margin: 4px 0 0; font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); }
    .qs-actions { display: flex; flex-wrap: wrap; gap: 6px; }
    .qs-actions .btn { border: 1px solid var(--line); height: 28px; font-size: 12px; }
    .qs-vars { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .qs-var { display: grid; gap: 6px; justify-items: center; padding: 10px 6px 8px; border: 1px solid var(--line); border-radius: 10px; background: var(--panel-2); cursor: pointer; color: var(--fg); font: inherit; font-size: 11.5px; transition: transform .12s, border-color .12s; }
    .qs-var:hover, .qs-var:focus-visible { border-color: var(--accent); transform: translateY(-1px); }
    .qs-sample { display: grid; place-items: center; width: 100%; height: 54px; overflow: hidden; border-radius: 6px; background: #fff; color: #1d2330; font-family: Arial, sans-serif; font-size: 13px; }
    .qs-accents { display: flex; gap: 5px; flex-wrap: wrap; }
    .qs-accents button { width: 22px; height: 22px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; padding: 0; }
    .qs-accents button[aria-pressed="true"] { border-color: var(--fg); }
    .qs-empty { padding: 24px 14px; color: var(--muted); line-height: 1.5; text-align: center; }
    .qs-empty b { display: block; font-size: 30px; margin-bottom: 6px; }
  ` });
  document.head.append(style);

  // ---- What kind of object is it? ----
  function kindOf(c) {
    const tag = (c.get('tagName') || '').toLowerCase(), type = c.get('type'), attrs = c.getAttributes();
    if (c === editor.getWrapper()) return ['page', 'The page', '📄'];
    if (c.getClasses().includes('sc-hotspots')) return ['hotspots', 'Picture with hotspots', '🎯'];
    if (tag === 'img' || type === 'image') return ['image', 'Picture', '🖼️'];
    if (tag === 'button' || (tag === 'input' && ['submit', 'button'].includes(attrs.type))) return ['button', 'Button', '🔘'];
    if (tag === 'a') {
      const cs = SC.fwin().getComputedStyle(c.view.el);
      const looksLikeButton = (cs.backgroundColor && !/rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor)) || parseFloat(cs.paddingLeft) > 6 || /btn|button|cta|pill/i.test(c.getClasses().join(' '));
      return looksLikeButton ? ['button', 'Button link', '🔘'] : ['link', 'Link', '🔗'];
    }
    if (/^h[1-6]$/.test(tag)) return ['heading', 'Heading ' + tag[1], '🔠'];
    if (tag === 'ul' || tag === 'ol') return ['list', tag === 'ul' ? 'Bulleted list' : 'Numbered list', '📋'];
    if (tag === 'table') return ['table', 'Table', '▦'];
    if (tag === 'td' || tag === 'th') return ['cell', 'Table cell', '▦'];
    if (['input', 'textarea', 'select'].includes(tag)) return ['field', 'Form field', '⌨️'];
    if (['video', 'iframe'].includes(tag) || type === 'video' || type === 'map') return ['media', 'Video or embed', '🎬'];
    if (tag === 'nav') return ['nav', 'Menu', '🧭'];
    if (['section', 'header', 'footer', 'main', 'article', 'aside', 'div', 'form', 'details', 'figure', 'blockquote'].includes(tag) && !SC.texty(c)) return ['box', { section: 'Section', header: 'Header', footer: 'Footer', main: 'Main area', article: 'Article', aside: 'Side box', div: 'Box', form: 'Form', details: 'Collapsible', figure: 'Picture with caption', blockquote: 'Quote' }[tag], '▢'];
    if (SC.texty(c)) return ['text', { p: 'Paragraph', blockquote: 'Quote', pre: 'Code block', span: 'Text', li: 'List item', summary: 'Collapsible title' }[tag] || 'Text', '✍️'];
    return ['other', c.getName(), '◇'];
  }

  // ---- Ready-made looks. ACC is replaced by the chosen accent color. ----
  const ACCENTS = ['#2f5bea', '#7b4fd6', '#d1408a', '#e4572e', '#e09f1f', '#1e9e6a', '#138a9e', '#1d2330'];
  let accent = ACCENTS[0];
  const soft = (hex) => hex + '22';
  const BTN = { display: 'inline-block', 'text-decoration': 'none', 'font-weight': '700', 'line-height': '1.2', cursor: 'pointer', 'box-shadow': 'none', 'background-image': 'none' };
  const LOOKS = {
    button: [
      ['Solid', { ...BTN, 'background-color': 'ACC', color: '#ffffff', border: '0', 'border-radius': '8px', padding: '12px 22px' }],
      ['Pill', { ...BTN, 'background-color': 'ACC', color: '#ffffff', border: '0', 'border-radius': '999px', padding: '12px 26px' }],
      ['Outline', { ...BTN, 'background-color': 'transparent', color: 'ACC', border: '2px solid ACC', 'border-radius': '8px', padding: '10px 20px' }],
      ['Soft', { ...BTN, 'background-color': 'SOFT', color: 'ACC', border: '0', 'border-radius': '10px', padding: '12px 22px' }],
      ['Gradient', { ...BTN, 'background-color': 'ACC', 'background-image': 'linear-gradient(135deg, ACC, #d1408a)', color: '#ffffff', border: '0', 'border-radius': '999px', padding: '13px 26px' }],
      ['Raised', { ...BTN, 'background-color': 'ACC', color: '#ffffff', border: '0', 'border-radius': '10px', padding: '12px 22px', 'box-shadow': '0 5px 0 rgba(0,0,0,.25)' }],
      ['Dark', { ...BTN, 'background-color': '#1d2330', color: '#ffffff', border: '0', 'border-radius': '6px', padding: '12px 22px' }],
      ['Text link', { ...BTN, 'background-color': 'transparent', color: 'ACC', border: '0', padding: '0', 'text-decoration': 'underline', 'font-weight': '600' }],
      ['Bigger', { 'font-size': '19px', padding: '16px 32px' }],
      ['Smaller', { 'font-size': '13px', padding: '7px 14px' }],
      ['Full width', { display: 'block', width: '100%', 'text-align': 'center', 'box-sizing': 'border-box' }],
    ],
    image: [
      ['Square', { 'border-radius': '0', 'box-shadow': 'none', border: '0', filter: 'none' }],
      ['Rounded', { 'border-radius': '14px' }],
      ['Circle', { 'border-radius': '50%', 'aspect-ratio': '1 / 1', 'object-fit': 'cover' }],
      ['Shadow', { 'border-radius': '10px', 'box-shadow': '0 12px 30px rgba(0,0,0,.25)' }],
      ['Photo print', { border: '10px solid #ffffff', 'box-shadow': '0 6px 18px rgba(0,0,0,.22)', 'border-radius': '2px' }],
      ['Frame', { border: '3px solid ACC', padding: '4px', 'border-radius': '6px' }],
      ['Black and white', { filter: 'grayscale(1)' }],
      ['Old photo', { filter: 'sepia(.7)' }],
      ['Full width', { width: '100%', 'max-width': '100%', display: 'block' }],
      ['Thumbnail', { width: '160px', 'max-width': '100%' }],
    ],
    heading: [
      ['Plain', { 'text-transform': 'none', 'letter-spacing': 'normal', 'border-bottom': '0', 'background-image': 'none', '-webkit-text-fill-color': 'initial' }],
      ['Accent color', { color: 'ACC' }],
      ['Underlined', { display: 'inline-block', 'border-bottom': '4px solid ACC', 'padding-bottom': '4px' }],
      ['Highlighter', { display: 'inline', 'background-image': 'linear-gradient(transparent 58%, SOFT 58%)' }],
      ['Spaced capitals', { 'text-transform': 'uppercase', 'letter-spacing': '.12em', 'font-size': '0.9em' }],
      ['Gradient', { 'background-image': 'linear-gradient(90deg, ACC, #d1408a)', '-webkit-background-clip': 'text', 'background-clip': 'text', '-webkit-text-fill-color': 'transparent' }],
      ['Light and large', { 'font-weight': '300', 'font-size': '1.3em', 'line-height': '1.15' }],
      ['Centered', { 'text-align': 'center' }],
    ],
    text: [
      ['Normal', { 'font-size': '16px', 'line-height': '1.6', color: 'inherit', 'background-color': 'transparent', border: '0', padding: '0' }],
      ['Intro text', { 'font-size': '20px', 'line-height': '1.6' }],
      ['Fine print', { 'font-size': '13px', color: '#6b7280' }],
      ['Small label', { 'text-transform': 'uppercase', 'letter-spacing': '.12em', 'font-size': '12px', 'font-weight': '700', color: 'ACC' }],
      ['Note box', { 'background-color': 'SOFT', 'border-left': '4px solid ACC', padding: '12px 16px', 'border-radius': '4px' }],
      ['Warning box', { 'background-color': '#fff7db', 'border-left': '4px solid #e0a800', padding: '12px 16px', 'border-radius': '4px' }],
      ['Quote', { 'font-style': 'italic', 'border-left': '4px solid ACC', 'padding-left': '16px', 'font-size': '19px' }],
      ['Two columns', { 'column-count': '2', 'column-gap': '32px' }],
    ],
    box: [
      ['Plain', { 'background-color': 'transparent', 'background-image': 'none', color: 'inherit', 'box-shadow': 'none', border: '0', 'border-radius': '0' }],
      ['Light band', { 'background-color': '#f5f6f8', padding: '48px 6%' }],
      ['Accent band', { 'background-color': 'ACC', color: '#ffffff', padding: '48px 6%' }],
      ['Dark band', { 'background-color': '#1d2330', color: '#f3f4f6', padding: '48px 6%' }],
      ['Gradient', { 'background-image': 'linear-gradient(135deg, SOFT, #fdf2f8)', padding: '48px 6%' }],
      ['Card', { 'background-color': '#ffffff', border: '1px solid #e5e7eb', 'border-radius': '14px', padding: '24px', 'box-shadow': '0 8px 24px rgba(0,0,0,.08)' }],
      ['Rounded panel', { 'background-color': 'SOFT', 'border-radius': '18px', padding: '28px' }],
      ['Narrow center', { 'max-width': '760px', 'margin-left': 'auto', 'margin-right': 'auto' }],
      ['Centered text', { 'text-align': 'center' }],
    ],
    list: [
      ['Bullets', { 'list-style-type': 'disc', 'padding-left': '24px', display: 'block' }],
      ['Ticks', { 'list-style-type': '"✓  "', 'padding-left': '24px' }],
      ['Arrows', { 'list-style-type': '"→  "', 'padding-left': '24px' }],
      ['Stars', { 'list-style-type': '"★  "', 'padding-left': '24px' }],
      ['No bullets', { 'list-style-type': 'none', 'padding-left': '0' }],
      ['Roomy', { 'line-height': '2' }],
      ['In a row', { display: 'flex', 'flex-wrap': 'wrap', gap: '18px', 'list-style-type': 'none', 'padding-left': '0' }],
    ],
    link: [
      ['Underlined', { 'text-decoration': 'underline', color: 'ACC' }],
      ['No underline', { 'text-decoration': 'none', color: 'ACC', 'font-weight': '600' }],
      ['Dotted', { 'text-decoration': 'underline dotted', color: 'ACC' }],
      ['Highlighted', { 'text-decoration': 'none', 'background-color': 'SOFT', padding: '1px 4px', 'border-radius': '4px', color: 'ACC' }],
    ],
    field: [
      ['Box', { border: '1px solid #cbd5e1', 'border-radius': '8px', padding: '10px 12px', 'background-color': '#ffffff' }],
      ['Underline', { border: '0', 'border-bottom': '2px solid ACC', 'border-radius': '0', padding: '8px 2px', 'background-color': 'transparent' }],
      ['Pill', { border: '1px solid #cbd5e1', 'border-radius': '999px', padding: '10px 16px' }],
      ['Filled', { border: '0', 'background-color': '#f1f3f6', 'border-radius': '8px', padding: '11px 13px' }],
      ['Full width', { width: '100%', 'box-sizing': 'border-box' }],
    ],
    nav: [
      ['Plain links', { display: 'flex', gap: '20px', 'background-color': 'transparent', padding: '12px 0' }],
      ['Bar', { display: 'flex', gap: '22px', 'background-color': '#1d2330', padding: '14px 6%' }],
      ['Accent bar', { display: 'flex', gap: '22px', 'background-color': 'ACC', padding: '14px 6%' }],
      ['Centered', { display: 'flex', gap: '22px', 'justify-content': 'center' }],
      ['Stacked', { display: 'flex', 'flex-direction': 'column', gap: '8px' }],
    ],
    table: [['Grid borders', 'borders-grid'], ['Lines only', 'borders-lines'], ['No borders', 'borders-none'], ['Striped rows', 'banded'], ['Heading row', 'header-row']],
  };
  LOOKS.cell = LOOKS.table;
  LOOKS.media = [['Rounded', { 'border-radius': '12px', overflow: 'hidden' }], ['Shadow', { 'box-shadow': '0 12px 30px rgba(0,0,0,.25)' }], ['Full width', { width: '100%' }], ['Tall', { height: '480px' }], ['Short', { height: '240px' }]];
  LOOKS.other = [['Rounded', { 'border-radius': '12px' }], ['Shadow', { 'box-shadow': '0 8px 24px rgba(0,0,0,.15)' }], ['Border', { border: '1px solid #d5d9e1' }], ['Roomy', { padding: '24px' }]];
  LOOKS.page = [];
  LOOKS.hotspots = LOOKS.media;

  const fill = (style) => {
    const out = {};
    Object.entries(style).forEach(([k, v]) => { out[k] = String(v).replace(/SOFT/g, soft(accent)).replace(/ACC/g, accent); });
    return out;
  };
  const cssText = (style) => Object.entries(style).map(([k, v]) => `${k}:${v}`).join(';');

  // Hovering shows the look straight on the page element (nothing is saved until you click).
  let preview = null;
  function startPreview(c, style) {
    endPreview();
    const el = c.view && c.view.el; if (!el) return;
    preview = { el, saved: el.getAttribute('style') };
    el.setAttribute('style', (preview.saved ? preview.saved + ';' : '') + cssText(style) + ';transition:all .15s');
  }
  function endPreview() {
    if (!preview) return;
    if (preview.saved == null) preview.el.removeAttribute('style'); else preview.el.setAttribute('style', preview.saved);
    preview = null;
  }

  function sample(kind, name, style) {
    const s = cssText(style);
    if (kind === 'button') return `<span style="${s};font-size:12px;max-width:90%;white-space:nowrap">Button</span>`;
    if (kind === 'image') return `<span style="display:block;width:42px;height:42px;background:linear-gradient(135deg,#9db4ff,#f6a5c0);${s};width:42px;max-width:42px;height:42px"></span>`;
    if (kind === 'heading') return `<span style="font-weight:700;font-size:15px;${s};font-size:15px">Heading</span>`;
    if (kind === 'text' || kind === 'link') return `<span style="${s};font-size:12px;line-height:1.3;max-width:90%;column-count:auto">${kind === 'link' ? 'a link' : 'Some text'}</span>`;
    if (kind === 'box') return `<span style="display:block;width:86%;height:38px;${s};padding:4px 6px;font-size:10px;margin:0">Box</span>`;
    if (kind === 'list') return `<ul style="margin:0;font-size:11px;line-height:1.3;${s};line-height:1.3"><li>One</li><li>Two</li></ul>`;
    if (kind === 'field') return `<span style="display:block;width:80%;height:24px;${s};padding:4px 8px;font-size:11px;color:#999">Type here</span>`;
    if (kind === 'nav') return `<span style="${s};padding:6px;gap:6px;font-size:10px;color:${/1d2330|ACC/.test(JSON.stringify(style)) ? '#fff' : '#1d2330'}">Home About Shop</span>`;
    return `<span style="display:block;width:70%;height:30px;background:#eef0f4;${s}"></span>`;
  }

  // ---- Drawing the panel ----
  function render() {
    endPreview();
    const c = editor.getSelected();
    pane.textContent = '';
    if (!c) {
      pane.append(mk('div', { className: 'qs-empty' }, mk('b', { textContent: '👆' }), 'Click anything on the page to see what it is, and to try ready-made looks for it.'));
      return;
    }
    const [kind, label, icon] = kindOf(c);
    const attrs = c.getAttributes(), tag = (c.get('tagName') || 'div').toLowerCase();
    const classes = mk('div', { className: 'qs-classes' });
    c.getClasses().forEach((cl) => classes.append(mk('span', { className: 'qs-chip', title: 'A class: a named style several elements can share' }, cl,
      mk('button', { type: 'button', title: `Remove the class ${cl}`, 'aria-label': `Remove the class ${cl}`, textContent: '×', onclick: () => { c.removeClass(cl); render(); } }))));
    const add = mk('input', { className: 'qs-add', placeholder: '+ add class', 'aria-label': 'Add a class' });
    add.addEventListener('keydown', (e) => { if (e.key === 'Enter' && add.value.trim()) { add.value.trim().split(/\s+/).forEach((x) => c.addClass(x.replace(/[^\w-]/g, ''))); render(); } });
    classes.append(add);
    pane.append(mk('div', { className: 'qs' },
      mk('div', { className: 'qs-head' },
        mk('div', { className: 'qs-kind' }, mk('i', { textContent: icon }), label),
        mk('div', { className: 'qs-meta', textContent: `<${tag}>` + (attrs.id ? `  #${attrs.id}` : '') + (attrs.href ? `  → ${attrs.href}` : '') }),
        classes),
      actionsFor(kind, c),
      SC.isShape && SC.isShape(c) ? shapeFor(c) : null,
      SC.isCurve && SC.isCurve(c) ? curveFor(c) : null,
      kind === 'page' || (SC.isShape && SC.isShape(c)) || (SC.isCurve && SC.isCurve(c)) ? null : boxFor(c),
      kind === 'page' || (SC.isCurve && SC.isCurve(c)) ? null : rotateFor(c),
      kind === 'page' ? null : opacityFor(c),
      kind === 'page' ? null : shadowFor(c),
      looksFor(kind, c)));
  }
  // Small form pieces for the panels below.
  const row = (...kids) => mk('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:6px;align-items:end' }, ...kids);
  const lab = (text, input) => mk('label', { style: 'display:grid;gap:3px;font-size:12px;color:var(--muted)' }, mk('span', {}, text), input);
  const colorIn = (value, on) => { const i = mk('input', { type: 'color', value: /^#[0-9a-f]{6}$/i.test(value || '') ? value : '#ffffff', style: 'width:100%;height:28px' }); i.addEventListener('change', () => on(i.value)); return i; };
  const numIn = (value, on, step = 1) => { const i = mk('input', { type: 'number', value: String(value), step: String(step), min: '0', className: 'qs-add', style: 'width:100%' }); i.addEventListener('change', () => on(+i.value || 0)); return i; };
  const rangeIn = (value, max, on, fmt) => { const v = mk('b', { textContent: fmt(value) }); const r = mk('input', { type: 'range', min: '0', max: String(max), step: '1', value: String(value), style: 'width:100%' }); r.addEventListener('input', () => { v.textContent = fmt(+r.value); on(+r.value); }); return [v, r]; };
  // Shapes: which shape, corners, fill and outline (the words inside are edited like any text).
  function shapeFor(c) {
    const s = SC.readShape(c), set = (patch) => { SC.setShape(c, patch); render(); };
    const type = mk('select', { className: 'qs-add', style: 'width:100%' }, ...SC.SHAPES.filter(([t]) => t !== 'line').map(([v, n]) => mk('option', { value: v, textContent: n, selected: v === s.type })));
    type.addEventListener('change', () => set({ type: type.value }));
    const [rv, rr] = rangeIn(s.round, 100, (v) => SC.setShape(c, { round: v }), (v) => (v ? v + '%' : 'sharp'));
    const noFill = mk('input', { type: 'checkbox', checked: !s.fill }); noFill.addEventListener('change', () => set({ fill: noFill.checked ? '' : '#f5c518' }));
    return mk('div', {}, mk('h4', { textContent: 'Shape' }),
      lab('Shape', type),
      s.type === 'ellipse' ? null : mk('label', { style: 'display:grid;gap:3px;font-size:12px;color:var(--muted)' }, mk('span', {}, 'Corners, sharp to round: ', rv), rr),
      s.type === 'star' ? lab('Star points', numIn(s.points, (v) => set({ points: Math.max(3, Math.min(24, v)) }))) : null,
      row(lab('Fill', colorIn(s.fill, (v) => set({ fill: v }))), mk('label', { style: 'font-size:12px' }, noFill, ' No fill')),
      row(lab('Outline', colorIn(s.stroke, (v) => set({ stroke: v }))), lab('Outline width (px)', numIn(s.sw, (v) => set({ sw: v })))),
      mk('p', { style: 'font-size:11.5px;color:var(--muted);margin:4px 0 0', textContent: 'Double-click the shape to type the words inside; format them with the text bar.' }));
  }
  // Box look for any element (a text box is a box with words): background, border, corners and padding.
  function boxFor(c) {
    const st = c.getStyle() || {}, el = c.getEl(), size = el ? Math.min(el.offsetWidth, el.offsetHeight) : 100;
    const bw = parseFloat(st['border-width'] || (st.border || '').split(' ')[0]) || 0;
    const bc = st['border-color'] || ((st.border || '').match(/#[0-9a-f]{6}/i) || [])[0] || '#555555';
    const bs = st['border-style'] || ((st.border || '').match(/dashed|dotted/) || ['solid'])[0];
    const radius = parseFloat(st['border-radius']) || 0, pct = Math.min(100, Math.round((radius / Math.max(1, size / 2)) * 100));
    const border = (w, col, style) => { c.removeStyle('border'); if (w) c.addStyle({ 'border-width': w + 'px', 'border-style': style, 'border-color': col }); else { c.removeStyle('border-width'); c.removeStyle('border-style'); c.removeStyle('border-color'); } };
    const [rv, rr] = rangeIn(pct, 100, (v) => { if (v) c.addStyle({ 'border-radius': Math.round((v / 100) * (size / 2)) + 'px' }); else c.removeStyle('border-radius'); }, (v) => (v ? v + '%' : 'sharp'));
    const noBg = mk('input', { type: 'checkbox', checked: !st['background-color'] }); noBg.addEventListener('change', () => { if (noBg.checked) c.removeStyle('background-color'); else c.addStyle({ 'background-color': '#ffffff' }); render(); });
    const style = mk('select', { className: 'qs-add', style: 'width:100%' }, ...[['solid', 'Solid'], ['dashed', 'Dashed'], ['dotted', 'Dotted']].map(([v, n]) => mk('option', { value: v, textContent: n, selected: v === bs })));
    style.addEventListener('change', () => border(bw || 1, bc, style.value));
    return mk('div', {}, mk('h4', { textContent: 'Box look' }),
      row(lab('Background', colorIn(st['background-color'], (v) => { c.addStyle({ 'background-color': v }); render(); })), mk('label', { style: 'font-size:12px' }, noBg, ' None')),
      row(lab('Border width (px)', numIn(bw, (v) => { border(v, bc, bs); render(); })), lab('Border colour', colorIn(bc, (v) => { border(bw || 1, v, bs); render(); }))),
      row(lab('Border style', style), lab('Padding (px)', numIn(parseFloat(st.padding) || 0, (v) => { if (v) c.addStyle({ padding: v + 'px' }); else c.removeStyle('padding'); }))),
      mk('label', { style: 'display:grid;gap:3px;font-size:12px;color:var(--muted)' }, mk('span', {}, 'Corners, sharp to round: ', rv), rr));
  }
  // Curved text: the words, which way it curves, the circle, rotation, spread and the letters.
  function curveFor(c) {
    const m = SC.readCurve(c) || {}, set = (patch) => { const n = SC.setCurve(c, patch); if (n) render(); };
    const words = mk('input', { className: 'qs-add', value: m.text || '', style: 'width:100%' }); words.addEventListener('change', () => set({ text: words.value.trim() || ' ' }));
    const seg = mk('div', { style: 'display:flex;gap:6px' }, ...[['up', '◠ Curve up'], ['down', '◡ Curve down']].map(([d, n]) => mk('button', { type: 'button', className: 'btn' + ((m.dir || 'up') === d ? ' primary' : ''), textContent: n, onclick: () => set({ dir: d }) })));
    const slider = (label, key, min, max, fmt) => { const [v, r] = rangeIn(m[key] || 0, max, () => {}, fmt); r.min = String(min); r.value = String(m[key] || 0); r.addEventListener('change', () => set({ [key]: +r.value })); return mk('label', { style: 'display:grid;gap:3px;font-size:12px;color:var(--muted)' }, mk('span', {}, label + ': ', v), r); };
    const font = mk('select', { className: 'qs-add', style: 'width:100%' }, ...SC.CURVE_FONTS.map((f) => mk('option', { value: f, textContent: f, selected: f === m.font })));
    font.addEventListener('change', () => set({ font: font.value }));
    const ang = numIn(m.rot || 0, (v) => set({ rot: ((v + 180) % 360 + 360) % 360 - 180 })); ang.min = '-180'; ang.max = '180';
    return mk('div', {}, mk('h4', { textContent: 'Curved text' }),
      lab('Words (press Enter to apply)', words), mk('button', { type: 'button', className: 'btn', textContent: 'Edit words…', onclick: () => SC.curveDialog(m, (r) => set(r)) }),
      seg,
      slider('Size of the circle', 'r', 30, 500, (v) => v + 'px'),
      slider('Rotation', 'rot', -180, 180, (v) => v + '°'), lab('Rotation angle (°)', ang),
      slider('Spread around the circle', 'span', 0, 360, (v) => (v ? v + '°' : 'natural')),
      row(lab('Font', font), lab('Size (px)', numIn(m.size || 28, (v) => set({ size: Math.max(6, v) })))),
      row(lab('Colour', colorIn(m.color, (v) => set({ color: v }))), mk('div', { style: 'display:flex;gap:4px' },
        mk('button', { type: 'button', className: 'btn' + (m.bold ? ' primary' : ''), innerHTML: '<b>B</b>', title: 'Bold', onclick: () => set({ bold: !m.bold }) }),
        mk('button', { type: 'button', className: 'btn' + (m.italic ? ' primary' : ''), innerHTML: '<i>I</i>', title: 'Italic', onclick: () => set({ italic: !m.italic }) }))),
      slider('Letter spacing', 'spacing', -100, 600, (v) => String(v)));
  }
  // Rotation for any element: an angle in degrees (CSS transform).
  function rotateFor(c) {
    const cur = parseFloat(((c.getStyle() || {}).transform || '').replace(/^rotate\(/, '')) || 0;
    const apply = (v) => { v = ((v + 180) % 360 + 360) % 360 - 180; if (v) c.addStyle({ transform: `rotate(${v}deg)` }); else c.removeStyle('transform'); };
    const [v, r] = rangeIn(cur, 180, (x) => { apply(x); n.value = String(x); }, (x) => x + '°'); r.min = '-180'; r.value = String(cur);
    const n = numIn(cur, (x) => { apply(x); render(); }); n.min = '-180'; n.max = '180';
    return mk('div', {}, mk('h4', { textContent: 'Rotation' }), row(mk('label', { style: 'display:grid;gap:3px;font-size:12px;color:var(--muted)' }, mk('span', {}, 'Angle: ', v), r), lab('Angle (°)', n)));
  }
  // Drop shadow for any element: it follows the shape, the box or the letters.
  function shadowFor(c) {
    const f = (c.getStyle() || {}).filter || '', m = f.match(/drop-shadow\(([\d.]+)px ([\d.]+)px ([\d.]+)px/);
    const on = mk('input', { type: 'checkbox', checked: !!m });
    let dist = m ? +m[1] : 4, blur = m ? +m[3] : 6;
    const apply = () => { if (on.checked) c.addStyle({ filter: `drop-shadow(${dist}px ${dist}px ${blur}px rgba(0,0,0,0.35))` }); else c.removeStyle('filter'); };
    on.addEventListener('change', () => { apply(); render(); });
    const [bv, br] = rangeIn(blur, 30, (v) => { blur = v; apply(); }, (v) => v + 'px');
    const [dv, dr] = rangeIn(dist, 20, (v) => { dist = v; apply(); }, (v) => v + 'px');
    return mk('div', {}, mk('h4', { textContent: 'Drop shadow' }), mk('label', { style: 'font-size:12px' }, on, ' Drop shadow'),
      m ? row(mk('label', { style: 'display:grid;gap:3px;font-size:12px;color:var(--muted)' }, mk('span', {}, 'Softness: ', bv), br), mk('label', { style: 'display:grid;gap:3px;font-size:12px;color:var(--muted)' }, mk('span', {}, 'Distance: ', dv), dr)) : null);
  }
  // Opacity: how solid the object is; lower lets what is behind it show through (for overlapping layouts).
  function opacityFor(c) {
    const cur = parseFloat((c.getStyle() || {}).opacity);
    const pct = Number.isFinite(cur) ? Math.round(cur * 100) : 100;
    const val = mk('b', { textContent: pct + '%' });
    const range = mk('input', { type: 'range', min: '0', max: '100', step: '1', value: String(pct), 'aria-label': 'Opacity', style: 'width:100%' });
    const apply = () => {
      const v = +range.value; val.textContent = v + '%';
      if (v >= 100) c.removeStyle('opacity'); else c.addStyle({ opacity: String(v / 100) });
    };
    range.addEventListener('input', apply);
    return mk('div', {}, mk('h4', { textContent: 'Opacity' }),
      mk('label', { className: 'qs-op', style: 'display:grid;gap:4px;font-size:12px;color:var(--muted)' }, mk('span', {}, 'How solid it is (lower to see through): ', val), range));
  }
  function actionsFor(kind, c) {
    const b = (label, fn, title) => mk('button', { className: 'btn', type: 'button', textContent: label, title: title || label, onclick: fn });
    const list = [];
    if (kind === 'image') list.push(b('Replace picture…', () => editor.runCommand('open-assets', { target: c, types: ['image'], accept: 'image/*' })), b('Description…', () => altDialog(c), 'Alt text for people who cannot see the picture'), b(SC.hotspotContainerOf && SC.hotspotContainerOf(c) ? 'Edit hotspots…' : 'Add hotspots…', () => A.hotspots(), 'Clickable areas on the picture'));
    if (kind === 'hotspots') list.push(b('Edit hotspots…', () => A.hotspots()));
    if (kind === 'button' || kind === 'link') list.push(b('Edit link…', () => SC.linkDialog()), b('Edit text', () => { editor.select(c); c.trigger('active'); }));
    if (kind === 'heading' || kind === 'text' || kind === 'list') list.push(b('Edit text', () => { editor.select(c); c.trigger('active'); }));
    if (kind === 'table' || kind === 'cell') list.push(b('Table tools', () => SC.selectTab('table')));
    if (kind === 'nav' && c.getAttributes()['data-sitenav']) list.push(b('Update from pages', () => SC.updateSiteNavs && SC.updateSiteNavs(true)));
    if (kind === 'page') list.push(b('Page properties…', () => A['page-props']()), b('Themes', () => SC.selectTab('design')));
    if (kind !== 'page') list.push(b('Duplicate', () => editor.runCommand('tlb-clone')), b('Move up', () => SC.moveSel(-1)), b('Move down', () => SC.moveSel(1)), b('Name…', () => nameDialog(c), 'A name for this object in the Objects list'), b('Reset look', () => { c.setStyle({}); toast('This object’s own styles are cleared (Ctrl+Z undoes).'); render(); }));
    return mk('div', {}, mk('h4', { textContent: 'Actions' }), mk('div', { className: 'qs-actions' }, list));
  }
  function looksFor(kind, c) {
    const looks = LOOKS[kind] || [];
    if (!looks.length) return mk('p', { className: 'pane-hint', textContent: kind === 'page' ? 'Use Design › Themes to change the colors and fonts of the whole page.' : '' });
    const accents = mk('div', { className: 'qs-accents', 'aria-label': 'Accent color' }, ACCENTS.map((a) => mk('button', { type: 'button', title: a, 'aria-label': 'Accent ' + a, 'aria-pressed': String(a === accent), style: `background:${a}`, onclick: () => { accent = a; render(); } })));
    const grid = mk('div', { className: 'qs-vars' });
    looks.forEach(([name, style]) => {
      const isAction = typeof style === 'string';
      const st = isAction ? {} : fill(style);
      const tile = mk('button', { className: 'qs-var', type: 'button', title: isAction ? name : `${name}: hover to preview, click to keep` });
      tile.innerHTML = isAction ? `<span class="qs-sample">▦</span>` : `<span class="qs-sample">${sample(kind, name, st)}</span>`;
      tile.append(mk('span', { textContent: name }));
      if (!isAction) {
        tile.addEventListener('mouseenter', () => startPreview(c, st));
        tile.addEventListener('focus', () => startPreview(c, st));
        tile.addEventListener('mouseleave', endPreview);
        tile.addEventListener('blur', endPreview);
      }
      tile.addEventListener('click', () => {
        endPreview();
        if (isAction) { A[style](); return; }
        c.addStyle(st);
        if (st['-webkit-text-fill-color'] === 'initial') c.removeStyle('-webkit-text-fill-color');
        toast(`${name} look applied. Ctrl+Z undoes it.`);
      });
      grid.append(tile);
    });
    return mk('div', { style: 'display:grid;gap:8px' },
      mk('h4', { textContent: 'Looks to try' }),
      mk('p', { className: 'pane-hint', style: 'padding:0', textContent: 'Hover to preview on the page, click to keep. Pick a color first:' }),
      accents, grid);
  }
  function altDialog(c) {
    const alt = mk('input', { type: 'text', value: c.getAttributes().alt || '' });
    dialog({ title: 'Picture description', body: [mk('p', { textContent: 'Describe the picture for people who cannot see it (and for search engines).' }), field('Description', alt)],
      actions: [{ label: 'Cancel' }, { label: 'Save', primary: true, run: () => c.addAttributes({ alt: alt.value.trim() }) }] });
  }
  function nameDialog(c) {
    const n = mk('input', { type: 'text', value: c.get('name') || '' , placeholder: c.getName() });
    dialog({ title: 'Name this object', body: [mk('p', { textContent: 'The name shows in the Objects list on the left, so you can find it again.' }), field('Name', n)],
      actions: [{ label: 'Cancel' }, { label: 'Save', primary: true, run: () => { c.set('name', n.value.trim()); render(); } }] });
  }

  let renderT;
  const renderSoon = () => { clearTimeout(renderT); renderT = setTimeout(render, 30); };
  editor.on('component:toggled', renderSoon);
  editor.on('component:update:classes', renderSoon);
  editor.on('load', renderSoon);
  render();
})();
