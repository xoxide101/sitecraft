/* SiteCraft shapes and text boxes: boxes, circles, triangles, diamonds, polygons, stars and arrows with sharp or
   round corners and words inside (the same shapes and corner rounding as the other Craft apps). A shape is a normal
   element with the class sc-shape: the outline is an SVG background, so the words inside stay ordinary editable text.
   Uses window.SC, which the main script sets up. */
(function () {
  'use strict';
  const SC = window.SC;
  const A = SC.actions;
  // Shapes with sharp or rounded corners. Sizes are in any unit; `round` 0 = sharp, 100 = as round as the shape allows.
  const SHAPES = [['rect', 'Box'], ['ellipse', 'Circle or oval'], ['triangle', 'Triangle'], ['diamond', 'Diamond'], ['pentagon', 'Pentagon'], ['hexagon', 'Hexagon'], ['octagon', 'Octagon'], ['star', 'Star'], ['arrow', 'Arrow'], ['line', 'Line']];
  function shapePoints(type, w, h, points = 5) {
    const poly = (n, rot) => Array.from({ length: n }, (_, i) => { const a = ((rot + (360 * i) / n) * Math.PI) / 180; return [w / 2 + (w / 2) * Math.cos(a), h / 2 + (h / 2) * Math.sin(a)]; });
    switch (type) {
      case 'triangle': return [[w / 2, 0], [w, h], [0, h]];
      case 'diamond': return [[w / 2, 0], [w, h / 2], [w / 2, h], [0, h / 2]];
      case 'pentagon': return poly(5, -90);
      case 'hexagon': return poly(6, 0);
      case 'octagon': return poly(8, -67.5);
      case 'star': { const n = Math.max(3, points), out = []; for (let i = 0; i < 2 * n; i++) { const r = i % 2 ? 0.45 : 1, a = ((-90 + (180 * i) / n) * Math.PI) / 180; out.push([w / 2 + (w / 2) * r * Math.cos(a), h / 2 + (h / 2) * r * Math.sin(a)]); } return out; }
      case 'arrow': return [[0, h * 0.3], [w * 0.6, h * 0.3], [w * 0.6, 0], [w, h / 2], [w * 0.6, h], [w * 0.6, h * 0.7], [0, h * 0.7]];
      default: return [[0, 0], [w, 0], [w, h], [0, h]];
    }
  }
  function shapePath(type, w, h, round = 0, points = 5) {
    const f = (v) => +v.toFixed(2);
    if (type === 'ellipse') return `M0 ${f(h / 2)}A${f(w / 2)} ${f(h / 2)} 0 1 0 ${f(w)} ${f(h / 2)}A${f(w / 2)} ${f(h / 2)} 0 1 0 0 ${f(h / 2)}Z`;
    if (type === 'line') return `M0 ${f(h / 2)}L${f(w)} ${f(h / 2)}`;
    const pts = shapePoints(type, w, h, points), n = pts.length;
    // 100% rounds each corner to half of the shortest side, so every shape goes smoothly from sharp to fully round.
    const shortest = Math.min(...pts.map((q, i) => Math.hypot(pts[(i + 1) % n][0] - q[0], pts[(i + 1) % n][1] - q[1]))), R = ((Math.max(0, Math.min(100, round || 0)) / 100) * shortest) / 2;
    if (!R) return 'M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + 'Z';
    let d = '';
    pts.forEach((p, i) => {
      const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
      const la = Math.hypot(a[0] - p[0], a[1] - p[1]), lb = Math.hypot(b[0] - p[0], b[1] - p[1]), r = Math.min(R, la / 2, lb / 2);
      const p1 = [p[0] + ((a[0] - p[0]) * r) / la, p[1] + ((a[1] - p[1]) * r) / la], p2 = [p[0] + ((b[0] - p[0]) * r) / lb, p[1] + ((b[1] - p[1]) * r) / lb];
      d += `${i ? 'L' : 'M'}${f(p1[0])} ${f(p1[1])}Q${f(p[0])} ${f(p[1])} ${f(p2[0])} ${f(p2[1])}`;
    });
    return d + 'Z';
  }
  // Where words sit inside each shape: centre x, centre y and width, as parts of the shape.
  const shapeTextBox = (type) => ({ triangle: [0.5, 0.66, 0.55], diamond: [0.5, 0.5, 0.55], star: [0.5, 0.55, 0.42], arrow: [0.42, 0.5, 0.58], ellipse: [0.5, 0.5, 0.72], pentagon: [0.5, 0.56, 0.66], hexagon: [0.5, 0.5, 0.72], octagon: [0.5, 0.5, 0.75] }[type] || [0.5, 0.5, 1]);

  // The outline as an SVG picture that stretches to the element (the line width stays the same).
  // Everything a shape draws, back to front: the 3-D sides, the face, and one border line or three (outer, middle, inner).
  // Three colours for 3-D: face (fill), side (depth) and edge (border). `k` turns mm (or px) into drawing units.
  // Returns [{ d, x, y, fill, stroke, sw, dash, face }]; the face size is the box less the 3-D depth.
  function shapeLayers(s, W, H, k) {
    const rnd = s.round || 0, pts = s.points || 5, depth = Math.max(0, (s.depth || 0) * k);
    const FW = Math.max(1, W - depth), FH = Math.max(1, H - depth);
    const at = (inset, x0, y0, fill, stroke, sw, dash, face) => ({ d: shapePath(s.type, Math.max(1, FW - 2 * inset), Math.max(1, FH - 2 * inset), rnd, pts), x: x0 + inset, y: y0 + inset, fill: fill || 'none', stroke: stroke || 'none', sw: sw || 0, dash: !!dash, face: !!face });
    const out = [];
    if (depth) {
      const n = Math.max(3, Math.ceil(depth / (0.35 * k)));
      for (let i = n; i >= 1; i--) out.push(at(0, (depth * i) / n, (depth * i) / n, s.side || '#6b6b6b', i === n && s.stroke ? s.stroke : null, i === n && s.stroke ? (s.sw || 0.4) * k : 0));
    }
    const L = s.lines;
    if (L) {
      out.push(at(0, 0, 0, s.fill, null, 0, false, true));
      const o = ((L.outer && L.outer.w) || 0) * k, m = ((L.middle && L.middle.w) || 0) * k, i = ((L.inner && L.inner.w) || 0) * k;
      if (o) out.push(at(o / 2, 0, 0, null, L.outer.color, o, s.dash));
      if (m && L.middle.color) out.push(at(o + m / 2, 0, 0, null, L.middle.color, m, s.dash));
      if (i) out.push(at(o + m + i / 2, 0, 0, null, L.inner.color, i, s.dash));
    } else out.push(at(0, 0, 0, s.fill, s.stroke, s.stroke ? (s.sw || 0.4) * k : 0, s.dash, true));
    return { layers: out, FW, FH };
  }
  const defaultLines = (base) => ({ outer: { color: base || '#222222', w: 1.2 }, middle: { color: '', w: 0.8 }, inner: { color: base || '#222222', w: 0.4 } });
  // The outline as an SVG picture drawn at the element's size in pixels: 3-D sides, the face and one or three border lines.
  function shapeUrl(s, W = 200, H = 200) {
    const m = !s.lines && s.sw ? s.sw / 2 : 0;
    const L = shapeLayers({ ...s, stroke: s.sw ? s.stroke || '#222222' : null }, W - 2 * m, H - 2 * m, 1);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><g transform="translate(${m} ${m})">`
      + L.layers.map((l) => `<path d="${l.d}" transform="translate(${l.x} ${l.y})" fill="${l.fill}" stroke="${l.stroke}" stroke-width="${l.sw}" stroke-linejoin="${s.round ? 'round' : 'miter'}"/>`).join('') + '</g></svg>';
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  }
  // Read a shape's settings from its data- attributes and redraw it.
  function readShape(c) {
    const a = c.getAttributes();
    let lines = null; try { lines = a['data-lines'] ? JSON.parse(a['data-lines']) : null; } catch (e) { lines = null; }
    return { type: a['data-shape'] || 'rect', round: +a['data-round'] || 0, points: +a['data-points'] || 5, fill: a['data-fill'] ?? '#f5c518', stroke: a['data-stroke'] || '#222222', sw: a['data-sw'] != null ? +a['data-sw'] : 2,
      depth: +a['data-depth'] || 0, side: a['data-side'] || '#6b6b6b', lines };
  }
  // Padding keeps the words inside the shape. It is in pixels from the shape's own size: percent padding would be
  // measured from the parent's width and stretch narrow shapes.
  function shapeStyle(s, W = 200, H = 200) {
    const [, cy, tw] = shapeTextBox(s.type), depth = s.depth || 0, side = Math.round(((1 - tw) / 2) * (W - depth));
    return { 'background-image': shapeUrl(s, W, H), 'background-size': '100% 100%', 'background-repeat': 'no-repeat',
      'padding-left': side + 'px', 'padding-right': (side + depth) + 'px', 'padding-top': Math.round(Math.max(0, cy - 0.5) * 2 * (H - depth)) + 'px', 'padding-bottom': depth + 'px' };
  }
  function setShape(c, patch) {
    const s = { ...readShape(c), ...patch };
    c.addAttributes({ 'data-shape': s.type, 'data-round': String(s.round), 'data-points': String(s.points), 'data-fill': s.fill || '', 'data-stroke': s.stroke, 'data-sw': String(s.sw),
      'data-depth': String(s.depth || 0), 'data-side': s.side || '#6b6b6b', 'data-lines': s.lines ? JSON.stringify(s.lines) : '' });
    const el = c.getEl(), W = el ? el.offsetWidth : 200, H = el ? el.offsetHeight : 200;
    c.addStyle(shapeStyle(s, W || 200, H || 200));
  }
  const isShape = (c) => !!c && c.getClasses().includes('sc-shape');
  function shapeHtml(type) {
    const s = { type, round: type === 'rounded' ? 30 : 0, points: 5, fill: '#f5c518', stroke: '#222222', sw: 2 };
    if (type === 'rounded') s.type = 'rect';
    const wide = ['rect', 'arrow'].includes(s.type);
    const st = { width: wide ? '260px' : '200px', 'min-height': wide ? '140px' : '200px', display: 'flex', 'flex-direction': 'column', 'justify-content': 'center', 'text-align': 'center', 'box-sizing': 'border-box', margin: '16px auto', 'font-family': 'Arial, sans-serif', 'font-size': '18px', ...shapeStyle(s, wide ? 260 : 200, wide ? 140 : 200) };
    const css = Object.entries(st).map(([k, v]) => `${k}:${v}`).join(';').replace(/"/g, "'");
    return `<div class="sc-shape" data-shape="${s.type}" data-round="${s.round}" data-points="5" data-fill="${s.fill}" data-stroke="${s.stroke}" data-sw="${s.sw}" style="${css}">Your words</div>`;
  }
  SHAPES.filter(([t]) => t !== 'line').forEach(([t]) => { A['ins-shape-' + t] = () => SC.insertBlock(shapeHtml(t)); });
  A['ins-shape-rounded'] = () => SC.insertBlock(shapeHtml('rounded'));
  A['ins-textbox'] = () => SC.insertBlock('<div class="sc-textbox" style="border:1px solid #555555;border-radius:0;padding:16px;background-color:#ffffff;max-width:380px;margin:16px auto;line-height:1.5">Type here. Words wrap inside the box. Change its border, background, corners, padding and shadow in Quick styles.</div>');
  // ---- Curved text: words along a circle (SVG textPath), the same idea as curved text in the other Craft apps.
  // Model in data-curve: { text, dir 'up' | 'down', r (px), rot (degrees), span (degrees, 0 = natural), font, size (px), bold, italic, color, spacing (1/1000 em) }.
  const CURVE_FONTS = ['Arial', 'Georgia', 'Times New Roman', 'Verdana', 'Trebuchet MS', 'Tahoma', 'Courier New', 'Impact', 'Comic Sans MS', 'Palatino Linotype', 'Segoe UI'];
  const escA = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  function curveHtml(m) {
    const r = Math.max(20, m.r), size = Math.round(2 * (r + m.size * 1.4)), c = size / 2, id = 'scc' + Math.random().toString(36).slice(2, 8);
    const sweep = m.dir === 'down' ? 0 : 1;
    const d = `M${c - r} ${c}A${r} ${r} 0 1 ${sweep} ${c + r} ${c}A${r} ${r} 0 1 ${sweep} ${c - r} ${c}`;
    const len = m.span > 0 ? ` textLength="${((m.span / 360) * 2 * Math.PI * r).toFixed(1)}" lengthAdjust="spacing"` : '';
    const font = `font-family="${escA(m.font)}" font-size="${m.size}" font-weight="${m.bold ? 'bold' : 'normal'}" font-style="${m.italic ? 'italic' : 'normal'}" fill="${escA(m.color)}" letter-spacing="${((m.spacing || 0) / 1000) * m.size}"`;
    return `<svg class="sc-curve" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" data-curve="${escA(JSON.stringify(m))}" role="img" aria-label="${escA(m.text)}" style="display:block;margin:16px auto;max-width:100%;overflow:visible">`
      + `<defs><path id="${id}" d="${d}"/></defs><g transform="rotate(${m.rot || 0} ${c} ${c})"><text ${font}><textPath href="#${id}" startOffset="25%" text-anchor="middle"${len}>${escA(m.text)}</textPath></text></g></svg>`;
  }
  const isCurve = (c) => !!c && c.getClasses().includes('sc-curve');
  function readCurve(c) { try { return JSON.parse(c.getAttributes()['data-curve']); } catch (e) { return null; } }
  function setCurve(c, patch) {
    const m = { ...readCurve(c), ...patch };
    const added = c.replaceWith(curveHtml(m)), n = [].concat(added)[0];
    if (n) SC.editor.select(n);
    return n;
  }
  // Type the words in a window first, then OK: the curve is built once.
  function curveDialog(start, done) {
    const words = SC.mk('input', { type: 'text', value: start.text || '', placeholder: 'The words to curve' });
    let dir = start.dir || 'up';
    const segB = (d, label) => SC.mk('button', { type: 'button', className: 'btn', textContent: label, onclick: (e) => { dir = d; e.target.parentNode.querySelectorAll('button').forEach((b) => b.classList.toggle('primary', b === e.target)); } });
    const seg = SC.mk('div', { style: 'display:flex;gap:6px' }, segB('up', '◠ Curve up'), segB('down', '◡ Curve down'));
    seg.querySelectorAll('button')[dir === 'down' ? 1 : 0].classList.add('primary');
    SC.dialog({ title: start.text ? 'Edit curved text' : 'Curved text', body: [SC.field('Words', words), SC.field('Curve', seg)],
      actions: [{ label: 'Cancel' }, { label: 'OK', primary: true, run: () => { if (!words.value.trim()) { SC.toast('Type the words first.'); return false; } done({ text: words.value.trim(), dir }); } }] });
    setTimeout(() => { words.focus(); words.select(); }, 30);
  }
  // Double-click curved text on the page to change its words.
  const onDbl = (e) => { const el = e.target.closest && e.target.closest('svg.sc-curve'); if (!el) return; const c = SC.editor.getSelected(); if (isCurve(c)) curveDialog(readCurve(c), (r) => setCurve(c, r)); };
  const hook = (doc) => { if (doc && !doc.__scCurve) { doc.__scCurve = true; doc.addEventListener('dblclick', onDbl); } };
  hook(SC.fdoc && SC.fdoc());
  SC.editor.on('canvas:frame:load', ({ window: w }) => hook(w && w.document));
  A['ins-curve'] = () => curveDialog({}, (r) => SC.insertBlock(curveHtml({ text: r.text, dir: r.dir, r: 120, rot: 0, span: 0, font: 'Arial', size: 28, bold: true, italic: false, color: '#c2185b', spacing: 80 })));
  Object.assign(SC, { SHAPES, shapePath, isShape, readShape, setShape, defaultLines, CURVE_FONTS, isCurve, readCurve, setCurve, curveDialog });
})();
