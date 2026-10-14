/* SiteCraft pages, templates and the Backstage (File) screen.
   Pages panel: a site with several pages. Templates: built-in starting points plus your own saved ones.
   Uses window.SC, which the main script sets up. */
(function () {
  'use strict';
  const SC = window.SC;
  const { editor, mk, toast, dialog, field, ask } = SC;
  const A = SC.actions;
  const Pages = editor.Pages;
  const inFrame = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
  const slug = (s) => String(s || 'page').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'page';

  // =====================================================================
  // Built-in templates
  // =====================================================================
  const BASE = '*{box-sizing:border-box}body{margin:0;line-height:1.5}img{max-width:100%;display:block}';
  const img = (w, h, bg, fg, label) => 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="${bg}"/><circle cx="${w * 0.3}" cy="${h * 0.38}" r="${h * 0.12}" fill="${fg}" opacity=".5"/><path d="M0 ${h} L${w * 0.4} ${h * 0.55} L${w * 0.65} ${h * 0.8} L${w * 0.8} ${h * 0.65} L${w} ${h} Z" fill="${fg}" opacity=".6"/><text x="50%" y="${h - 16}" text-anchor="middle" font-family="sans-serif" font-size="14" fill="${fg}">${label}</text></svg>`);
  const TEMPLATES = [
    { id: 'blank', name: 'Blank page', desc: 'Start from nothing.', html: '', css: 'body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#222}' },
    { id: 'bakery', name: 'Bakery', desc: 'A warm small-business site.', html: SC.starter, css: SC.starterCss },
    { id: 'business', name: 'Business', desc: 'Services, reasons and a call to action.', html: `
<header class="top"><b class="brand">Northwind Studio</b><nav><a href="#services">Services</a><a href="#why">Why us</a><a href="#contact" class="cta">Get a quote</a></nav></header>
<section class="hero"><h1>Websites that bring in customers</h1><p>We design, build and look after websites for small businesses, so you can get on with running yours.</p><a class="cta big" href="#contact">Book a free call</a></section>
<section id="services" class="grid"><div class="card"><h3>Design</h3><p>A clear, friendly look that fits your brand.</p></div><div class="card"><h3>Build</h3><p>Fast pages that work on every phone.</p></div><div class="card"><h3>Care</h3><p>Updates, backups and help when you need it.</p></div></section>
<section id="why" class="why"><h2>Why people choose us</h2><ul><li>Fixed prices, no surprises</li><li>Ready in two weeks</li><li>Real people answer the phone</li></ul></section>
<footer id="contact" class="foot"><p>hello@northwind.example · (555) 010-2030</p></footer>`,
      css: BASE + 'body{font-family:"Segoe UI",system-ui,sans-serif;color:#1d2330;background:#fff}.top{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;padding:18px 6%}.brand{font-size:20px}.top nav{display:flex;gap:20px;align-items:center}.top a{color:#1d2330;text-decoration:none}.cta{background:#2f5bea;color:#fff !important;padding:9px 16px;border-radius:8px;text-decoration:none;font-weight:600}.cta.big{display:inline-block;padding:14px 22px;font-size:17px}.hero{padding:70px 6% 80px;background:linear-gradient(135deg,#eef2ff,#fdf2f8)}.hero h1{font-size:46px;line-height:1.1;max-width:14em;margin:0 0 16px}.hero p{font-size:19px;max-width:34em;color:#4b5563;margin:0 0 26px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;padding:60px 6%}.card{padding:24px;border:1px solid #e5e7eb;border-radius:12px}.card h3{margin:0 0 6px}.why{padding:20px 6% 60px}.why li{margin:6px 0;font-size:17px}.foot{padding:28px 6%;background:#1d2330;color:#cbd5e1}' },
    { id: 'portfolio', name: 'Portfolio', desc: 'Show your work in a picture grid.', html: `
<header class="me"><h1>Sam Rivera</h1><p>Photographer and illustrator · Lisbon</p></header>
<section class="work"><figure><img src="${img(600, 420, '#fde68a', '#b45309', 'Project one')}" alt="Project one"><figcaption>Harbour at dawn</figcaption></figure><figure><img src="${img(600, 420, '#bfdbfe', '#1d4ed8', 'Project two')}" alt="Project two"><figcaption>City in blue</figcaption></figure><figure><img src="${img(600, 420, '#fbcfe8', '#be185d', 'Project three')}" alt="Project three"><figcaption>Flower market</figcaption></figure><figure><img src="${img(600, 420, '#bbf7d0', '#15803d', 'Project four')}" alt="Project four"><figcaption>Green hills</figcaption></figure></section>
<section class="about"><h2>About</h2><p>I make calm, colourful pictures for books, brands and magazines. Say hello at sam@example.com.</p></section>`,
      css: BASE + 'body{font-family:Georgia,serif;color:#222;background:#faf8f5}.me{padding:60px 6% 30px;text-align:center}.me h1{font-size:52px;margin:0}.me p{color:#777;font-family:Arial,sans-serif}.work{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:22px;padding:20px 6% 50px}.work figure{margin:0}.work img{border-radius:8px}.work figcaption{font-family:Arial,sans-serif;font-size:14px;color:#666;margin-top:8px}.about{max-width:640px;margin:0 auto;padding:10px 6% 70px;text-align:center}' },
    { id: 'blog', name: 'Blog article', desc: 'A long read with a clean column.', html: `
<article class="post"><p class="kicker">Gardening · 6 minute read</p><h1>How to grow tomatoes on a balcony</h1><p class="byline">By Lee Park · 12 May</p><img src="${img(900, 440, '#dcfce7', '#166534', 'A balcony full of tomato plants')}" alt="Tomato plants on a sunny balcony"><p>Tomatoes love sun, warmth and a steady drink of water. Even a small balcony can give you a summer of fruit if you pick the right variety.</p><h2>Pick a small variety</h2><p>Cherry and patio tomatoes stay compact and fruit early. Look for names like “Tumbling Tom” or “Balconi Red”.</p><blockquote>Water in the morning, never at night.</blockquote><h2>Feed them every week</h2><p>Once the first flowers appear, give a tomato feed every week and keep the pots evenly moist.</p></article>`,
      css: BASE + 'body{font-family:Georgia,serif;color:#1f2937;background:#fff}.post{max-width:700px;margin:0 auto;padding:60px 22px 80px}.kicker{font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:.1em;font-size:12px;color:#16a34a;margin:0}.post h1{font-size:42px;line-height:1.15;margin:8px 0}.byline{font-family:Arial,sans-serif;color:#6b7280;font-size:14px}.post img{border-radius:10px;margin:24px 0}.post p{font-size:19px;line-height:1.7}.post h2{margin-top:34px}.post blockquote{border-left:4px solid #16a34a;margin:26px 0;padding:6px 0 6px 18px;font-size:22px;font-style:italic}' },
    { id: 'event', name: 'Event', desc: 'A date, a place and a big button.', html: `
<section class="ev"><p class="when">Saturday 14 June · 10am to 4pm</p><h1>Summer Street Fair</h1><p class="where">Mill Street, Springfield</p><a class="go" href="#tickets">Get free tickets</a></section>
<section class="info"><div><h3>Food</h3><p>Twenty local stalls, from tacos to doughnuts.</p></div><div><h3>Music</h3><p>Live bands on two stages all day.</p></div><div><h3>Kids</h3><p>Face painting, games and a bouncy castle.</p></div></section>`,
      css: BASE + 'body{font-family:"Trebuchet MS",sans-serif;color:#2e1065;background:#fff7ed}.ev{text-align:center;padding:90px 6%;background:linear-gradient(135deg,#f97316,#db2777);color:#fff}.when{font-weight:700;letter-spacing:.05em;margin:0}.ev h1{font-size:64px;margin:10px 0;line-height:1}.where{font-size:20px;margin:0 0 26px}.go{display:inline-block;background:#fff;color:#db2777;font-weight:700;padding:15px 26px;border-radius:999px;text-decoration:none;font-size:18px}.info{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;padding:50px 6%}.info div{background:#fff;padding:22px;border-radius:14px;box-shadow:0 6px 18px rgba(219,39,119,.12)}.info h3{margin:0 0 6px;color:#db2777}' },
    { id: 'resume', name: 'Résumé', desc: 'A one-page CV that prints well.', html: `
<main class="cv"><header><h1>Jordan Ellis</h1><p>Project coordinator · jordan@example.com · (555) 010-4455</p></header><section><h2>Experience</h2><h3>Project coordinator, Bright Homes <small>2021 – now</small></h3><ul><li>Ran 40+ home renovation projects on time and on budget</li><li>Introduced a scheduling system used by the whole team</li></ul><h3>Office assistant, Green &amp; Co <small>2018 – 2021</small></h3><ul><li>Handled bookings, invoices and supplier orders</li></ul></section><section><h2>Skills</h2><p>Scheduling · Budgets · Customer care · Spreadsheets · First aid</p></section><section><h2>Education</h2><p>Diploma in Business Administration, Springfield College, 2018</p></section></main>`,
      css: BASE + 'body{font-family:"Segoe UI",system-ui,sans-serif;color:#111827;background:#f3f4f6}.cv{max-width:760px;margin:30px auto;background:#fff;padding:44px 48px;box-shadow:0 4px 18px rgba(0,0,0,.08)}.cv h1{margin:0;font-size:36px}.cv header p{color:#4b5563;margin:4px 0 0}.cv h2{font-size:14px;text-transform:uppercase;letter-spacing:.12em;color:#2563eb;border-bottom:2px solid #dbeafe;padding-bottom:4px;margin-top:30px}.cv h3{font-size:17px;margin:14px 0 4px}.cv small{font-weight:400;color:#6b7280}' },
    { id: 'soon', name: 'Coming soon', desc: 'A teaser page with a countdown feel.', html: `
<section class="soon"><p class="badge">Opening soon</p><h1>Something tasty is coming</h1><p>We are putting the finishing touches on our new café. Leave your email and we will tell you first.</p><form class="sign"><input type="email" placeholder="you@example.com" aria-label="Email"><button type="submit">Notify me</button></form></section>`,
      css: BASE + 'body{font-family:"Segoe UI",system-ui,sans-serif;color:#fff;background:#0f172a}.soon{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px 6%;background:radial-gradient(circle at 30% 20%,#7c3aed,transparent 50%),radial-gradient(circle at 80% 80%,#db2777,transparent 45%),#0f172a}.badge{border:1px solid rgba(255,255,255,.4);border-radius:999px;padding:6px 14px;font-size:13px;letter-spacing:.08em;text-transform:uppercase}.soon h1{font-size:52px;line-height:1.1;margin:16px 0;max-width:12em}.soon p{color:#cbd5e1;max-width:30em;font-size:18px}.sign{display:flex;gap:8px;margin-top:18px;flex-wrap:wrap;justify-content:center}.sign input{padding:13px 14px;border-radius:10px;border:0;min-width:260px;font:inherit}.sign button{padding:13px 20px;border-radius:10px;border:0;background:#f472b6;color:#fff;font-weight:700;font:inherit}' },
  ];
  SC.TEMPLATES = TEMPLATES;

  // Your own templates live in this browser (IndexedDB), so they survive closing SiteCraft.
  const store = {
    p: null,
    open() { return this.p || (this.p = new Promise((res, rej) => { const r = indexedDB.open('sitecraft', 1); r.onupgradeneeded = () => r.result.createObjectStore('templates', { keyPath: 'id' }); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); })); },
    async run(mode, fn) { const db = await this.open(); return new Promise((res, rej) => { const q = fn(db.transaction('templates', mode).objectStore('templates')); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); },
    all() { return this.run('readonly', (s) => s.getAll()).catch(() => []); },
    put(t) { return this.run('readwrite', (s) => s.put(t)); },
    del(id) { return this.run('readwrite', (s) => s.delete(id)); },
  };
  function currentPageContent() {
    const comp = Pages.getSelected().getMainComponent();
    return { html: editor.getHtml({ component: comp }).replace(/^<body[^>]*>|<\/body>$/g, ''), css: editor.getCss({ component: comp }) };
  }
  A['save-template'] = () => {
    const name = mk('input', { type: 'text', value: SC.pageMeta(Pages.getSelected()).title || 'My template' });
    const desc = mk('input', { type: 'text', placeholder: 'What it is for (optional)' });
    dialog({ title: 'Save as a template', body: [mk('p', { textContent: 'Saves this page’s design so you can start new pages from it. Templates are kept in this browser.' }), field('Template name', name), field('Description', desc)],
      actions: [{ label: 'Cancel' }, { label: 'Save template', primary: true, run: async () => {
        if (!name.value.trim()) { toast('Give the template a name.'); return false; }
        await store.put({ id: 'my-' + Date.now(), name: name.value.trim(), desc: desc.value.trim(), ...currentPageContent(), saved: Date.now() });
        toast(`Saved the template “${name.value.trim()}”.`);
      } }] });
  };

  // Template thumbnails are the real page, shrunk.
  function thumb(t) {
    const f = mk('iframe', { title: t.name, tabIndex: -1, loading: 'lazy' });
    f.setAttribute('sandbox', '');
    f.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><style>${t.css || ''}</style></head><body>${t.html || '<p style="font:16px sans-serif;color:#aaa;padding:40px">Blank page</p>'}</body></html>`;
    return mk('div', { className: 'tpl-thumb' }, f);
  }
  function templateCard(t, onPick, onDelete) {
    const card = mk('button', { className: 'tpl', type: 'button', title: t.desc || t.name, onclick: () => onPick(t) }, thumb(t), mk('b', { textContent: t.name }), mk('span', { textContent: t.desc || (t.saved ? 'Saved ' + new Date(t.saved).toLocaleDateString() : '') }));
    if (onDelete) card.append(mk('span', { className: 'tpl-del', role: 'button', textContent: 'Delete', onclick: (e) => { e.stopPropagation(); onDelete(t); } }));
    return card;
  }
  async function templateGrid(onPick, { mine = true } = {}) {
    const wrap = mk('div');
    const grid = mk('div', { className: 'tpl-grid' }, TEMPLATES.map((t) => templateCard(t, onPick)));
    wrap.append(grid);
    if (mine) {
      const saved = (await store.all()).sort((a, b) => b.saved - a.saved);
      const h = mk('h2', { textContent: 'My templates' });
      const g2 = mk('div', { className: 'tpl-grid' });
      const draw = (list) => {
        g2.textContent = '';
        if (!list.length) g2.append(mk('p', { className: 'lead', textContent: 'None yet. Use “Save as template” to keep a page design for later.' }));
        list.forEach((t) => g2.append(templateCard(t, onPick, async (x) => {
          if (!(await ask({ title: `Delete the template “${x.name}”?`, body: 'This removes it from this browser. Pages made from it are not affected.', ok: 'Delete', danger: true }))) return;
          await store.del(x.id); draw((await store.all()).sort((a, b) => b.saved - a.saved));
        })));
      };
      draw(saved);
      wrap.append(h, g2);
    }
    return wrap;
  }
  // Start a page from a template: replace this page, or add it as a new page of the site.
  function useTemplate(t) {
    closeBackstage();
    dialog({ title: `Use “${t.name}”`, body: [mk('p', { textContent: 'Replace the page you are working on, or add this as a new page to your site?' })],
      actions: [{ label: 'Cancel' }, { label: 'Add as a new page', run: () => addPage(t.name, t.html, t.css) },
        { label: 'Replace this page', primary: true, run: async () => {
          if (!(await ask({ title: 'Replace this page?', body: 'Everything on the current page is replaced by the template. You can undo with Ctrl+Z.', ok: 'Replace page', danger: true }))) return;
          editor.select(null); editor.setComponents(t.html || ''); editor.setStyle(t.css || SC.blankCss);
          toast(`Started from the ${t.name} template.`); SC.countSoon();
        } }] });
  }
  A.templates = async () => {
    const body = await templateGrid(useTemplate);
    dialog({ title: 'Templates', wide: true, body: [mk('p', { textContent: 'Pick a design to start from. Built-in templates are first; yours follow.' }), body], actions: [{ label: 'Close' }] });
  };

  // =====================================================================
  // Pages panel: the pages of the site, like a site tree
  // =====================================================================
  const pagesEl = document.getElementById('pages');
  function fileName(pg) {
    const all = Pages.getAll(), i = all.indexOf(pg), m = SC.settings.pages[pg.getId()] || {};
    if (m.file) return /\.html?$/i.test(m.file) ? m.file : m.file + '.html';
    return i === 0 ? 'index.html' : slug(pg.getName()) + '.html';
  }
  SC.pageFile = fileName;
  function addPage(name, html, css) {
    const pg = Pages.add({ name: name || 'New page', component: html || '', styles: css || '' });
    Pages.select(pg);
    toast(`Added the page “${pg.getName()}”.`);
    renderPages();
    return pg;
  }
  A['new-page'] = () => {
    const name = mk('input', { type: 'text', value: `Page ${Pages.getAll().length + 1}` });
    const from = mk('select', { className: 'rb-sel', style: 'max-width:none;height:32px' }, mk('option', { value: 'blank', textContent: 'Blank page' }), mk('option', { value: 'copy', textContent: 'A copy of this page' }),
      ...TEMPLATES.filter((t) => t.id !== 'blank').map((t) => mk('option', { value: t.id, textContent: 'Template: ' + t.name })));
    dialog({ title: 'New page', body: [field('Page name', name), field('Start from', from)],
      actions: [{ label: 'Cancel' }, { label: 'Add page', primary: true, run: () => {
        const n = name.value.trim() || 'New page';
        if (from.value === 'copy') { const c = currentPageContent(); addPage(n, c.html, c.css); }
        else { const t = TEMPLATES.find((x) => x.id === from.value) || TEMPLATES[0]; addPage(n, t.html, t.css); }
      } }] });
  };
  function renderPages() {
    if (!pagesEl) return;
    const cur = Pages.getSelected();
    pagesEl.textContent = '';
    const list = mk('div', { className: 'pages' });
    Pages.getAll().forEach((pg, i) => {
      const row = mk('div', { className: 'page-row' + (pg === cur ? ' on' : ''), title: 'Open this page', onclick: () => { if (pg !== Pages.getSelected()) { editor.select(null); Pages.select(pg); } } },
        mk('span', { textContent: i === 0 ? '🏠' : '📄', 'aria-hidden': 'true' }),
        mk('b', { textContent: pg.getName() || 'Page' }), mk('small', { textContent: fileName(pg) }),
        mk('button', { title: 'Rename', 'aria-label': 'Rename ' + pg.getName(), textContent: '✎', onclick: (e) => { e.stopPropagation(); renamePage(pg); } }),
        mk('button', { title: 'Copy the link to this page', 'aria-label': 'Copy link', textContent: '🔗', onclick: (e) => { e.stopPropagation(); navigator.clipboard.writeText(fileName(pg)).then(() => toast(`Copied “${fileName(pg)}”. Paste it as a link address.`), () => toast(`Link this page as: ${fileName(pg)}`)); } }),
        Pages.getAll().length > 1 ? mk('button', { title: 'Delete page', 'aria-label': 'Delete ' + pg.getName(), textContent: '✕', onclick: (e) => { e.stopPropagation(); deletePage(pg); } }) : null);
      list.append(row);
    });
    pagesEl.append(mk('p', { className: 'pane-hint', textContent: 'The pages of your site. The first one is the home page (index.html). Link pages together with their file names.' }), list,
      mk('div', { className: 'pages-actions' },
        mk('button', { className: 'btn', textContent: '+ New page', onclick: A['new-page'] }),
        mk('button', { className: 'btn', textContent: 'Duplicate', onclick: () => { const c = currentPageContent(); addPage(Pages.getSelected().getName() + ' copy', c.html, c.css); } }),
        mk('button', { className: 'btn', textContent: 'Page properties', onclick: () => A['page-props']() }),
        mk('button', { className: 'btn', textContent: 'Save site…', onclick: saveSite }),
        mk('button', { className: 'btn', textContent: 'Open site…', onclick: openSite })));
  }
  SC.refreshPages = renderPages;
  function renamePage(pg) {
    const n = mk('input', { type: 'text', value: pg.getName() });
    dialog({ title: 'Rename page', body: [field('Page name', n)], actions: [{ label: 'Cancel' }, { label: 'Rename', primary: true, run: () => { pg.set('name', n.value.trim() || pg.getName()); SC.saveSettings(); renderPages(); } }] });
  }
  async function deletePage(pg) {
    if (!(await ask({ title: `Delete the page “${pg.getName()}”?`, body: 'The page and everything on it are removed from the site.', ok: 'Delete page', danger: true }))) return;
    if (pg === Pages.getSelected()) Pages.select(Pages.getAll().find((p) => p !== pg));
    Pages.remove(pg); delete SC.settings.pages[pg.getId()]; SC.saveSettings(); renderPages();
  }
  ['page:add', 'page:remove', 'page:select', 'page:update'].forEach((ev) => editor.on(ev, () => setTimeout(renderPages, 0)));
  editor.on('page:select', () => { SC.countSoon(); SC.refreshSoon(); });
  editor.on('load', () => {
    const first = Pages.getAll()[0];
    if (first && !first.getName()) first.set('name', 'Home');
    renderPages();
  });

  // Save every page into a folder (index.html, about.html, …), or open a folder of pages.
  async function saveSite() {
    SC.stopEditing();
    const pages = Pages.getAll();
    if (!window.showDirectoryPicker || inFrame) {
      pages.forEach((pg) => {
        const url = URL.createObjectURL(new Blob([SC.fullHtml(pg)], { type: 'text/html' }));
        const a = mk('a', { href: url, download: fileName(pg) }); document.body.append(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      });
      toast(`Downloaded ${pages.length} page${pages.length === 1 ? '' : 's'}. Keep them in one folder.`);
      return;
    }
    try {
      const dir = await window.showDirectoryPicker({ id: 'sitecraft-site', mode: 'readwrite' });
      for (const pg of pages) {
        const w = await (await dir.getFileHandle(fileName(pg), { create: true })).createWritable();
        await w.write(SC.fullHtml(pg)); await w.close();
      }
      SC.setDirty(false);
      toast(`Saved ${pages.length} page${pages.length === 1 ? '' : 's'} to the ${dir.name} folder.`);
    } catch (e) { if (e.name !== 'AbortError') toast('Could not save the site: ' + e.message); }
  }
  async function openSite() {
    if (!window.showDirectoryPicker || inFrame) { toast('Opening a whole folder needs Chrome or Edge. Use File › Open for one page.'); return; }
    let dir;
    try { dir = await window.showDirectoryPicker({ id: 'sitecraft-site' }); } catch (e) { return; }
    const files = [];
    for await (const [name, h] of dir.entries()) if (h.kind === 'file' && /\.html?$/i.test(name)) files.push([name, h]);
    if (!files.length) { toast('That folder has no .html pages.'); return; }
    files.sort((a, b) => (/^index\./i.test(a[0]) ? -1 : /^index\./i.test(b[0]) ? 1 : a[0].localeCompare(b[0])));
    if (!(await ask({ title: `Open ${files.length} page${files.length === 1 ? '' : 's'} from “${dir.name}”?`, body: 'The pages you are working on now are replaced by the pages in that folder.', ok: 'Open site' }))) return;
    const old = Pages.getAll().slice();
    editor.select(null);
    for (const [name, h] of files) {
      const text = await (await h.getFile()).text();
      const { html, css } = SC.parseHtmlFile(text);
      const title = (new DOMParser().parseFromString(text, 'text/html').querySelector('title') || {}).textContent || name.replace(/\.html?$/i, '');
      const pg = Pages.add({ name: title, component: html, styles: css });
      SC.settings.pages[pg.getId()] = { ...(SC.settings.pages[pg.getId()] || {}), title, file: name };
    }
    Pages.select(Pages.getAll()[old.length]);
    old.forEach((p) => Pages.remove(p));
    SC.setDocName(dir.name); SC.saveSettings(); renderPages();
    toast(`Opened ${files.length} page${files.length === 1 ? '' : 's'} from ${dir.name}.`);
  }
  A['save-site'] = saveSite;
  A['open-site'] = openSite;

  // =====================================================================
  // Site menu: a navigation bar listing every page. It updates itself when pages are added, renamed
  // or removed, and marks the page you are on. Ctrl+click a menu link in the editor to open that page.
  // =====================================================================
  const NAV_CSS = '<style>.sc-sitenav{display:flex;flex-wrap:wrap;gap:6px 22px;align-items:center;padding:14px 6%;font-family:Arial,Helvetica,sans-serif}.sc-sitenav a{color:inherit;text-decoration:none;padding:4px 2px;border-bottom:2px solid transparent}.sc-sitenav a.active{border-bottom-color:currentColor;font-weight:700}</style>';
  const navLinks = (forPage) => Pages.getAll().map((pg) => `<a href="${SC.esc(fileName(pg))}"${pg === forPage ? ' class="active" aria-current="page"' : ''}>${SC.esc(pg.getName() || 'Page')}</a>`).join('');
  const navHtml = (forPage) => `<nav class="sc-sitenav" data-sitenav="1" aria-label="Site">${navLinks(forPage)}</nav>`;
  // find() only searches the page on screen, so walk the page's objects instead.
  const navsIn = (pg) => { const out = []; pg.getMainComponent().onAll((c) => { if (c.getAttributes()['data-sitenav']) out.push(c); }); return out; };
  function updateSiteNavs(announce) {
    let n = 0;
    Pages.getAll().forEach((pg) => navsIn(pg).forEach((nav) => {
      const html = navLinks(pg);
      if (nav.getInnerHTML() !== html) { nav.components(html); n++; }
    }));
    if (announce) toast(n ? 'Site menus updated from your pages.' : 'Site menus already list every page.');
  }
  SC.updateSiteNavs = updateSiteNavs;
  A.sitenav = async () => {
    const pg = Pages.getSelected();
    if (!navsIn(pg).length) SC.insertBlock(navHtml(pg) + NAV_CSS, { top: !editor.getSelected() });
    const others = Pages.getAll().filter((p) => p !== pg && !navsIn(p).length);
    if (others.length && (await ask({ title: 'Put the menu on every page?', body: `Add the same menu to the top of the other ${others.length} page${others.length === 1 ? '' : 's'} too? New pages get it automatically.`, ok: 'Add to every page' }))) {
      others.forEach((p) => p.getMainComponent().append(navHtml(p), { at: 0 }));
      toast('The site menu is on every page.');
    } else if (!others.length) toast('Site menu added. It lists every page and updates itself.');
  };
  // New pages join the menu, and get one themselves when the rest of the site has it.
  editor.on('page:add', (pg) => setTimeout(() => {
    if (!pg || !pg.getMainComponent) return;
    const siteHasMenu = Pages.getAll().some((p) => p !== pg && navsIn(p).length);
    if (siteHasMenu && !navsIn(pg).length) pg.getMainComponent().append(navHtml(pg), { at: 0 });
    updateSiteNavs();
  }, 50));
  ['page:remove', 'page:update'].forEach((ev) => editor.on(ev, () => setTimeout(() => updateSiteNavs(), 50)));
  const oldRefresh = SC.refreshPages;
  SC.refreshPages = () => { oldRefresh(); updateSiteNavs(); };
  // Ctrl+click a link to one of your pages to open it in the editor.
  editor.on('canvas:frame:load', ({ window: w }) => {
    w.document.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a || !(e.ctrlKey || e.metaKey)) return;
      const target = Pages.getAll().find((p) => fileName(p) === a.getAttribute('href'));
      if (target) { e.preventDefault(); editor.select(null); Pages.select(target); toast(`Opened the page “${target.getName()}”.`); }
    }, true);
  });

  // Menu entries for pages, sites and templates
  const menu = (name) => (SC.menus.find(([n]) => n === name) || [])[1];
  const fileMenu = menu('File'), insertMenu = menu('Insert');
  if (fileMenu) {
    const at = fileMenu.findIndex((it) => it.label === 'Copy page HTML');
    fileMenu.splice(at + 1, 0, '-', { label: 'Save site to folder…', run: saveSite }, { label: 'Open site folder…', run: openSite },
      '-', { label: 'Templates…', run: () => A.templates() }, { label: 'Save as template…', run: () => A['save-template']() }, { label: 'Page properties…', run: () => A['page-props']() });
    fileMenu.unshift({ label: 'Start page and templates', run: () => openBackstage('home') }, '-');
  }
  if (insertMenu) insertMenu.unshift({ label: 'New page…', run: () => A['new-page']() }, { label: 'Site menu (all pages)', run: () => A.sitenav() }, '-');

  // =====================================================================
  // Backstage: the File screen with a greeting, templates and file commands
  // =====================================================================
  let bs = null;
  function closeBackstage() { if (bs) { bs.remove(); bs = null; document.removeEventListener('keydown', bsKey, true); } }
  const bsKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); closeBackstage(); } };
  SC.closeBackstage = closeBackstage;
  const run = (fn) => () => { closeBackstage(); fn(); };
  async function openBackstage(view = 'home') {
    SC.stopEditing();
    closeBackstage();
    const main = mk('div', { className: 'bs-main' });
    const items = [
      ['home', 'Home'], ['new', 'New'], '-',
      ['open', 'Open…', run(SC.openFile)], ['open-site', 'Open site folder…', run(openSite)], '-',
      ['save', 'Save', run(() => SC.save(false))], ['saveas', 'Save as…', run(() => SC.save(true))], ['save-site', 'Save site to folder…', run(saveSite)], ['save-template', 'Save as template…', run(A['save-template'])], '-',
      ['props', 'Page properties…', run(A['page-props'])], ['print', 'Print…', run(SC.printPage)], ['close', 'Close file', run(SC.closeFile)],
    ];
    const nav = mk('nav', { className: 'bs-nav', 'aria-label': 'File' }, mk('button', { className: 'bs-back', textContent: '← Back to the page', onclick: closeBackstage }),
      items.map((it) => (it === '-' ? mk('hr') : mk('button', { className: 'bs-item' + (it[0] === view ? ' on' : ''), textContent: it[1], onclick: it[2] || (() => openBackstage(it[0])) }))));
    bs = mk('div', { className: 'backstage', role: 'dialog', 'aria-label': 'File' }, nav, main);
    SC.keepEditing(bs);
    document.body.append(bs);
    document.addEventListener('keydown', bsKey, true);
    const hour = new Date().getHours();
    const hello = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    main.append(
      mk('h1', { textContent: view === 'new' ? 'Start a new page' : `${hello}! What shall we build?` }),
      mk('p', { className: 'lead', textContent: view === 'new' ? 'Pick a template. You can change everything afterwards.' : `You are working on “${SC.getDocName()}” with ${Pages.getAll().length} page${Pages.getAll().length === 1 ? '' : 's'}.` }),
      view === 'home' ? mk('div', { className: 'bs-actions' },
        mk('button', { className: 'btn primary', textContent: 'Back to my page', onclick: closeBackstage }),
        mk('button', { className: 'btn', textContent: 'Open a file…', onclick: run(SC.openFile) }),
        mk('button', { className: 'btn', textContent: 'Save', onclick: run(() => SC.save(false)) }),
        mk('button', { className: 'btn', textContent: 'Add a page', onclick: run(A['new-page']) })) : null,
      mk('h2', { textContent: 'Templates' }));
    main.append(await templateGrid(useTemplate));
    main.querySelector('button')?.focus();
  }
  SC.openBackstage = openBackstage;
  A.backstage = () => openBackstage('home');
})();
