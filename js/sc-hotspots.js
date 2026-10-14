/* SiteCraft picture hotspots: draw areas on a picture that react to hovering and clicking.
   Each hotspot can open a link, show a note, or jump to a bookmark, with a hover effect, a tooltip,
   an optional pulsing dot or number, and its own color (or alternating odd/even colors).
   The saved page uses positioned links in percentages, so it works on every screen size, plus an
   optional classic <map> for old browsers. Uses window.SC, which the main script sets up. */
(function () {
  'use strict';
  const SC = window.SC;
  const { editor, mk, toast, dialog, field, esc } = SC;
  const A = SC.actions;

  // ---- Styles for the saved page ----
  const PAGE_CSS = `<style>
.sc-hotspots{position:relative;display:inline-block;max-width:100%;line-height:0}
.sc-hotspots>img{display:block;max-width:100%;height:auto}
.sc-hs{position:absolute;display:block;--hs:#2f5bea;border-radius:4px;transition:background .15s,box-shadow .15s,transform .15s;outline:none;line-height:1.3}
.sc-hs.sc-round{border-radius:50%}
.sc-hs.fx-outline:hover,.sc-hs.fx-outline:focus{box-shadow:inset 0 0 0 3px var(--hs)}
.sc-hs.fx-tint:hover,.sc-hs.fx-tint:focus{background:color-mix(in srgb,var(--hs) 35%,transparent)}
.sc-hs.fx-glow:hover,.sc-hs.fx-glow:focus{box-shadow:0 0 0 3px rgba(255,255,255,.85),0 0 26px 8px var(--hs)}
.sc-hs.fx-zoom:hover,.sc-hs.fx-zoom:focus{transform:scale(1.06);box-shadow:inset 0 0 0 2px var(--hs)}
.sc-hotspots.sc-show .sc-hs{box-shadow:inset 0 0 0 2px color-mix(in srgb,var(--hs) 70%,#fff)}
.sc-hs .sc-mark{position:absolute;left:50%;top:50%;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:var(--hs);color:#fff;font:700 12px/22px Arial,sans-serif;text-align:center;box-shadow:0 0 0 0 var(--hs);animation:sc-pulse 1.8s infinite}
.sc-hs .sc-mark:empty{width:16px;height:16px;margin:-8px 0 0 -8px}
@keyframes sc-pulse{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--hs) 70%,transparent)}70%{box-shadow:0 0 0 14px transparent}100%{box-shadow:0 0 0 0 transparent}}
.sc-hs .sc-tip{position:absolute;left:50%;bottom:100%;transform:translate(-50%,-8px);background:#1d2330;color:#fff;padding:6px 10px;border-radius:6px;font:13px/1.3 Arial,sans-serif;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .15s;z-index:2}
.sc-hs:hover .sc-tip,.sc-hs:focus .sc-tip{opacity:1}
.sc-hs-note{position:absolute;z-index:3;max-width:260px;background:#fff;color:#1d2330;border-radius:10px;padding:12px 14px;box-shadow:0 12px 30px rgba(0,0,0,.25);font:14px/1.45 Arial,sans-serif}
@media (hover:none){.sc-hotspots .sc-hs{box-shadow:inset 0 0 0 2px color-mix(in srgb,var(--hs) 70%,#fff)}}
</style>`;
  // Notes open in a small bubble when a hotspot is clicked.
  const NOTE_JS = `document.querySelectorAll('[data-widget="hotspots"]').forEach(function(box){box.querySelectorAll('.sc-hs[data-note]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();var old=box.querySelector('.sc-hs-note');if(old){old.remove();if(old.dataset.for===a.dataset.n)return;}var n=document.createElement('div');n.className='sc-hs-note';n.dataset.for=a.dataset.n;n.textContent=a.getAttribute('data-note');n.style.left=Math.min(70,parseFloat(a.style.left))+'%';n.style.top=(parseFloat(a.style.top)+parseFloat(a.style.height))+'%';box.appendChild(n);});});});`;
  SC.exportHooks.bodyEnd.push((mode, page) => {
    const pg = page || editor.Pages.getSelected();
    const html = editor.getHtml({ component: pg.getMainComponent() });
    if (!html.includes('data-widget="hotspots"') || !html.includes('data-note')) return '';
    const t = mode.xml || mode.old ? ' type="text/javascript"' : '';
    return `<script${t} data-sc-widget="hotspots">\n${NOTE_JS}\n</script>\n`;
  });

  // ---- Editor styles ----
  document.head.append(mk('style', { textContent: `
    .hs-wrap { display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: 16px; min-height: 0; }
    .hs-stage { position: relative; align-self: start; user-select: none; cursor: crosshair; border-radius: 8px; overflow: hidden; background: repeating-conic-gradient(#e5e7eb 0 25%, #f3f4f6 0 50%) 0 0 / 16px 16px; }
    .hs-stage img { display: block; width: 100%; pointer-events: none; }
    .hs-spot { position: absolute; border: 2px solid #fff; box-shadow: 0 0 0 2px var(--c, #2f5bea), inset 0 0 0 999px color-mix(in srgb, var(--c, #2f5bea) 22%, transparent); border-radius: 4px; cursor: move; display: grid; place-items: center; color: #fff; font: 700 13px Arial, sans-serif; text-shadow: 0 1px 2px rgba(0,0,0,.6); }
    .hs-spot.round { border-radius: 50%; }
    .hs-spot.on { box-shadow: 0 0 0 3px var(--c, #2f5bea), 0 0 0 6px rgba(255,255,255,.7), inset 0 0 0 999px color-mix(in srgb, var(--c, #2f5bea) 32%, transparent); }
    .hs-spot i { position: absolute; right: -6px; bottom: -6px; width: 12px; height: 12px; border-radius: 3px; background: #fff; border: 2px solid var(--c, #2f5bea); cursor: nwse-resize; }
    .hs-side { display: grid; gap: 8px; align-content: start; min-width: 0; }
    .hs-list { display: flex; flex-wrap: wrap; gap: 4px; }
    .hs-list button { border: 1px solid var(--line); background: var(--panel-2); color: var(--fg); border-radius: 6px; padding: 3px 8px; cursor: pointer; font: inherit; font-size: 12px; }
    .hs-list button.on { border-color: var(--accent); background: var(--accent-soft); }
    .hs-side select, .hs-side input[type="text"], .hs-side textarea { width: 100%; box-sizing: border-box; padding: 6px 8px; border: 1px solid var(--line); border-radius: 6px; background: var(--panel-2); color: var(--fg); font: inherit; }
    .hs-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    @media (max-width: 760px) { .hs-wrap { grid-template-columns: 1fr; } }
  ` }));

  const COLORS = ['#2f5bea', '#d1408a', '#1e9e6a', '#e4572e', '#7b4fd6', '#e09f1f', '#138a9e', '#1d2330'];
  const r1 = (n) => Math.round(n * 10) / 10;

  // Read hotspots back from a saved container so they can be edited again.
  function readContainer(c) {
    const t = document.createElement('template'); t.innerHTML = c.toHTML();
    const box = t.content.firstElementChild; const img = box.querySelector('img');
    // GrapesJS keeps each hotspot's position and color in the page's CSS, so read them from the objects.
    const objs = [];
    c.onAll((x) => { if (x.getClasses().includes('sc-hs')) objs.push(x); });
    const styleOf = (a) => { const o = objs.find((x) => x.getAttributes()['data-n'] === a.getAttribute('data-n')); return o ? o.getStyle() : {}; };
    const spots = [...box.querySelectorAll('.sc-hs')].map((a) => {
      const st = styleOf(a);
      ['left', 'top', 'width', 'height'].forEach((k) => { if (st[k]) a.style[k] = st[k]; });
      if (st['--hs']) a.style.setProperty('--hs', st['--hs']);
      const fx = [...a.classList].find((x) => x.startsWith('fx-')) || 'fx-outline';
      const href = a.getAttribute('href') || '#';
      return {
        x: parseFloat(a.style.left), y: parseFloat(a.style.top), w: parseFloat(a.style.width), h: parseFloat(a.style.height),
        label: (a.querySelector('.sc-tip') || {}).textContent || a.getAttribute('aria-label') || '',
        action: a.hasAttribute('data-note') ? 'note' : href.startsWith('#') && href.length > 1 ? 'section' : href === '#' ? 'none' : 'link',
        url: href, note: a.getAttribute('data-note') || '', newTab: a.getAttribute('target') === '_blank',
        effect: fx.slice(3), round: a.classList.contains('sc-round'), marker: a.querySelector('.sc-mark') ? (a.querySelector('.sc-mark').textContent ? 'number' : 'dot') : 'none',
        color: a.style.getPropertyValue('--hs').trim() || COLORS[0],
      };
    });
    return { src: img ? img.getAttribute('src') : '', alt: img ? img.getAttribute('alt') || '' : '', spots, show: box.classList.contains('sc-show'), map: !!t.content.querySelector('map') };
  }
  const containerOf = (c) => { for (let p = c; p; p = p.parent()) if (p.getClasses && p.getClasses().includes('sc-hotspots')) return p; return null; };
  SC.hotspotContainerOf = containerOf;

  function build(state, imgSize) {
    const mapName = 'sc-map-' + Math.random().toString(36).slice(2, 7);
    const links = state.spots.map((s, i) => {
      const cls = ['sc-hs', 'fx-' + s.effect, s.round ? 'sc-round' : ''].filter(Boolean).join(' ');
      const href = s.action === 'link' ? s.url || '#' : s.action === 'section' ? (s.url.startsWith('#') ? s.url : '#' + s.url) : '#';
      const attrs = [`class="${cls}"`, `href="${esc(href)}"`, `style="left:${r1(s.x)}%;top:${r1(s.y)}%;width:${r1(s.w)}%;height:${r1(s.h)}%;--hs:${s.color}"`,
        `aria-label="${esc(s.label || 'Hotspot ' + (i + 1))}"`, `data-n="${i + 1}"`];
      if (s.action === 'link' && s.newTab) attrs.push('target="_blank" rel="noopener"');
      if (s.action === 'note') attrs.push(`data-note="${esc(s.note)}"`);
      const mark = s.marker === 'dot' ? '<span class="sc-mark"></span>' : s.marker === 'number' ? `<span class="sc-mark">${i + 1}</span>` : '';
      const tip = s.label ? `<span class="sc-tip">${esc(s.label)}</span>` : '';
      return `<a ${attrs.join(' ')}>${mark}${tip}</a>`;
    }).join('');
    let map = '';
    if (state.map && imgSize.w) {
      const areas = state.spots.map((s, i) => {
        const x = Math.round(s.x / 100 * imgSize.w), y = Math.round(s.y / 100 * imgSize.h), w = Math.round(s.w / 100 * imgSize.w), h = Math.round(s.h / 100 * imgSize.h);
        const href = s.action === 'link' ? s.url : s.action === 'section' ? '#' + s.url.replace(/^#/, '') : '#';
        const shape = s.round ? `shape="circle" coords="${x + Math.round(w / 2)},${y + Math.round(h / 2)},${Math.round(Math.min(w, h) / 2)}"` : `shape="rect" coords="${x},${y},${x + w},${y + h}"`;
        return `<area ${shape} href="${esc(href || '#')}" alt="${esc(s.label || 'Hotspot ' + (i + 1))}" title="${esc(s.label || '')}">`;
      }).join('');
      map = `<map name="${mapName}">${areas}</map>`;
    }
    return `<div class="sc-hotspots${state.show ? ' sc-show' : ''}" data-widget="hotspots"><img src="${esc(state.src)}" alt="${esc(state.alt)}"${map ? ` usemap="#${mapName}"` : ''}>${links}${map}</div>${PAGE_CSS}`;
  }

  // ---- The hotspot editor ----
  function openEditor(state, target) {
    let cur = state.spots.length ? 0 : -1;
    const stage = mk('div', { className: 'hs-stage', title: 'Drag on the picture to draw a hotspot' });
    const img = mk('img', { src: state.src, alt: '' });
    stage.append(img);
    const side = mk('div', { className: 'hs-side' });
    const imgSize = { w: 0, h: 0 };
    img.onload = () => { imgSize.w = img.naturalWidth; imgSize.h = img.naturalHeight; };

    function drawSpots() {
      stage.querySelectorAll('.hs-spot').forEach((n) => n.remove());
      state.spots.forEach((s, i) => {
        const el = mk('div', { className: 'hs-spot' + (i === cur ? ' on' : '') + (s.round ? ' round' : ''), textContent: String(i + 1) });
        Object.assign(el.style, { left: s.x + '%', top: s.y + '%', width: s.w + '%', height: s.h + '%' });
        el.style.setProperty('--c', s.color);
        el.append(mk('i', { title: 'Drag to resize' }));
        el.dataset.i = i;
        stage.append(el);
      });
    }
    function pct(e) {
      const r = stage.getBoundingClientRect();
      return { x: Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)), y: Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100)) };
    }
    let drag = null;
    stage.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const p = pct(e), spotEl = e.target.closest('.hs-spot');
      if (spotEl) {
        cur = +spotEl.dataset.i; const s = state.spots[cur];
        drag = e.target.tagName === 'I' ? { mode: 'size', s, ox: s.x, oy: s.y } : { mode: 'move', s, dx: p.x - s.x, dy: p.y - s.y };
      } else {
        const prev = state.spots[state.spots.length - 1];
        const s = { x: p.x, y: p.y, w: 0, h: 0, label: '', action: 'link', url: 'https://', note: '', newTab: false, effect: prev ? prev.effect : 'outline', round: false, marker: prev ? prev.marker : 'none',
          color: state.alternate ? COLORS[state.spots.length % 2 === 0 ? 0 : 1] : (prev ? prev.color : COLORS[0]) };
        state.spots.push(s); cur = state.spots.length - 1;
        drag = { mode: 'draw', s, ox: p.x, oy: p.y };
      }
      drawSpots(); drawSide();
    });
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    function move(e) {
      if (!drag) return;
      const p = pct(e), s = drag.s;
      if (drag.mode === 'move') { s.x = Math.max(0, Math.min(100 - s.w, p.x - drag.dx)); s.y = Math.max(0, Math.min(100 - s.h, p.y - drag.dy)); }
      else { const ox = drag.mode === 'size' ? s.x : drag.ox, oy = drag.mode === 'size' ? s.y : drag.oy; s.x = Math.min(ox, p.x); s.y = Math.min(oy, p.y); s.w = Math.abs(p.x - ox); s.h = Math.abs(p.y - oy); if (drag.mode === 'size') { s.x = ox; s.y = oy; s.w = Math.max(2, p.x - ox); s.h = Math.max(2, p.y - oy); } }
      drawSpots();
    }
    function up() {
      if (!drag) return;
      if (drag.mode === 'draw' && (drag.s.w < 2 || drag.s.h < 2)) { state.spots.pop(); cur = state.spots.length - 1; }
      drag = null; drawSpots(); drawSide();
    }

    function sel(options, value, onchange) {
      const s = mk('select', {}, options.map(([v, l]) => mk('option', { value: v, textContent: l })));
      s.value = value; s.onchange = () => onchange(s.value); return s;
    }
    function drawSide() {
      side.textContent = '';
      side.append(mk('div', { className: 'hs-list' }, state.spots.map((s, i) => mk('button', { type: 'button', className: i === cur ? 'on' : '', textContent: `${i + 1}${s.label ? ' · ' + s.label.slice(0, 14) : ''}`, onclick: () => { cur = i; drawSpots(); drawSide(); } }))));
      const s = state.spots[cur];
      if (!s) {
        side.append(mk('p', { textContent: 'Drag on the picture to draw your first hotspot. Then choose what happens when someone hovers over it or clicks it.' }));
      } else {
        const label = mk('input', { type: 'text', value: s.label, placeholder: 'Shown when hovering', oninput: () => { s.label = label.value; } });
        const url = mk('input', { type: 'text', value: s.url, oninput: () => { s.url = url.value; } });
        const note = mk('textarea', { rows: 3, value: s.note, placeholder: 'Text shown in a bubble', oninput: () => { s.note = note.value; } });
        const newTab = mk('input', { type: 'checkbox', checked: s.newTab, onchange: () => { s.newTab = newTab.checked; } });
        const actionBox = mk('div', { style: 'display:grid;gap:8px' });
        const showAction = () => {
          actionBox.textContent = '';
          if (s.action === 'link') actionBox.append(field('Link address (web page or one of your pages)', url), mk('label', { className: 'dlg-check' }, newTab, 'Open in a new tab'));
          if (s.action === 'section') { if (s.url === 'https://') s.url = '#'; url.value = s.url; actionBox.append(field('Bookmark to jump to (for example #prices)', url)); }
          if (s.action === 'note') actionBox.append(field('Note', note));
        };
        showAction();
        side.append(
          mk('h4', { style: 'margin:6px 0 0', textContent: `Hotspot ${cur + 1}` }),
          field('Tooltip', label),
          field('When clicked', sel([['link', 'Open a link'], ['note', 'Show a note'], ['section', 'Jump to a bookmark'], ['none', 'Nothing (hover only)']], s.action, (v) => { s.action = v; showAction(); })),
          actionBox,
          field('When hovered', sel([['outline', 'Outline'], ['tint', 'Color tint'], ['glow', 'Glow'], ['zoom', 'Grow a little'], ['none', 'No effect']], s.effect, (v) => { s.effect = v; })),
          field('Marker', sel([['none', 'None'], ['dot', 'Pulsing dot'], ['number', 'Number']], s.marker, (v) => { s.marker = v; })),
          mk('div', { className: 'hs-row' }, mk('label', { className: 'dlg-check' }, mk('input', { type: 'checkbox', checked: s.round, onchange: (e) => { s.round = e.target.checked; drawSpots(); } }), 'Round'),
            ...COLORS.map((c) => mk('button', { type: 'button', title: c, 'aria-label': 'Color ' + c, style: `width:20px;height:20px;border-radius:50%;border:2px solid ${c === s.color ? 'var(--fg)' : 'transparent'};background:${c};cursor:pointer;padding:0`, onclick: () => { s.color = c; drawSpots(); drawSide(); } }))),
          mk('div', { className: 'hs-row' },
            mk('button', { className: 'btn', type: 'button', textContent: 'Same for all', title: 'Give every hotspot this one’s hover effect, marker and shape', onclick: () => { state.spots.forEach((x) => { x.effect = s.effect; x.marker = s.marker; x.round = s.round; }); drawSpots(); toast('Every hotspot now looks like this one.'); } }),
            mk('button', { className: 'btn', type: 'button', textContent: 'Delete hotspot', onclick: () => { state.spots.splice(cur, 1); cur = Math.min(cur, state.spots.length - 1); drawSpots(); drawSide(); } })));
      }
      side.append(mk('h4', { style: 'margin:10px 0 0', textContent: 'Whole picture' }),
        mk('label', { className: 'dlg-check' }, mk('input', { type: 'checkbox', checked: state.alternate, onchange: (e) => { state.alternate = e.target.checked; if (state.alternate) state.spots.forEach((x, i) => { x.color = COLORS[i % 2 === 0 ? 0 : 1]; }); drawSpots(); drawSide(); } }), 'Alternate colors (odd / even)'),
        mk('label', { className: 'dlg-check' }, mk('input', { type: 'checkbox', checked: state.show, onchange: (e) => { state.show = e.target.checked; } }), 'Always show the hotspots'),
        mk('label', { className: 'dlg-check' }, mk('input', { type: 'checkbox', checked: state.map, onchange: (e) => { state.map = e.target.checked; } }), 'Also add a classic image map (old browsers)'),
        mk('p', { style: 'font-size:12px', textContent: 'On phones and tablets (no mouse) the hotspots are always outlined, so people can see what to tap.' }));
    }
    drawSpots(); drawSide();
    const cleanup = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    dialog({
      title: 'Picture hotspots', wide: true, onClose: cleanup,
      body: [mk('p', { textContent: 'Drag on the picture to draw an area. Drag an area to move it, or its corner to resize it.' }), mk('div', { className: 'hs-wrap' }, stage, side)],
      actions: [{ label: 'Cancel' }, { label: target ? 'Update hotspots' : 'Insert on the page', primary: true, run: () => {
        if (!state.spots.length) { toast('Draw at least one hotspot on the picture.'); return false; }
        const html = build(state, imgSize);
        if (target) { const [added] = [].concat(target.replaceWith(html)); if (added) editor.select(added); toast('Hotspots updated.'); }
        else { SC.insertBlock(html); toast('Picture with hotspots added. Try it with Developer › Preview in browser.'); }
      } }],
    });
  }

  // Start from: the selected hotspot picture, the selected picture, or a picture you choose.
  A.hotspots = () => {
    SC.stopEditing();
    const c = editor.getSelected();
    const box = c && containerOf(c);
    if (box) { openEditor({ alternate: false, ...readContainer(box) }, box); return; }
    const fresh = (src, alt) => openEditor({ src, alt, spots: [], show: false, map: SC.settings.doctype !== 'html5', alternate: false }, null);
    if (c && (c.get('type') === 'image' || c.get('tagName') === 'img')) {
      const attrs = c.getAttributes();
      openEditor({ src: c.get('src') || attrs.src, alt: attrs.alt || '', spots: [], show: false, map: SC.settings.doctype !== 'html5', alternate: false }, c);
      return;
    }
    const input = mk('input', { type: 'file', accept: 'image/*' });
    const url = mk('input', { type: 'text', placeholder: 'https://…/picture.jpg' });
    const dlg = dialog({ title: 'Picture hotspots', body: [mk('p', { textContent: 'Pick the picture to put hotspots on: from this computer or a web address. (Or select a picture on the page first.)' }),
      mk('button', { className: 'btn primary', type: 'button', textContent: 'Choose a picture from this computer…', onclick: () => input.click() }), field('…or a web address', url)],
      actions: [{ label: 'Cancel' }, { label: 'Use this address', run: () => { if (!/^https?:/i.test(url.value.trim())) { toast('Type a web address starting with https://'); return false; } fresh(url.value.trim(), ''); } }] });
    input.onchange = () => {
      const f = input.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = () => { dlg.close(); editor.AssetManager.add({ src: r.result, name: f.name }); fresh(r.result, f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ')); };
      r.readAsDataURL(f);
    };
  };

  // Menus and right-click
  const insertMenu = (SC.menus.find(([n]) => n === 'Insert') || [])[1];
  if (insertMenu) {
    const at = insertMenu.findIndex((it) => it.label === 'Picture from a web address…');
    insertMenu.splice(at + 1, 0, { label: 'Picture hotspots…', run: () => A.hotspots() });
  }
})();
