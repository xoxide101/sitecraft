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
  function shapeUrl(type, round, points, fill, stroke, sw) {
    const m = sw ? 1.5 : 0, d = shapePath(type, 100 - 2 * m, 100 - 2 * m, round, points);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${d}" transform="translate(${m} ${m})" fill="${fill || 'none'}" stroke="${sw ? stroke || '#222222' : 'none'}" stroke-width="${sw}" vector-effect="non-scaling-stroke" stroke-linejoin="${round ? 'round' : 'miter'}"/></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  }
  // Read a shape's settings from its data- attributes and redraw it.
  function readShape(c) {
    const a = c.getAttributes();
    return { type: a['data-shape'] || 'rect', round: +a['data-round'] || 0, points: +a['data-points'] || 5, fill: a['data-fill'] ?? '#f5c518', stroke: a['data-stroke'] || '#222222', sw: a['data-sw'] != null ? +a['data-sw'] : 2 };
  }
  function shapeStyle(s) {
    const [, cy, tw] = shapeTextBox(s.type), side = ((1 - tw) / 2) * 100;
    return { 'background-image': shapeUrl(s.type, s.round, s.points, s.fill, s.stroke, s.sw), 'background-size': '100% 100%', 'background-repeat': 'no-repeat',
      'padding-left': side.toFixed(1) + '%', 'padding-right': side.toFixed(1) + '%', 'padding-top': (Math.max(0, cy - 0.5) * 60).toFixed(1) + '%' };
  }
  function setShape(c, patch) {
    const s = { ...readShape(c), ...patch };
    c.addAttributes({ 'data-shape': s.type, 'data-round': String(s.round), 'data-points': String(s.points), 'data-fill': s.fill || '', 'data-stroke': s.stroke, 'data-sw': String(s.sw) });
    c.addStyle(shapeStyle(s));
  }
  const isShape = (c) => !!c && c.getClasses().includes('sc-shape');
  function shapeHtml(type) {
    const s = { type, round: type === 'rounded' ? 30 : 0, points: 5, fill: '#f5c518', stroke: '#222222', sw: 2 };
    if (type === 'rounded') s.type = 'rect';
    const wide = ['rect', 'arrow'].includes(s.type);
    const st = { width: wide ? '260px' : '200px', 'min-height': wide ? '140px' : '200px', display: 'flex', 'flex-direction': 'column', 'justify-content': 'center', 'text-align': 'center', 'box-sizing': 'border-box', margin: '16px auto', 'font-family': 'Arial, sans-serif', 'font-size': '18px', ...shapeStyle(s) };
    const css = Object.entries(st).map(([k, v]) => `${k}:${v}`).join(';').replace(/"/g, "'");
    return `<div class="sc-shape" data-shape="${s.type}" data-round="${s.round}" data-points="5" data-fill="${s.fill}" data-stroke="${s.stroke}" data-sw="${s.sw}" style="${css}">Your words</div>`;
  }
  SHAPES.filter(([t]) => t !== 'line').forEach(([t]) => { A['ins-shape-' + t] = () => SC.insertBlock(shapeHtml(t)); });
  A['ins-shape-rounded'] = () => SC.insertBlock(shapeHtml('rounded'));
  A['ins-textbox'] = () => SC.insertBlock('<div class="sc-textbox" style="border:1px solid #555555;border-radius:0;padding:16px;background-color:#ffffff;max-width:380px;margin:16px auto;line-height:1.5">Type here. Words wrap inside the box. Change its border, background, corners, padding and shadow in Quick styles.</div>');
  Object.assign(SC, { SHAPES, shapePath, isShape, readShape, setShape });
})();
