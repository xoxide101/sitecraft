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
  // Fills and backgrounds (the same in every Craft app). A paint is { type, ... }:
  //   solid    { color }
  //   gradient { c1, c2, angle (deg), radial, dither }   dither adds fine noise so gradients do not show bands
  //   pattern  { pattern, fg, bg, size (tile size: mm in print apps, px in SiteCraft) }
  //   picture  { src, fit: cover | contain | tile | stretch, opacity }
  // Patterns are drawn on a small square tile, fg on bg (bg '' = see-through).
  const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const PATTERNS = [
    // dithers: ordered (Bayer) dots at a set darkness, a random dither and a halftone
    ...[12, 25, 37, 50, 62, 75, 88].map((p) => [`dither${p}`, `Dither ${p}%`, 'Dithers', (x, n, fg) => { const c = n / 4; x.fillStyle = fg; BAYER4.forEach((t, i) => { if ((t + 0.5) / 16 < p / 100) x.fillRect((i % 4) * c, Math.floor(i / 4) * c, c, c); }); }]),
    ['noise', 'Random dither 50%', 'Dithers', (x, n, fg) => { const c = n / 16; x.fillStyle = fg; let s = 12345; for (let i = 0; i < 256; i++) { s = (s * 16807) % 2147483647; if (s % 2) x.fillRect((i % 16) * c, Math.floor(i / 16) * c, c, c); } }],
    ['halftone', 'Halftone dots', 'Dithers', (x, n, fg) => { x.fillStyle = fg; [[0.25, 0.25], [0.75, 0.75]].forEach(([a, b]) => { x.beginPath(); x.arc(a * n, b * n, n * 0.2, 0, 7); x.fill(); }); }],
    // lines
    ['hstripes', 'Stripes across', 'Lines', (x, n, fg) => { x.fillStyle = fg; x.fillRect(0, 0, n, n / 2); }],
    ['vstripes', 'Stripes down', 'Lines', (x, n, fg) => { x.fillStyle = fg; x.fillRect(0, 0, n / 2, n); }],
    ['diag', 'Diagonal lines', 'Lines', (x, n, fg) => { x.strokeStyle = fg; x.lineWidth = n * 0.22; x.beginPath(); for (let k = -1; k <= 1; k++) { x.moveTo(k * n, n); x.lineTo(k * n + n, 0); } x.stroke(); }],
    ['diag2', 'Diagonal lines (other way)', 'Lines', (x, n, fg) => { x.strokeStyle = fg; x.lineWidth = n * 0.22; x.beginPath(); for (let k = -1; k <= 1; k++) { x.moveTo(k * n, 0); x.lineTo(k * n + n, n); } x.stroke(); }],
    ['pinstripe', 'Pinstripes', 'Lines', (x, n, fg) => { x.fillStyle = fg; x.fillRect(0, 0, Math.max(1, n * 0.1), n); }],
    ['grid', 'Grid', 'Lines', (x, n, fg) => { x.fillStyle = fg; const w = Math.max(1, n * 0.1); x.fillRect(0, 0, n, w); x.fillRect(0, 0, w, n); }],
    ['cross', 'Crosshatch', 'Lines', (x, n, fg) => { x.strokeStyle = fg; x.lineWidth = n * 0.12; x.beginPath(); for (let k = -1; k <= 1; k++) { x.moveTo(k * n, n); x.lineTo(k * n + n, 0); x.moveTo(k * n, 0); x.lineTo(k * n + n, n); } x.stroke(); }],
    ['zigzag', 'Zigzag', 'Lines', (x, n, fg) => { x.strokeStyle = fg; x.lineWidth = n * 0.14; x.beginPath(); x.moveTo(0, n * 0.7); x.lineTo(n / 2, n * 0.3); x.lineTo(n, n * 0.7); x.stroke(); }],
    ['waves', 'Waves', 'Lines', (x, n, fg) => { x.strokeStyle = fg; x.lineWidth = n * 0.12; x.beginPath(); x.moveTo(0, n / 2); x.bezierCurveTo(n * 0.25, n * 0.15, n * 0.25, n * 0.15, n / 2, n / 2); x.bezierCurveTo(n * 0.75, n * 0.85, n * 0.75, n * 0.85, n, n / 2); x.stroke(); }],
    // shapes
    ['checks', 'Checkerboard', 'Shapes', (x, n, fg) => { x.fillStyle = fg; x.fillRect(0, 0, n / 2, n / 2); x.fillRect(n / 2, n / 2, n / 2, n / 2); }],
    ['dots', 'Polka dots', 'Shapes', (x, n, fg) => { x.fillStyle = fg; x.beginPath(); x.arc(n / 2, n / 2, n * 0.18, 0, 7); x.fill(); }],
    ['bricks', 'Bricks', 'Shapes', (x, n, fg) => { x.fillStyle = fg; const w = Math.max(1, n * 0.08); x.fillRect(0, 0, n, w); x.fillRect(0, n / 2, n, w); x.fillRect(0, 0, w, n / 2); x.fillRect(n / 2, n / 2, w, n / 2); }],
    ['diamonds', 'Diamonds', 'Shapes', (x, n, fg) => { x.fillStyle = fg; x.beginPath(); x.moveTo(n / 2, n * 0.1); x.lineTo(n * 0.9, n / 2); x.lineTo(n / 2, n * 0.9); x.lineTo(n * 0.1, n / 2); x.fill(); }],
    ['scales', 'Fish scales', 'Shapes', (x, n, fg) => { x.strokeStyle = fg; x.lineWidth = n * 0.08; [[0, 0], [n, 0], [n / 2, n / 2], [0, n], [n, n]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, n / 2, 0, Math.PI); x.stroke(); }); }],
    ['triangles', 'Triangles', 'Shapes', (x, n, fg) => { x.fillStyle = fg; x.beginPath(); x.moveTo(0, n); x.lineTo(n / 2, n * 0.15); x.lineTo(n, n); x.fill(); }],
    ['plus', 'Plus signs', 'Shapes', (x, n, fg) => { x.fillStyle = fg; const w = n * 0.12; x.fillRect(n / 2 - w / 2, n * 0.25, w, n / 2); x.fillRect(n * 0.25, n / 2 - w / 2, n / 2, w); }],
    ['stars', 'Little stars', 'Shapes', (x, n, fg) => { x.fillStyle = fg; x.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? n * 0.13 : n * 0.32, a = (i * Math.PI) / 5; x.lineTo(n / 2 + r * Math.sin(a), n / 2 - r * Math.cos(a)); } x.fill(); }],
    ['hearts', 'Little hearts', 'Shapes', (x, n, fg) => { x.fillStyle = fg; x.beginPath(); x.moveTo(n / 2, n * 0.78); x.bezierCurveTo(n * 0.1, n * 0.5, n * 0.2, n * 0.18, n / 2, n * 0.35); x.bezierCurveTo(n * 0.8, n * 0.18, n * 0.9, n * 0.5, n / 2, n * 0.78); x.fill(); }],
    ['weave', 'Basket weave', 'Shapes', (x, n, fg) => { x.fillStyle = fg; const h = n / 2, s = h / 6; for (let i = 0; i < 3; i++) { const o = i * (h / 3) + s / 2; x.fillRect(0, o, h, s); x.fillRect(h, h + o, h, s); x.fillRect(h + o, 0, s, h); x.fillRect(o, h, s, h); } }],
  ];
  const PATTERN_BY_ID = Object.fromEntries(PATTERNS.map((p) => [p[0], p]));
  // A pattern tile as a canvas `px` pixels square (crisp: no smoothing, whole pixels for dithers).
  function patternTile(id, fg = '#222222', bg = '#ffffff', px = 16) {
    // whole pixels per cell so dithers stay crisp: tiles are a multiple of 4 (16 for the random dither), at least 8 (24 for the weave)
    let n = Math.max(id === 'weave' ? 24 : 8, Math.round(px / 4) * 4); if (id === 'noise') n = Math.max(16, Math.round(n / 16) * 16);
    const c = document.createElement('canvas'); c.width = c.height = n;
    const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    if (bg) { x.fillStyle = bg; x.fillRect(0, 0, n, n); }
    (PATTERN_BY_ID[id] || PATTERNS[3])[3](x, n, fg || '#222222');
    return c;
  }
  // A gradient drawn into a canvas; with dither, a little noise (under one colour step) hides the bands of 8-bit colour.
  function gradientCanvas(w, h, f) {
    const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
    const x = c.getContext('2d'), a = ((f.angle ?? 90) * Math.PI) / 180, cx = c.width / 2, cy = c.height / 2;
    let g;
    if (f.radial) g = x.createRadialGradient(cx, cy, 0, cx, cy, Math.hypot(cx, cy));
    else { const r = (Math.abs(Math.sin(a)) * c.width + Math.abs(Math.cos(a)) * c.height) / 2; g = x.createLinearGradient(cx - Math.sin(a) * r, cy + Math.cos(a) * r, cx + Math.sin(a) * r, cy - Math.cos(a) * r); }
    g.addColorStop(0, f.c1 || '#ffffff'); g.addColorStop(1, f.c2 || '#3f8be8');
    x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
    if (f.dither) ditherCanvas(c);
    return c;
  }
  // Fine dither: ordered noise of up to ±1 colour step, only where the colour changes smoothly (flat areas stay exact).
  function ditherCanvas(c) {
    const x = c.getContext('2d'), img = x.getImageData(0, 0, c.width, c.height), d = img.data, w = c.width;
    for (let i = 0; i < d.length; i += 4) {
      const p = i / 4, t = (BAYER4[(p % w) % 4 + ((Math.floor(p / w) % 4) * 4)] + 0.5) / 16 - 0.5;
      const right = i + 4 < d.length ? i + 4 : i - 4, down = i + w * 4 < d.length ? i + w * 4 : i - w * 4;
      for (let k = 0; k < 3; k++) { const v = d[i + k]; if (Math.abs(v - d[right + k]) <= 3 && Math.abs(v - d[down + k]) <= 3 && (v !== d[right + k] || v !== d[down + k])) d[i + k] = Math.max(0, Math.min(255, Math.round(v + t * 2.2))); }
    }
    x.putImageData(img, 0, 0);
    return c;
  }
  // The whole fill painted into a w × h canvas (pixels). `img` is the loaded picture for picture fills; `unit` = tile pixels per size unit.
  function paintCanvas(w, h, f, img, unit = 1) {
    const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
    const x = c.getContext('2d');
    if (!f || f.type === 'none') return c;
    if (f.type === 'solid') { x.fillStyle = f.color || '#ffffff'; x.fillRect(0, 0, c.width, c.height); }
    else if (f.type === 'gradient') x.drawImage(gradientCanvas(c.width, c.height, f), 0, 0);
    else if (f.type === 'pattern') { x.imageSmoothingEnabled = false; x.fillStyle = x.createPattern(patternTile(f.pattern, f.fg, f.bg, (f.size || 4) * unit), 'repeat'); x.fillRect(0, 0, c.width, c.height); }
    else if (f.type === 'picture' && img) {
      x.globalAlpha = f.opacity ?? 1;
      const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height, fit = f.fit || 'cover';
      if (fit === 'tile') { const k = ((f.size || 0) * unit) / iw || 1, t = document.createElement('canvas'); t.width = Math.max(1, iw * k); t.height = Math.max(1, ih * k); t.getContext('2d').drawImage(img, 0, 0, t.width, t.height); x.fillStyle = x.createPattern(t, 'repeat'); x.fillRect(0, 0, c.width, c.height); }
      else if (fit === 'stretch') x.drawImage(img, 0, 0, c.width, c.height);
      else { const k = (fit === 'cover' ? Math.max : Math.min)(c.width / iw, c.height / ih); x.drawImage(img, (c.width - iw * k) / 2, (c.height - ih * k) / 2, iw * k, ih * k); }
    }
    return c;
  }
  const paintImgCache = new Map();
  const loadPaintImg = (src) => { if (!src) return Promise.resolve(null); if (!paintImgCache.has(src)) paintImgCache.set(src, new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; })); return paintImgCache.get(src); };
  // A short description for lists and tooltips.
  const paintLabel = (f) => (!f || f.type === 'none' ? 'None' : f.type === 'solid' ? 'Colour' : f.type === 'gradient' ? (f.radial ? 'Round gradient' : 'Gradient') : f.type === 'pattern' ? (PATTERN_BY_ID[f.pattern] || ['', 'Pattern'])[1] : 'Picture');
  // Defaults when switching type, keeping the colours already chosen.
  function paintSwitch(f, type, base = '#3f8be8') {
    const c = (f && (f.color || f.c1 || f.fg)) || base;
    const light = (h) => { const m = /^#?([0-9a-f]{6})$/i.exec(h || ''); if (!m) return false; const v = parseInt(m[1], 16); return 0.299 * (v >> 16) + 0.587 * ((v >> 8) & 255) + 0.114 * (v & 255) > 200; };
    const ink = light(c) ? '#3f6fd8' : c, other = light(c) ? '#3f6fd8' : '#ffffff'; // a white page gets a colour that shows
    if (type === 'none') return { type: 'none' };
    if (type === 'solid') return { type, color: c };
    if (type === 'gradient') return { type, c1: c, c2: (f && f.c2) || other, angle: (f && f.angle) ?? 90, radial: !!(f && f.radial), dither: f && f.dither != null ? f.dither : true };
    if (type === 'pattern') return { type, pattern: (f && f.pattern) || 'dither50', fg: f && f.fg ? f.fg : ink, bg: (f && f.bg != null ? f.bg : '#ffffff'), size: (f && f.size) || 3 };
    return { type: 'picture', src: (f && f.src) || '', fit: (f && f.fit) || 'cover', opacity: (f && f.opacity) ?? 1, size: (f && f.size) || 20 };
  }
  // The fill picker as plain HTML (the same in every Craft app): none, colour, gradient, pattern or picture.
  // paintPicker(paint, apply, { none: 'None' | null, base, label, unit: 'mm' | 'px', sizeMax, pickPicture }) → element.
  // apply(newPaint) is called after every change; rebuild the picker from the new paint to show the new controls.
  function paintPicker(f, apply, o = {}) {
    if (!document.getElementById('pp-style')) {
      const st = document.createElement('style'); st.id = 'pp-style';
      st.textContent = '.pp{display:grid;gap:7px;margin:4px 0 8px}.pp-seg{display:flex;flex-wrap:wrap;gap:2px;padding:2px;border:1px solid var(--line,#ccc);border-radius:7px;background:var(--panel-2,#f3f3f3)}'
        + '.pp-seg button{flex:1 1 auto;min-width:0;white-space:nowrap;border:0;background:none;color:inherit;padding:4px 6px;border-radius:5px;cursor:pointer;font:inherit;font-size:12px}'
        + '.pp-seg button[aria-pressed=true]{background:var(--panel,#fff);color:var(--accent,#2f6fdd);box-shadow:0 1px 2px rgba(0,0,0,.12)}'
        + '.pp label{display:grid;gap:3px;font-size:12px;color:var(--muted,#666)}.pp .pp-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}'
        + '.pp input[type=color]{width:100%;height:28px;padding:2px;border:1px solid var(--line,#ccc);border-radius:6px;background:var(--panel,#fff)}'
        + '.pp select{height:28px;border:1px solid var(--line,#ccc);border-radius:6px;background:var(--panel,#fff);color:var(--fg,inherit);font:inherit;font-size:12px}'
        + '.pp .pp-check{display:flex;gap:6px;align-items:center;font-size:12px;color:inherit}.pp .pp-swatch{height:30px;border:1px solid var(--line,#ccc);border-radius:6px;image-rendering:pixelated}'
        + '.pp .pp-btn{height:28px;border:1px solid var(--line,#ccc);border-radius:6px;background:var(--panel,#fff);color:inherit;cursor:pointer;font:inherit;font-size:12px}';
      document.head.append(st);
    }
    f = f || { type: 'none' };
    const unit = o.unit || 'mm', set = (patch) => apply({ ...f, ...patch });
    const choose = o.pickPicture || (() => new Promise((res) => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.onchange = () => { const fl = i.files[0]; if (!fl) return res(null); const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(fl); }; i.click(); }));
    const el = document.createElement('div'); el.className = 'pp';
    const mk = (tag, props = {}, ...kids) => { const e = Object.assign(document.createElement(tag), props); kids.flat().forEach((k) => k != null && e.append(k)); return e; };
    const color = (label, key, v) => mk('label', {}, label, mk('input', { type: 'color', value: /^#[0-9a-f]{6}$/i.test(v || '') ? v : '#ffffff', onchange: (e) => set({ [key]: e.target.value }) }));
    const check = (label, v, on) => mk('label', { className: 'pp-check' }, mk('input', { type: 'checkbox', checked: !!v, onchange: (e) => on(e.target.checked) }), label);
    const range = (label, v, min, max, show, on) => { const b = mk('b', { textContent: show(v) }); const r = mk('input', { type: 'range', min, max, value: v, oninput: (e) => { b.textContent = show(+e.target.value); }, onchange: (e) => on(+e.target.value) }); return mk('label', {}, mk('span', {}, label + ': ', b), r); };
    const select = (label, v, opts, on) => mk('label', {}, label, mk('select', { onchange: (e) => on(e.target.value) }, opts.map(([a, b]) => mk('option', { value: a, textContent: b, selected: String(a) === String(v) }))));
    const TYPES = [...(o.none === null ? [] : [['none', o.none || 'None']]), ['solid', 'Colour'], ['gradient', 'Gradient'], ['pattern', 'Pattern'], ['picture', 'Picture']];
    const pick = async (type) => { const n = paintSwitch(f, type, o.base); if (unit === 'px' && type === 'pattern' && !(f && f.size)) n.size = 12; if (unit === 'px' && type === 'picture' && !(f && f.size)) n.size = 120; if (type === 'picture' && !n.src) { const src = await choose(); if (!src) return; n.src = src; } apply(n); };
    if (o.label) el.append(mk('span', { style: 'font-size:12px;color:var(--muted,#666)', textContent: o.label }));
    el.append(mk('div', { className: 'pp-seg', role: 'group' }, TYPES.map(([v, n]) => mk('button', { type: 'button', textContent: n, onclick: () => pick(v) }, null)).map((b, i) => { b.setAttribute('aria-pressed', String(f.type === TYPES[i][0])); return b; })));
    if (f.type === 'solid') el.append(color('Colour', 'color', f.color));
    if (f.type === 'gradient') {
      el.append(mk('div', { className: 'pp-row' }, color('From', 'c1', f.c1), color('To', 'c2', f.c2)));
      if (!f.radial) el.append(range('Angle', f.angle ?? 90, 0, 359, (v) => v + '°', (v) => set({ angle: v })));
      el.append(check('Round (from the middle out)', f.radial, (v) => set({ radial: v })));
      if (o.dither !== false) el.append(check('Smooth (dither): no colour bands', f.dither, (v) => set({ dither: v })));
    }
    if (f.type === 'pattern') {
      el.append(select('Pattern', f.pattern, PATTERNS.map(([v, n, g]) => [v, `${g}: ${n}`]), (v) => set({ pattern: v })));
      const sw = mk('div', { className: 'pp-swatch' }); sw.style.background = `url(${patternTile(f.pattern, f.fg, f.bg, 24).toDataURL()}) repeat`; sw.style.backgroundSize = '24px'; el.append(sw);
      el.append(mk('div', { className: 'pp-row' }, color('Ink', 'fg', f.fg), color('Background', 'bg', f.bg || '#ffffff')));
      el.append(check('See-through between the ink', !f.bg, (v) => set({ bg: v ? '' : '#ffffff' })));
      el.append(range('Pattern size', f.size || (unit === 'px' ? 12 : 3), 1, unit === 'px' ? 120 : 30, (v) => v + ' ' + unit, (v) => set({ size: v })));
    }
    if (f.type === 'picture') {
      el.append(select('Fit', f.fit || 'cover', [['cover', 'Fill (crop to fit)'], ['contain', 'Fit (whole picture)'], ['stretch', 'Stretch'], ['tile', 'Tile (repeat)']], (v) => set({ fit: v })));
      if (f.fit === 'tile') el.append(range('Tile width', f.size || (unit === 'px' ? 120 : 20), 3, unit === 'px' ? 1200 : 200, (v) => v + ' ' + unit, (v) => set({ size: v })));
      el.append(range('Picture strength', Math.round((f.opacity ?? 1) * 100), 5, 100, (v) => v + '%', (v) => set({ opacity: v / 100 })));
      el.append(mk('button', { type: 'button', className: 'pp-btn', textContent: 'Choose another picture…', onclick: async () => { const src = await choose(); if (src) set({ src }); } }));
    }
    return el;
  }
  // Fills as CSS (sizes in pixels). Patterns become a small repeating picture drawn at twice the size, so they stay sharp.
  const BG_PROPS = ['background', 'background-color', 'background-image', 'background-size', 'background-repeat', 'background-position', 'image-rendering'];
  function paintCss(f) {
    if (!f || f.type === 'none') return {};
    if (f.type === 'solid') return { 'background-color': f.color || '#ffffff' };
    if (f.type === 'gradient') return { 'background-image': f.radial ? `radial-gradient(circle, ${f.c1}, ${f.c2})` : `linear-gradient(${f.angle ?? 90}deg, ${f.c1}, ${f.c2})` };
    if (f.type === 'pattern') { const t = patternTile(f.pattern, f.fg, f.bg, (f.size || 12) * 2), n = t.width / 2; return { 'background-image': `url(${t.toDataURL()})`, 'background-size': `${n}px ${n}px`, 'background-repeat': 'repeat', 'image-rendering': /^dither|noise|checks/.test(f.pattern) ? 'pixelated' : '' }; }
    const veil = 1 - (f.opacity ?? 1), fit = f.fit || 'cover';
    const img = (veil > 0.01 ? `linear-gradient(rgba(255,255,255,${veil.toFixed(2)}), rgba(255,255,255,${veil.toFixed(2)})), ` : '') + `url(${f.src})`;
    return { 'background-image': img, 'background-size': fit === 'stretch' ? '100% 100%' : fit === 'tile' ? `${f.size || 120}px auto` : fit, 'background-repeat': fit === 'tile' ? 'repeat' : 'no-repeat', 'background-position': 'center' };
  }
  // Put a fill on any element (remembered in data-paint so it can be changed later).
  function setPaint(c, f) {
    BG_PROPS.forEach((k) => c.removeStyle(k));
    const css = paintCss(f); Object.keys(css).forEach((k) => { if (css[k] === '') delete css[k]; });
    if (Object.keys(css).length) c.addStyle(css);
    if (f && f.type !== 'none' && f.type !== 'solid') c.addAttributes({ 'data-paint': JSON.stringify(f) }); else c.removeAttributes('data-paint');
  }
  function readPaint(c) {
    const a = c.getAttributes(), st = c.getStyle() || {};
    try { if (a['data-paint']) return JSON.parse(a['data-paint']); } catch (e) {}
    return st['background-color'] ? { type: 'solid', color: st['background-color'] } : { type: 'none' };
  }
  // The fill inside a shape's outline, as SVG (a gradient, a pattern or a picture).
  function shapePaintDefs(f) {
    if (!f || f.type === 'none' || f.type === 'solid') return '';
    if (f.type === 'gradient') {
      if (f.radial) return `<defs><radialGradient id="pf" cx="0.5" cy="0.5" r="0.71"><stop offset="0" stop-color="${f.c1}"/><stop offset="1" stop-color="${f.c2}"/></radialGradient></defs>`;
      const a = ((f.angle ?? 90) * Math.PI) / 180;
      return `<defs><linearGradient id="pf" x1="${0.5 - Math.sin(a) / 2}" y1="${0.5 + Math.cos(a) / 2}" x2="${0.5 + Math.sin(a) / 2}" y2="${0.5 - Math.cos(a) / 2}"><stop offset="0" stop-color="${f.c1}"/><stop offset="1" stop-color="${f.c2}"/></linearGradient></defs>`;
    }
    if (f.type === 'pattern') { const t = patternTile(f.pattern, f.fg, f.bg, (f.size || 12) * 2), n = t.width / 2; return `<defs><pattern id="pf" patternUnits="userSpaceOnUse" width="${n}" height="${n}"><image href="${t.toDataURL()}" width="${n}" height="${n}" style="image-rendering:pixelated"/></pattern></defs>`; }
    const par = f.fit === 'contain' ? 'xMidYMid meet' : f.fit === 'stretch' ? 'none' : 'xMidYMid slice';
    return `<defs><pattern id="pf" patternUnits="objectBoundingBox" patternContentUnits="objectBoundingBox" width="1" height="1"><image href="${f.src}" width="1" height="1" preserveAspectRatio="${par}" opacity="${f.opacity ?? 1}"/></pattern></defs>`;
  }
  function shapeUrl(s, W = 200, H = 200) {
    const m = !s.lines && s.sw ? s.sw / 2 : 0;
    const L = shapeLayers({ ...s, stroke: s.sw ? s.stroke || '#222222' : null }, W - 2 * m, H - 2 * m, 1);
    const defs = shapePaintDefs(s.paint);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${defs}<g transform="translate(${m} ${m})">`
      + L.layers.map((l) => `<path d="${l.d}" transform="translate(${l.x} ${l.y})" fill="${defs && l.face ? 'url(#pf)' : l.fill}" stroke="${l.stroke}" stroke-width="${l.sw}" stroke-linejoin="${s.round ? 'round' : 'miter'}"/>`).join('') + '</g></svg>';
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  }
  // Read a shape's settings from its data- attributes and redraw it.
  function readShape(c) {
    const a = c.getAttributes();
    let lines = null; try { lines = a['data-lines'] ? JSON.parse(a['data-lines']) : null; } catch (e) { lines = null; }
    return { type: a['data-shape'] || 'rect', round: +a['data-round'] || 0, points: +a['data-points'] || 5, fill: a['data-fill'] ?? '#f5c518', stroke: a['data-stroke'] || '#222222', sw: a['data-sw'] != null ? +a['data-sw'] : 2,
      depth: +a['data-depth'] || 0, side: a['data-side'] || '#6b6b6b', lines, paint: (() => { try { return a['data-shape-paint'] ? JSON.parse(a['data-shape-paint']) : null; } catch (e) { return null; } })() };
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
      'data-depth': String(s.depth || 0), 'data-side': s.side || '#6b6b6b', 'data-lines': s.lines ? JSON.stringify(s.lines) : '', 'data-shape-paint': s.paint ? JSON.stringify(s.paint) : '' });
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
  // Dingbats: classic symbol characters in groups (the same set in every Craft app). They are text, so colour,
  // size, shadow, outline, gradients and rotation all work on them. DINGBAT_FONT is a list of fonts that have them.
  const DINGBAT_FONT = "'Segoe UI Symbol', 'Noto Sans Symbols 2', 'Noto Sans Symbols', 'Apple Symbols', 'DejaVu Sans', 'Arial Unicode MS', sans-serif";
  const DINGBATS = [
    ['Arrows', '← → ↑ ↓ ↔ ↕ ↖ ↗ ↘ ↙ ⇐ ⇒ ⇑ ⇓ ⇔ ➔ ➜ ➙ ➛ ➝ ➞ ➟ ➠ ➡ ➢ ➣ ➤ ➥ ➦ ➧ ➨ ➩ ➪ ➫ ➬ ➭ ➮ ➯ ➱ ➲ ➳ ➵ ➸ ➺ ➻ ➼ ➽ ➾ ↩ ↪ ↺ ↻ ⟲ ⟳'],
    ['Checks and crosses', '✓ ✔ ✗ ✘ ☐ ☑ ☒ ✕ ✖ ✚ ✛ ✜ ✙ ✠ ✟ ✞ ✝'],
    ['Stars and flowers', '★ ☆ ✦ ✧ ✩ ✪ ✫ ✬ ✭ ✮ ✯ ✰ ✱ ✲ ✳ ✴ ✵ ✶ ✷ ✸ ✹ ✺ ✻ ✼ ✽ ✾ ✿ ❀ ❁ ❂ ❃ ❄ ❅ ❆ ❇ ❈ ❉ ❊ ❋ ❖ ⁂ ※'],
    ['Hands and faces', '☚ ☛ ☜ ☝ ☞ ☟ ✌ ✍ ☺ ☻ ☹ ☠'],
    ['Shapes', '● ○ ◉ ◎ ◐ ◑ ◒ ◓ ■ □ ▪ ▫ ▬ ▭ ▮ ▯ ◆ ◇ ◈ ◊ ▲ △ ▼ ▽ ◀ ▶ ◢ ◣ ◤ ◥ ❍ ❏ ❐ ❑ ❒ ⬟ ⬢ ⬣ ⬤ ⬛ ⬜'],
    ['Hearts and cards', '♥ ♡ ❤ ❥ ❦ ❧ ❣ ♠ ♣ ♦ ♤ ♧ ♢'],
    ['Weather and nature', '☀ ☁ ☂ ☃ ☄ ☾ ☽ ❄ ⚡ ☘ ⚘ ☔ ☼ ☇ ☈'],
    ['Office and signs', '✂ ✃ ✄ ✆ ✇ ✈ ✉ ✎ ✏ ✐ ✑ ✒ ☎ ☏ ⌚ ⌛ ⚑ ⚐ ⚠ ♻ ⚙ ⚖ ⚓ ☕ ♿ ⚕ ⚛ ☮ ☯ ☸ ⚜ ☢ ☣ ⌘ ⌨ ✉'],
    ['Music and games', '♩ ♪ ♫ ♬ ♭ ♮ ♯ ⚀ ⚁ ⚂ ⚃ ⚄ ⚅ ♔ ♕ ♖ ♗ ♘ ♙ ♚ ♛ ♜ ♝ ♞ ♟'],
    ['Ornaments and quotes', '❛ ❜ ❝ ❞ ❨ ❩ ❪ ❫ ❬ ❭ ❮ ❯ ❰ ❱ ❲ ❳ ❴ ❵ ❡ ❢ § ¶ † ‡ • ‣ ◦ ⁃ ⁌ ⁍ ☙ ❦ ⸙'],
    ['Numbers', '① ② ③ ④ ⑤ ⑥ ⑦ ⑧ ⑨ ⑩ ❶ ❷ ❸ ❹ ❺ ❻ ❼ ❽ ❾ ❿ ➀ ➁ ➂ ➃ ➄ ➅ ➆ ➇ ➈ ➉ ➊ ➋ ➌ ➍ ➎ ➏ ➐ ➑ ➒ ➓'],
  ].map(([name, chars]) => [name, chars.split(/\s+/).filter(Boolean)]);
  // Colour fills for icons, pictures and text: the original, one solid colour (keeps transparency), a tint over the
  // original, a two-colour gradient at an angle, or a picture inside the shape. Works on any picture with a see-through background.
  const FILL_MODES = [['original', 'Original'], ['solid', 'One colour'], ['tint', 'Tint over it'], ['gradient', 'Gradient'], ['picture', 'Picture fill']];
  function recolorCanvas(img, f, pattern) {
    const c = document.createElement('canvas'); c.width = img.naturalWidth || img.width; c.height = img.naturalHeight || img.height;
    const x = c.getContext('2d');
    x.drawImage(img, 0, 0, c.width, c.height);
    if (!f || f.mode === 'original') return c;
    if (f.mode === 'tint') { x.globalCompositeOperation = 'source-atop'; x.globalAlpha = f.amount ?? 0.6; x.fillStyle = f.c1 || '#e8483f'; x.fillRect(0, 0, c.width, c.height); return c; }
    x.globalCompositeOperation = 'source-in';
    if (f.mode === 'gradient') {
      const a = ((f.angle ?? 90) * Math.PI) / 180, cx = c.width / 2, cy = c.height / 2, r = Math.hypot(c.width, c.height) / 2;
      const g = x.createLinearGradient(cx - Math.sin(a) * r, cy + Math.cos(a) * r, cx + Math.sin(a) * r, cy - Math.cos(a) * r);
      g.addColorStop(0, f.c1 || '#e8483f'); g.addColorStop(1, f.c2 || '#3f8be8'); x.fillStyle = g;
    } else if (f.mode === 'picture' && pattern) {
      const k = Math.max(c.width / pattern.width, c.height / pattern.height);
      x.drawImage(pattern, (c.width - pattern.width * k) / 2, (c.height - pattern.height * k) / 2, pattern.width * k, pattern.height * k); return c;
    } else x.fillStyle = f.c1 || '#222222';
    x.fillRect(0, 0, c.width, c.height);
    return c;
  }
  const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  // Colour fill for pictures with a see-through background (CSS mask: the picture file is unchanged).
  function setImageFill(c, f) {
    const src = c.getAttributes().src; if (!src) return;
    ['background', 'mask', '-webkit-mask', 'object-position'].forEach((k) => c.removeStyle(k));
    c.addAttributes({ 'data-fx': f.mode === 'original' ? '' : JSON.stringify(f) });
    if (f.mode === 'original') return;
    const a = f.angle ?? 90, alpha = Math.round((f.amount ?? 0.6) * 255).toString(16).padStart(2, '0'), mask = `url("${src}") center / 100% 100% no-repeat`;
    const bg = f.mode === 'gradient' ? `linear-gradient(${a}deg, ${f.c1}, ${f.c2})` : f.mode === 'picture' && f.src ? `url("${f.src}") center / cover no-repeat`
      : f.mode === 'tint' ? `linear-gradient(${f.c1}${alpha}, ${f.c1}${alpha}), url("${src}") center / 100% 100% no-repeat` : f.c1;
    // The picture's own pixels are moved out of view; the fill shows through the picture's shape.
    c.addStyle({ background: bg, '-webkit-mask': mask, mask, 'object-position': '-99999px -99999px' });
  }
  const readFill = (c) => { try { return JSON.parse(c.getAttributes()['data-fx'] || 'null'); } catch (e) { return null; } };
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
  // Date and time (the same in every Craft app): Word-style formats and the Insert › Date and time dialog.
  // Static = the words are typed in once. Dynamic = a field that shows the current date or time whenever it is
  // opened, printed or exported. A stamp model is { fmt, before, after }.
  const DATE_FORMATS = [
    ['short', 'Short date', (d) => d.toLocaleDateString()],
    ['long', 'Long date', (d) => d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })],
    ['mdy', 'Month day, year', (d) => d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })],
    ['mdyShort', 'Short month', (d) => d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })],
    ['dmy', 'Day month year', (d) => `${d.getDate()} ${d.toLocaleDateString(undefined, { month: 'long' })} ${d.getFullYear()}`],
    ['iso', 'Year-month-day', (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`],
    ['monthYear', 'Month and year', (d) => d.toLocaleDateString(undefined, { year: 'numeric', month: 'long' })],
    ['weekday', 'Day of the week', (d) => d.toLocaleDateString(undefined, { weekday: 'long' })],
    ['year', 'Year', (d) => String(d.getFullYear())],
    ['time', 'Time', (d) => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })],
    ['time24', 'Time (24-hour)', (d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`],
    ['timeSec', 'Time with seconds', (d) => d.toLocaleTimeString()],
    ['dateTime', 'Date and time', (d) => `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`],
    ['stampDMY', 'Stamp: 14 OCT 2026', (d) => `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()} ${d.getFullYear()}`],
    ['stampMDY', 'Stamp: OCT 14 2026', (d) => `${d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()} ${d.getDate()} ${d.getFullYear()}`],
    ['stampFull', 'Stamp: date and time', (d) => `${DATE_FORMATS[5][2](d)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`],
  ];
  const dateText = (fmt, d = new Date()) => (DATE_FORMATS.find((f) => f[0] === fmt) || DATE_FORMATS[0])[2](d);
  const stampText = (s, d = new Date()) => (s.before || '') + dateText(s.fmt, d) + (s.after || '');
  // The dialog: pick a format, add words before or after, choose fixed text or a field that updates itself.
  // Resolves to { fmt, before, after, dynamic, text } or null. `dynamicNote` explains what "updates" means in this app.
  function dateDialog({ title = 'Date and time', fmt = 'long', before = '', after = '', dynamic = false, allowDynamic = true, dynamicNote = 'Shows the current date or time every time you open, print or export.' } = {}) {
    return new Promise((res) => {
      if (!document.getElementById('dt-style')) {
        const st = document.createElement('style'); st.id = 'dt-style';
        st.textContent = '.dt-bd{position:fixed;inset:0;background:rgba(0,0,0,.4);display:grid;place-items:center;z-index:100000}'
          + '.dt-dlg{background:var(--panel,#fff);color:var(--fg,#222);border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.3);width:min(560px,94vw);max-height:90vh;overflow:auto;padding:18px 20px;font:14px/1.4 system-ui,"Segoe UI",sans-serif}'
          + '.dt-dlg h2{margin:0 0 12px;font-size:17px}.dt-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}'
          + '.dt-list{border:1px solid var(--line,#ccc);border-radius:8px;max-height:300px;overflow:auto;padding:4px}'
          + '.dt-list button{display:block;width:100%;text-align:left;border:0;background:none;color:inherit;padding:5px 8px;border-radius:5px;cursor:pointer;font:inherit}'
          + '.dt-list button:hover{background:var(--panel-2,#f1f1f1)}.dt-list button[aria-pressed=true]{background:var(--accent,#2f6fdd);color:#fff}'
          + '.dt-dlg label{display:grid;gap:3px;font-size:12px;color:var(--muted,#666);margin-bottom:10px}'
          + '.dt-dlg input[type=text]{height:30px;padding:0 8px;border:1px solid var(--line,#ccc);border-radius:6px;background:var(--panel,#fff);color:var(--fg,#222);font:inherit}'
          + '.dt-dlg .dt-check{display:flex;gap:8px;align-items:flex-start;font-size:13px;color:inherit}.dt-prev{padding:10px;border:1px dashed var(--line,#ccc);border-radius:8px;font-size:15px;min-height:22px;word-break:break-word}'
          + '.dt-acts{display:flex;justify-content:flex-end;gap:8px;margin-top:14px}.dt-acts button{min-width:80px;height:32px;border-radius:7px;border:1px solid var(--line,#ccc);background:var(--panel-2,#f4f4f4);color:inherit;cursor:pointer;font:inherit}'
          + '.dt-acts .dt-ok{background:var(--accent,#2f6fdd);border-color:var(--accent,#2f6fdd);color:#fff}@media(max-width:560px){.dt-grid{grid-template-columns:1fr}}';
        document.head.append(st);
      }
      const now = new Date(), esc2 = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
      const bd = document.createElement('div'); bd.className = 'dt-bd';
      bd.innerHTML = `<div class="dt-dlg" role="dialog" aria-modal="true" aria-label="${esc2(title)}"><h2>${esc2(title)}</h2><div class="dt-grid">
        <div><div class="dt-list" role="listbox" aria-label="Format">${DATE_FORMATS.map(([k, n, f]) => `<button type="button" data-f="${k}" aria-pressed="${k === fmt}" title="${esc2(n)}">${esc2(f(now))}</button>`).join('')}</div></div>
        <div><label>Words before<input type="text" data-b value="${esc2(before)}" placeholder="e.g. Printed on "></label><label>Words after<input type="text" data-a value="${esc2(after)}"></label>
        ${allowDynamic ? `<label class="dt-check"><input type="checkbox" data-dyn ${dynamic ? 'checked' : ''}><span><b>Update automatically</b><br><small>${esc2(dynamicNote)} Leave it off to type it in as fixed text.</small></span></label>` : ''}
        <label>Preview</label><div class="dt-prev" data-p></div></div></div>
        <div class="dt-acts"><button type="button" data-x>Cancel</button><button type="button" class="dt-ok" data-ok>Insert</button></div></div>`;
      document.body.append(bd);
      let f = fmt;
      const B = bd.querySelector('[data-b]'), A = bd.querySelector('[data-a]'), D = bd.querySelector('[data-dyn]');
      const prev = () => { bd.querySelector('[data-p]').textContent = stampText({ fmt: f, before: B.value, after: A.value }) + (D && D.checked ? '  (updates itself)' : ''); };
      bd.querySelectorAll('[data-f]').forEach((b) => { b.onclick = () => { f = b.dataset.f; bd.querySelectorAll('[data-f]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); prev(); }; b.ondblclick = () => bd.querySelector('[data-ok]').click(); });
      [B, A].forEach((i) => { i.oninput = prev; }); if (D) D.onchange = prev; prev();
      const done = (v) => { bd.remove(); res(v); };
      bd.querySelector('[data-x]').onclick = () => done(null);
      bd.querySelector('[data-ok]').onclick = () => { const s = { fmt: f, before: B.value, after: A.value }; done({ ...s, dynamic: !!(D && D.checked), text: stampText(s) }); };
      bd.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Escape') done(null); if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') bd.querySelector('[data-ok]').click(); });
      bd.onclick = (e) => { if (e.target === bd) done(null); };
      const sel = bd.querySelector('[aria-pressed=true]') || bd.querySelector('[data-f]'); sel.focus(); sel.scrollIntoView({ block: 'nearest' });
    });
  }
  // Insert › Date and time. Fixed words go in as text. "Update automatically" makes a <time data-widget="date"> that the
  // published page fills in with the visitor's date or time (the script is added when a page uses it).
  const timeHtml = (r) => `${escA(r.before || '')}<time data-widget="date" data-fmt="${r.fmt}" datetime="${new Date().toISOString()}">${escA(dateText(r.fmt))}</time>${escA(r.after || '')}`;
  A['ins-date'] = async () => {
    const ed = SC.editor, editing = ed.getEditing(), doc = SC.fdoc && SC.fdoc();
    const sel = editing && doc ? doc.getSelection() : null, range = sel && sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null;
    const r = await dateDialog({ dynamicNote: 'On the published page it shows each visitor today’s date or the time.' });
    if (!r) return;
    const html = r.dynamic ? timeHtml(r) : escA(r.text);
    if (editing && range) {
      const s2 = doc.getSelection(); s2.removeAllRanges(); s2.addRange(range);
      doc.execCommand('insertHTML', false, html);
    } else SC.insertBlock(`<p>${html}</p>`);
  };
  // In the editor the date shows today's date too (refreshed when SiteCraft opens).
  SC.editor.on('load', () => setTimeout(() => SC.editor.getWrapper().find('[data-widget="date"]').forEach((c) => { const t = dateText(c.getAttributes()['data-fmt']); if (c.getEl() && c.getEl().textContent !== t) c.components(t); }), 400));
  A['ins-curve'] = () => curveDialog({}, (r) => SC.insertBlock(curveHtml({ text: r.text, dir: r.dir, r: 120, rot: 0, span: 0, font: 'Arial', size: 28, bold: true, italic: false, color: '#c2185b', spacing: 80 })));
  Object.assign(SC, { paintPicker, paintCss, setPaint, readPaint, DINGBATS, DINGBAT_FONT, FILL_MODES, setImageFill, readFill, SHAPES, shapePath, isShape, readShape, setShape, defaultLines, CURVE_FONTS, isCurve, readCurve, setCurve, curveDialog });
})();
