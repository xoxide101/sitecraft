/* SiteCraft features used by the ribbon: HTML elements, widgets, libraries, compatibility and
   accessibility checks, design themes, layout tools, table tools and Draw Table.
   Uses window.SC, which the main script sets up. */
(function () {
  'use strict';
  const SC = window.SC;
  const { editor, mk, esc, toast, dialog, field } = SC;
  const A = SC.actions;
  const css = (rules) => editor.Css.addRules(rules);
  const sel = () => editor.getSelected();
  const wrapper = () => editor.getWrapper();

  // A searchable gallery dialog: groups of { name, sub, desc, run }.
  function gallery(title, intro, groups, { wide = true, onPick } = {}) {
    const search = mk('input', { type: 'text', placeholder: 'Search…', className: 'gal-search' });
    const box = mk('div', { className: 'gal' });
    let dlg;
    const draw = () => {
      const q = search.value.trim().toLowerCase();
      box.textContent = '';
      groups.forEach(([gname, items]) => {
        const shown = items.filter((it) => !q || (it.name + ' ' + (it.sub || '') + ' ' + (it.desc || '') + ' ' + gname).toLowerCase().includes(q));
        if (!shown.length) return;
        box.append(mk('h3', { textContent: gname }));
        shown.forEach((it) => box.append(mk('button', { className: 'gal-item' + (it.on ? ' on' : ''), type: 'button', onclick: () => { dlg.close(); (onPick || ((x) => x.run()))(it); } },
          mk('b', { textContent: it.name }), it.sub ? mk('code', { textContent: it.sub }) : null, it.desc ? mk('span', { textContent: it.desc }) : null)));
      });
      if (!box.children.length) box.append(mk('p', { textContent: 'Nothing matches. Try another word.' }));
    };
    search.addEventListener('input', draw);
    draw();
    dlg = dialog({ title, wide, body: [intro ? mk('p', { textContent: intro }) : null, search, box], actions: [{ label: 'Close' }] });
    return dlg;
  }

  // =====================================================================
  // Insert any HTML element
  // =====================================================================
  const T = (tag, desc, html) => ({ name: tag.startsWith('input') ? tag.replace('input-', 'Input: ') : `<${tag}>`, sub: '', desc, html });
  const ELEMENTS = [
    ['Page structure', [
      T('header', 'Top of the page or a section: logo, title, navigation', '<header style="padding:20px 6%"><p>Header</p></header>'),
      T('nav', 'A set of navigation links', '<nav style="display:flex;gap:18px;padding:12px 6%"><a href="#">Home</a><a href="#">About</a><a href="#">Contact</a></nav>'),
      T('main', 'The main content of the page (one per page)', '<main style="padding:24px 6%"><p>Main content</p></main>'),
      T('section', 'A themed part of the page with its own heading', '<section style="padding:48px 6%"><h2>Section heading</h2><p>Section text.</p></section>'),
      T('article', 'Content that makes sense on its own: a post, a story', '<article style="padding:24px 6%"><h2>Article title</h2><p>Article text.</p></article>'),
      T('aside', 'Side content: tips, related links', '<aside style="padding:16px;border-left:4px solid #d5d9e1"><p>A side note.</p></aside>'),
      T('footer', 'Bottom of the page or a section', '<footer style="padding:24px 6%"><p>© Your name</p></footer>'),
      T('div', 'A plain box to group other elements', '<div style="padding:16px;min-height:60px"></div>'),
    ]],
    ['Text', [
      T('h1', 'Main heading (one per page)', '<h1>Main heading</h1>'), T('h2', 'Section heading', '<h2>Heading 2</h2>'),
      T('h3', 'Sub-heading', '<h3>Heading 3</h3>'), T('h4', 'Smaller heading', '<h4>Heading 4</h4>'),
      T('h5', 'Small heading', '<h5>Heading 5</h5>'), T('h6', 'Smallest heading', '<h6>Heading 6</h6>'),
      T('p', 'A paragraph of text', '<p>A paragraph of text.</p>'),
      T('blockquote', 'A quotation', '<blockquote>A quotation.</blockquote>'),
      T('pre', 'Pre-formatted text, spaces kept', '<pre>Pre-formatted   text</pre>'),
      T('address', 'Contact details', '<address>214 Mill Street<br>Springfield</address>'),
      T('span', 'A small piece of text to style', '<p>Some <span style="color:#d1408a">highlighted</span> words.</p>'),
      T('mark', 'Highlighted text', '<p>Some <mark>marked</mark> words.</p>'),
      T('strong', 'Important text (bold)', '<p><strong>Important</strong> text.</p>'),
      T('em', 'Stressed text (italic)', '<p><em>Stressed</em> text.</p>'),
      T('small', 'Fine print', '<p><small>Fine print.</small></p>'),
      T('abbr', 'An abbreviation with its meaning', '<p><abbr title="HyperText Markup Language">HTML</abbr></p>'),
      T('time', 'A date or time', '<p><time datetime="2026-12-24">24 December</time></p>'),
      T('code', 'A piece of code in a sentence', '<p>Type <code>npm start</code></p>'),
      T('kbd', 'A key to press', '<p>Press <kbd>Ctrl</kbd>+<kbd>S</kbd></p>'),
      T('q', 'A short quotation in a sentence', '<p>She said <q>hello</q>.</p>'),
      T('br', 'A line break inside text', '<p>Line one<br>Line two</p>'),
    ]],
    ['Lists', [
      T('ul', 'Bulleted list', '<ul><li>First</li><li>Second</li></ul>'),
      T('ol', 'Numbered list', '<ol><li>First</li><li>Second</li></ol>'),
      T('dl', 'Terms and their descriptions', '<dl><dt>Term</dt><dd>What it means.</dd></dl>'),
    ]],
    ['Pictures and media', [
      T('img', 'A picture', null), T('figure', 'A picture with a caption', null),
      T('video', 'A video file', '<video controls style="width:100%;max-width:640px"><source src="" type="video/mp4">Your browser cannot play this video.</video>'),
      T('audio', 'A sound file', '<audio controls><source src="" type="audio/mpeg">Your browser cannot play this sound.</audio>'),
      T('iframe', 'Another web page inside this one', '<iframe src="https://example.com" title="Embedded page" style="width:100%;height:360px;border:0"></iframe>'),
      T('canvas', 'A drawing area for scripts', '<canvas width="400" height="200" style="border:1px solid #d5d9e1"></canvas>'),
      T('svg', 'A vector drawing', '<svg width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="#d1408a"/></svg>'),
      T('picture', 'Different pictures for different screens', null),
    ]],
    ['Forms', [
      T('form', 'A form that sends what people type', '<form style="display:grid;gap:10px;max-width:420px"><label>Name <input name="name"></label><button type="submit">Send</button></form>'),
      T('input-text', 'One line of text', '<label>Text <input type="text" name="text"></label>'),
      T('input-email', 'An email address', '<label>Email <input type="email" name="email"></label>'),
      T('input-password', 'A hidden password', '<label>Password <input type="password" name="password"></label>'),
      T('input-number', 'A number', '<label>Number <input type="number" name="number"></label>'),
      T('input-tel', 'A phone number', '<label>Phone <input type="tel" name="phone"></label>'),
      T('input-date', 'A date picker', '<label>Date <input type="date" name="date"></label>'),
      T('input-time', 'A time picker', '<label>Time <input type="time" name="time"></label>'),
      T('input-range', 'A slider', '<label>Amount <input type="range" name="range" min="0" max="10"></label>'),
      T('input-color', 'A color picker', '<label>Color <input type="color" name="color"></label>'),
      T('input-checkbox', 'A tick box', '<label><input type="checkbox" name="agree"> I agree</label>'),
      T('input-radio', 'One choice from a few', '<p><label><input type="radio" name="size" value="s"> Small</label> <label><input type="radio" name="size" value="l"> Large</label></p>'),
      T('input-file', 'Choose a file to send', '<label>File <input type="file" name="file"></label>'),
      T('textarea', 'Several lines of text', '<label>Message <textarea name="message" rows="4"></textarea></label>'),
      T('select', 'A drop-down list', '<label>Choose <select name="choice"><option>One</option><option>Two</option></select></label>'),
      T('button', 'A button', '<button type="button">Button</button>'),
      T('fieldset', 'A box around related fields, with a legend', '<fieldset><legend>Your details</legend><label>Name <input name="name"></label></fieldset>'),
      T('progress', 'A progress bar', '<progress value="60" max="100">60%</progress>'),
      T('meter', 'A gauge', '<meter value="0.7">70%</meter>'),
    ]],
    ['Interactive', [
      T('details', 'A section that opens and closes', SC.INSERTS.details),
      T('dialog', 'A pop-up box (open it with a script)', '<dialog open style="border:1px solid #d5d9e1;border-radius:8px"><p>A dialog box.</p></dialog>'),
      T('a', 'A link', '<a href="#">A link</a>'),
      T('hr', 'A dividing line', '<hr>'),
      T('table', 'A table of rows and columns', null),
    ]],
  ];
  function insertElement(it) {
    const tag = it.name;
    if (tag === '<img>') return SC.insertImageFile();
    if (tag === '<table>') return SC.tableDialog();
    if (tag === '<figure>') return SC.insertBlock(`<figure style="margin:16px 0"><img src="${placeholder(600, 340)}" alt="" style="max-width:100%;display:block"><figcaption style="font-size:14px;color:#666;margin-top:6px">A caption for the picture</figcaption></figure>`);
    if (tag === '<picture>') return SC.insertBlock(`<picture><source media="(max-width: 600px)" srcset="${placeholder(400, 300)}"><img src="${placeholder(800, 400)}" alt="" style="max-width:100%;display:block"></picture>`);
    SC.insertBlock(it.html);
  }
  function placeholder(w, h) {
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#e3e6ec"/><text x="50%" y="50%" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#8a93a3">${w} × ${h}</text></svg>`);
  }
  A['html-element'] = () => gallery('Insert an HTML element', 'Every common HTML element, with a ready-to-edit example. It goes after the selected element.', ELEMENTS, { onPick: insertElement });

  // =====================================================================
  // Scripts and widgets: small open-source scripts written for SiteCraft (MIT licence).
  // The markup goes on the page; each script is added once, at the end of the saved page.
  // In the editor they show their first state; use Developer › Preview in browser to try them.
  // =====================================================================
  const WIDGETS = [
    { id: 'slider', name: 'Picture slider', desc: 'Pictures that slide by on their own, with ‹ › buttons.',
      html: () => `<div class="sc-slider" data-widget="slider"><div class="sc-slides"><img src="${placeholder(900, 400)}" alt="Slide 1"><img src="${placeholder(900, 401)}" alt="Slide 2"><img src="${placeholder(900, 402)}" alt="Slide 3"></div><button class="sc-prev" type="button" aria-label="Previous">‹</button><button class="sc-next" type="button" aria-label="Next">›</button></div>`,
      css: '.sc-slider{position:relative;max-width:900px;margin:16px auto;overflow:hidden;border-radius:10px}.sc-slides{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;scrollbar-width:none}.sc-slides img{flex:0 0 100%;width:100%;scroll-snap-align:start;display:block}.sc-prev,.sc-next{position:absolute;top:50%;transform:translateY(-50%);border:0;width:42px;height:42px;border-radius:50%;background:rgba(0,0,0,.45);color:#fff;font-size:24px;cursor:pointer}.sc-prev{left:10px}.sc-next{right:10px}',
      js: `document.querySelectorAll('[data-widget="slider"]').forEach(function(s){var t=s.querySelector('.sc-slides');function go(d){var w=t.clientWidth,n=t.children.length,i=Math.round(t.scrollLeft/w);t.scrollTo({left:((i+d+n)%n)*w});}s.querySelector('.sc-prev').onclick=function(){go(-1)};s.querySelector('.sc-next').onclick=function(){go(1)};var timer=setInterval(function(){go(1)},5000);s.addEventListener('mouseenter',function(){clearInterval(timer)});});` },
    { id: 'lightbox', name: 'Lightbox gallery', desc: 'Small pictures that open large when clicked.',
      html: () => `<div class="sc-gallery" data-widget="lightbox">${[1, 2, 3, 4].map((i) => `<a href="${placeholder(1200, 800 + i)}"><img src="${placeholder(300, 200 + i)}" alt="Picture ${i}"></a>`).join('')}</div>`,
      css: '.sc-gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;margin:16px 0}.sc-gallery img{width:100%;display:block;border-radius:6px}.sc-lb{position:fixed;inset:0;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;z-index:9999;cursor:zoom-out}.sc-lb img{max-width:92vw;max-height:92vh;border-radius:6px}',
      js: `document.querySelectorAll('[data-widget="lightbox"] a').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();var o=document.createElement('div');o.className='sc-lb';var i=document.createElement('img');i.src=a.href;i.alt=(a.querySelector('img')||{}).alt||'';o.appendChild(i);o.onclick=function(){o.remove()};document.addEventListener('keydown',function k(ev){if(ev.key==='Escape'){o.remove();document.removeEventListener('keydown',k)}});document.body.appendChild(o);});});` },
    { id: 'tabs', name: 'Tabs', desc: 'Click a tab to show its panel.',
      html: () => '<div class="sc-tabs" data-widget="tabs"><div class="sc-tab-buttons"><button type="button" class="on">First</button><button type="button">Second</button><button type="button">Third</button></div><div class="sc-tab-panel"><p>Text for the first tab.</p></div><div class="sc-tab-panel" hidden><p>Text for the second tab.</p></div><div class="sc-tab-panel" hidden><p>Text for the third tab.</p></div></div>',
      css: '.sc-tabs{margin:16px 0}.sc-tab-buttons{display:flex;gap:4px;border-bottom:2px solid #d5d9e1}.sc-tab-buttons button{border:0;background:none;padding:10px 16px;cursor:pointer;font:inherit;border-bottom:3px solid transparent;margin-bottom:-2px}.sc-tab-buttons button.on{border-bottom-color:#2f5bea;font-weight:700}.sc-tab-panel{padding:14px 2px}',
      js: `document.querySelectorAll('[data-widget="tabs"]').forEach(function(w){var b=w.querySelectorAll('.sc-tab-buttons button'),p=w.querySelectorAll('.sc-tab-panel');b.forEach(function(btn,i){btn.onclick=function(){b.forEach(function(x){x.classList.remove('on')});p.forEach(function(x){x.hidden=true});btn.classList.add('on');if(p[i])p[i].hidden=false;};});});` },
    { id: 'accordion', name: 'Accordion', desc: 'Questions that open one at a time.',
      html: () => '<div class="sc-accordion" data-widget="accordion"><details open><summary>First question</summary><p>The answer to the first question.</p></details><details><summary>Second question</summary><p>The answer to the second question.</p></details><details><summary>Third question</summary><p>The answer to the third question.</p></details></div>',
      css: '.sc-accordion details{border:1px solid #d5d9e1;border-radius:6px;padding:10px 14px;margin:8px 0}.sc-accordion summary{cursor:pointer;font-weight:600}',
      js: `document.querySelectorAll('[data-widget="accordion"]').forEach(function(a){var d=a.querySelectorAll('details');d.forEach(function(x){x.addEventListener('toggle',function(){if(x.open)d.forEach(function(y){if(y!==x)y.open=false})})});});` },
    { id: 'backtotop', name: 'Back-to-top button', desc: 'A round button that appears after scrolling down.',
      html: () => '<button class="sc-top" data-widget="backtotop" type="button" aria-label="Back to top">↑</button>',
      css: '.sc-top{position:fixed;right:20px;bottom:20px;width:46px;height:46px;border-radius:50%;border:0;background:#2f5bea;color:#fff;font-size:20px;cursor:pointer;box-shadow:0 6px 16px rgba(0,0,0,.2)}',
      js: `document.querySelectorAll('[data-widget="backtotop"]').forEach(function(b){function f(){b.style.display=window.scrollY>300?'block':'none'}f();window.addEventListener('scroll',f);b.onclick=function(){window.scrollTo({top:0,behavior:'smooth'})};});` },
    { id: 'countdown', name: 'Countdown timer', desc: 'Days, hours, minutes and seconds to a date.', ask: 'date',
      html: (date) => `<div class="sc-countdown" data-widget="countdown" data-date="${date}"><span><b>00</b>days</span><span><b>00</b>hours</span><span><b>00</b>minutes</span><span><b>00</b>seconds</span></div>`,
      css: '.sc-countdown{display:flex;gap:12px;justify-content:center;margin:16px 0;font-family:Arial,sans-serif}.sc-countdown span{display:grid;min-width:72px;padding:10px;border-radius:8px;background:#1d2330;color:#fff;text-align:center;font-size:12px;text-transform:uppercase;letter-spacing:.06em}.sc-countdown b{font-size:30px;letter-spacing:0}',
      js: `document.querySelectorAll('[data-widget="countdown"]').forEach(function(c){var end=new Date(c.getAttribute('data-date')).getTime(),b=c.querySelectorAll('b');function tick(){var s=Math.max(0,Math.floor((end-Date.now())/1000));[Math.floor(s/86400),Math.floor(s%86400/3600),Math.floor(s%3600/60),s%60].forEach(function(v,i){if(b[i])b[i].textContent=(v<10?'0':'')+v});}tick();setInterval(tick,1000);});` },
    { id: 'modal', name: 'Pop-up window', desc: 'A button that opens a pop-up with your message.',
      html: () => '<div data-widget="modal"><button type="button" class="sc-open">Open the pop-up</button><dialog class="sc-modal"><h3>Hello!</h3><p>Your message here.</p><button type="button" class="sc-close">Close</button></dialog></div>',
      css: '.sc-modal{border:0;border-radius:12px;padding:24px 26px;max-width:420px;box-shadow:0 20px 50px rgba(0,0,0,.3)}.sc-modal::backdrop{background:rgba(0,0,0,.45)}',
      js: `document.querySelectorAll('[data-widget="modal"]').forEach(function(m){var d=m.querySelector('dialog');m.querySelector('.sc-open').onclick=function(){d.showModal?d.showModal():d.setAttribute('open','')};m.querySelector('.sc-close').onclick=function(){d.close?d.close():d.removeAttribute('open')};});` },
    { id: 'typing', name: 'Typing text', desc: 'Words that type themselves, one after another.',
      html: () => '<p class="sc-typing-line">We make <span class="sc-typing" data-widget="typing" data-words="fresh bread|good coffee|happy mornings">fresh bread</span></p>',
      css: '.sc-typing{border-right:2px solid currentColor;padding-right:2px}',
      js: `document.querySelectorAll('[data-widget="typing"]').forEach(function(el){var w=(el.getAttribute('data-words')||el.textContent).split('|'),i=0,n=0,del=false;function step(){var word=w[i%w.length];n+=del?-1:1;el.textContent=word.slice(0,n);if(!del&&n===word.length){del=true;return setTimeout(step,1400)}if(del&&n===0){del=false;i++}setTimeout(step,del?45:90)}setTimeout(step,1000);});` },
    { id: 'reveal', name: 'Reveal on scroll', desc: 'The selected element fades in as it scrolls into view.', apply: true,
      css: '.sc-reveal{opacity:0;transform:translateY(24px);transition:opacity .7s ease,transform .7s ease}.sc-reveal.sc-in{opacity:1;transform:none}',
      js: `(function(){var els=document.querySelectorAll('.sc-reveal');if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('sc-in')});return}var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('sc-in');o.unobserve(e.target)}})},{threshold:.15});els.forEach(function(e){o.observe(e)});})();` },
    { id: 'year', name: 'Current year', desc: 'Shows this year, so a © notice never goes out of date.',
      html: () => `<p>© <span data-widget="year">${new Date().getFullYear()}</span> Your name</p>`, css: '',
      js: `document.querySelectorAll('[data-widget="year"]').forEach(function(y){y.textContent=new Date().getFullYear()});` },
    { id: 'date', name: 'Date and time', desc: 'Today’s date or the time, always up to date for each visitor (or typed in once as fixed words).', ask: 'datetime', css: '',
      js: `(function(){function p(n){return(n<10?'0':'')+n}function iso(d){return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())}function sm(d){return d.toLocaleDateString('en-US',{month:'short'}).toUpperCase()}function hm(d){return d.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}
var F={short:function(d){return d.toLocaleDateString()},long:function(d){return d.toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'})},mdy:function(d){return d.toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'})},mdyShort:function(d){return d.toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'})},
dmy:function(d){return d.getDate()+' '+d.toLocaleDateString(undefined,{month:'long'})+' '+d.getFullYear()},iso:iso,monthYear:function(d){return d.toLocaleDateString(undefined,{year:'numeric',month:'long'})},weekday:function(d){return d.toLocaleDateString(undefined,{weekday:'long'})},year:function(d){return String(d.getFullYear())},
time:hm,time24:function(d){return p(d.getHours())+':'+p(d.getMinutes())},timeSec:function(d){return d.toLocaleTimeString()},dateTime:function(d){return d.toLocaleDateString()+' '+hm(d)},stampDMY:function(d){return d.getDate()+' '+sm(d)+' '+d.getFullYear()},stampMDY:function(d){return sm(d)+' '+d.getDate()+' '+d.getFullYear()},stampFull:function(d){return iso(d)+' '+p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds())}};
function run(){var d=new Date();document.querySelectorAll('[data-widget="date"]').forEach(function(t){var f=F[t.getAttribute('data-fmt')]||F.short;t.textContent=f(d);t.setAttribute('datetime',d.toISOString())})}run();setInterval(run,30000)})();` },
    { id: 'smooth', name: 'Smooth scrolling', desc: 'Links to parts of the page glide there instead of jumping.', apply: 'page',
      css: 'html{scroll-behavior:smooth}', js: '' },
  ];
  const widgetCss = (w) => (w.css ? `<style>${w.css}</style>` : '');
  // A widget's script is saved when the page uses it.
  function usedWidgets(comp) {
    const html = editor.getHtml({ component: comp });
    return WIDGETS.filter((w) => w.js && (html.includes(`data-widget="${w.id}"`) || (w.id === 'reveal' && html.includes('sc-reveal'))));
  }
  SC.exportHooks.bodyEnd.push((mode, page) => {
    const pg = page || editor.Pages.getSelected();
    const t = mode.xml || mode.old ? ' type="text/javascript"' : '';
    let out = usedWidgets(pg.getMainComponent()).map((w) => `<script${t} data-sc-widget="${w.id}">\n${w.js}\n</script>\n`).join('');
    if (SC.settings.script && SC.settings.script.trim()) out += `<script${t} data-sc-custom>\n${SC.settings.script}\n</script>\n`;
    return out;
  });
  function addWidget(w) {
    if (w.apply === 'page') { css(w.css); toast(`${w.name} is on for this page.`); return; }
    if (w.apply) {
      const c = sel();
      if (!c || c === wrapper()) { toast('Select the element that should fade in first.'); return; }
      css(w.css); c.addClass('sc-reveal');
      toast(`${w.name} added. Try it with Developer › Preview in browser.`);
      return;
    }
    const put = (arg) => { SC.insertBlock(w.html(arg) + widgetCss(w)); toast(`${w.name} added. Try it with Developer › Preview in browser.`); };
    if (w.ask === 'datetime') { SC.actions['ins-date'](); return; }
    if (w.ask === 'date') {
      const d = mk('input', { type: 'text', value: `${new Date().getFullYear()}-12-31T00:00` });
      dialog({ title: 'Count down to', body: [field('Date and time (year-month-day T hour:minute)', d)], actions: [{ label: 'Cancel' }, { label: 'Insert', primary: true, run: () => {
        if (isNaN(new Date(d.value).getTime())) { toast('Type a date like 2026-12-31T18:00'); return false; }
        put(d.value);
      } }] });
    } else put();
  }
  A.widgets = () => gallery('Scripts and widgets', 'Ready-made interactive parts. Their small scripts (written for SiteCraft, MIT licence) are added to the saved page automatically. In the editor they show their first state; use Developer › Preview in browser to try them.',
    [['Widgets', WIDGETS.map((w) => ({ name: w.name, desc: w.desc, run: () => addWidget(w) }))]], { wide: true });
  A['page-script'] = () => {
    const ta = mk('textarea', { rows: 14, spellcheck: false, value: SC.settings.script || '', placeholder: "// JavaScript that runs when the page opens\ndocument.querySelector('h1').addEventListener('click', () => alert('Hello!'));" });
    dialog({ title: 'Page script', wide: true, body: [mk('p', { textContent: 'Your own JavaScript, added at the end of the saved page. It does not run inside the editor; try it with Preview in browser.' }), ta],
      actions: [{ label: 'Cancel' }, { label: 'Save', primary: true, run: () => { SC.settings.script = ta.value; SC.saveSettings(); toast('Page script saved.'); } }] });
  };
  // Reading a saved page back: widget scripts are recreated from the markup, the custom script is kept.
  SC.importHooks.push((doc) => {
    const custom = doc.querySelector('script[data-sc-custom]');
    if (custom) SC.settings.script = custom.textContent.trim();
  });

  // =====================================================================
  // Libraries: well-known open-source CSS and JavaScript libraries, loaded from public CDNs
  // when the saved page is viewed (needs an internet connection). CSS libraries also show in the editor.
  // =====================================================================
  const LIBS = [
    ['CSS frameworks and styles', [
      { id: 'bootstrap', name: 'Bootstrap 5', desc: 'Grid, buttons, cards, navbars. Add classes like btn btn-primary.', css: ['https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css'], js: ['https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js'] },
      { id: 'bulma', name: 'Bulma', desc: 'A clean CSS framework without JavaScript.', css: ['https://cdn.jsdelivr.net/npm/bulma@1.0.2/css/bulma.min.css'] },
      { id: 'pico', name: 'Pico CSS', desc: 'Makes plain HTML look good with no classes.', css: ['https://cdn.jsdelivr.net/npm/@picocss/pico@2.0.6/css/pico.min.css'] },
      { id: 'normalize', name: 'Normalize.css', desc: 'Makes browsers show elements the same way.', css: ['https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css'] },
      { id: 'animate', name: 'Animate.css', desc: 'Ready-made animations: add class animate__animated animate__bounce.', css: ['https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css'] },
    ]],
    ['Icons', [
      { id: 'fontawesome', name: 'Font Awesome 6', desc: 'Thousands of icons: <i class="fa-solid fa-heart"></i>.', css: ['https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css'] },
      { id: 'bootstrap-icons', name: 'Bootstrap Icons', desc: 'Icons: <i class="bi bi-star"></i>.', css: ['https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css'] },
    ]],
    ['JavaScript', [
      { id: 'jquery', name: 'jQuery', desc: 'The classic helper for scripts: $(".x").hide().', js: ['https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js'] },
      { id: 'alpine', name: 'Alpine.js', desc: 'Small behaviour right in the HTML: x-data, x-show, @click.', js: ['https://cdn.jsdelivr.net/npm/alpinejs@3.14.1/dist/cdn.min.js'], defer: true },
      { id: 'aos', name: 'AOS (animate on scroll)', desc: 'Add data-aos="fade-up" to anything.', css: ['https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css'], js: ['https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js'], init: 'AOS.init();' },
      { id: 'gsap', name: 'GSAP', desc: 'Professional animation for scripts.', js: ['https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js'] },
      { id: 'chartjs', name: 'Chart.js', desc: 'Bar, line and pie charts on a <canvas>.', js: ['https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js'] },
      { id: 'leaflet', name: 'Leaflet maps', desc: 'Interactive maps with OpenStreetMap.', css: ['https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'], js: ['https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'] },
      { id: 'swiper', name: 'Swiper', desc: 'Touch sliders and carousels.', css: ['https://cdn.jsdelivr.net/npm/swiper@11.1.4/swiper-bundle.min.css'], js: ['https://cdn.jsdelivr.net/npm/swiper@11.1.4/swiper-bundle.min.js'] },
    ]],
  ];
  const allLibs = () => LIBS.flatMap(([, l]) => l);
  const libOn = (id) => SC.settings.libs.includes(id);
  SC.exportHooks.head.push((mode) => allLibs().filter((l) => libOn(l.id)).flatMap((l) => (l.css || []).map((u) => `<link rel="stylesheet" href="${u}" data-sc-lib="${l.id}"${mode.xml ? ' /' : ''}>\n`)).join(''));
  SC.exportHooks.bodyEnd.unshift((mode) => {
    const t = mode.xml || mode.old ? ' type="text/javascript"' : '';
    return allLibs().filter((l) => libOn(l.id)).map((l) => (l.js || []).map((u) => `<script${t} src="${u}"${l.defer ? ' defer' : ''} data-sc-lib="${l.id}"></script>\n`).join('') + (l.init ? `<script${t} data-sc-lib="${l.id}">${l.init}</script>\n` : '')).join('');
  });
  // Show the CSS libraries in the editor too.
  function syncCanvasLibs() {
    const d = SC.fdoc(); if (!d || !d.head) return;
    d.querySelectorAll('link[data-sc-lib]').forEach((n) => { if (!libOn(n.dataset.scLib)) n.remove(); });
    allLibs().filter((l) => libOn(l.id)).forEach((l) => (l.css || []).forEach((u) => {
      if (d.querySelector(`link[data-sc-lib="${l.id}"][href="${u}"]`)) return;
      const n = d.createElement('link'); n.rel = 'stylesheet'; n.href = u; n.dataset.scLib = l.id; d.head.prepend(n);
    }));
  }
  editor.on('canvas:frame:load', () => setTimeout(syncCanvasLibs, 50));
  editor.on('load', () => setTimeout(syncCanvasLibs, 200));
  A.libraries = () => {
    const groups = LIBS.map(([g, list]) => [g, list.map((l) => ({ name: (libOn(l.id) ? '✓ ' : '') + l.name, desc: l.desc, on: libOn(l.id), lib: l }))]);
    gallery('Libraries', 'Click a library to add it to this site (click again to remove it). Libraries load from cdnjs or jsDelivr when the page is viewed, so they need an internet connection. CSS libraries also show in the editor.', groups, {
      onPick: (it) => {
        const id = it.lib.id;
        SC.settings.libs = libOn(id) ? SC.settings.libs.filter((x) => x !== id) : [...SC.settings.libs, id];
        SC.saveSettings(); syncCanvasLibs();
        toast(libOn(id) ? `${it.lib.name} added to the site.` : `${it.lib.name} removed.`);
        A.libraries();
      },
    });
  };
  SC.importHooks.push((doc) => {
    const ids = [...new Set([...doc.querySelectorAll('[data-sc-lib]')].map((n) => n.getAttribute('data-sc-lib')))];
    if (ids.length) SC.settings.libs = ids.filter((id) => allLibs().some((l) => l.id === id));
    const dt = doc.doctype;
    if (dt) SC.settings.doctype = /XHTML 1\.0 Strict/i.test(dt.publicId) ? 'xhtml-strict' : /XHTML/i.test(dt.publicId) ? 'xhtml-trans' : /HTML 4/i.test(dt.publicId) ? 'html401' : 'html5';
    const pg = editor.Pages.getSelected();
    const meta = { title: (doc.querySelector('title') || {}).textContent || '', description: (doc.querySelector('meta[name="description"]') || { getAttribute: () => '' }).getAttribute('content') || '', lang: doc.documentElement.getAttribute('lang') || 'en' };
    if (pg && meta.title) SC.settings.pages[pg.getId()] = { ...(SC.settings.pages[pg.getId()] || {}), ...meta };
  });

  // =====================================================================
  // Compatibility: which HTML standard to save, and a check for elements the chosen standard lacks.
  // =====================================================================
  const HTML5_ONLY = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer', 'figure', 'figcaption', 'details', 'summary', 'video', 'audio', 'source', 'track', 'canvas', 'mark', 'time', 'dialog', 'picture', 'output', 'progress', 'meter', 'template', 'svg', 'datalist'];
  const OBSOLETE = { font: 'use the Font controls instead', center: 'use Center alignment instead', big: 'use a larger font size', strike: 'use <s>', tt: 'use <code>', acronym: 'use <abbr>', marquee: 'use an animation', frame: 'not supported', frameset: 'not supported', applet: 'not supported', basefont: 'use CSS' };
  const NEW_INPUTS = ['email', 'number', 'tel', 'url', 'date', 'time', 'datetime-local', 'month', 'week', 'range', 'color', 'search'];
  function checkCompat() {
    const mode = SC.settings.doctype || 'html5';
    const found = [];
    wrapper().onAll((c) => {
      if (c === wrapper()) return;
      const tag = (c.get('tagName') || '').toLowerCase();
      const attrs = c.getAttributes();
      if (mode === 'html5' && OBSOLETE[tag]) found.push([c, `<${tag}> is obsolete in HTML5: ${OBSOLETE[tag]}.`]);
      if (mode !== 'html5') {
        if (HTML5_ONLY.includes(tag)) found.push([c, `<${tag}> is HTML5 only: older browsers treat it as a plain box or ignore it.`]);
        if (tag === 'input' && NEW_INPUTS.includes(attrs.type)) found.push([c, `Input type="${attrs.type}" is HTML5 only: older browsers show a plain text box.`]);
        if (attrs.placeholder) found.push([c, 'The placeholder attribute is HTML5 only.']);
        if (attrs.required !== undefined) found.push([c, 'The required attribute is HTML5 only.']);
      }
      if (mode === 'xhtml-strict') {
        if (attrs.target) found.push([c, 'XHTML Strict does not allow target (for example "open in a new tab").']);
        if (['font', 'center', 'u', 's', 'strike', 'iframe'].includes(tag)) found.push([c, `XHTML Strict does not allow <${tag}>.`]);
      }
    });
    return found;
  }
  function report(title, intro, found, okText) {
    const list = mk('div', { style: 'display:grid;gap:6px' });
    if (!found.length) list.append(mk('p', { textContent: okText }));
    found.slice(0, 200).forEach(([c, text]) => list.append(mk('button', { className: 'gal-item', type: 'button', onclick: () => { dlg.close(); editor.select(c); c.view && c.view.el && c.view.el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } },
      mk('b', { textContent: text }), mk('span', { textContent: `${c.getName()} · click to select it` }))));
    const dlg = dialog({ title, wide: true, body: [mk('p', { textContent: intro }), list], actions: [{ label: 'Close', primary: true }] });
  }
  A.compat = () => {
    const opts = Object.entries(SC.DOCTYPES).map(([id, d]) => ({ name: (SC.settings.doctype === id ? '✓ ' : '') + d.label, desc: COMPAT_DESC[id], on: SC.settings.doctype === id, id }));
    gallery('Compatibility mode', 'Choose the HTML standard the saved page follows. SiteCraft writes the matching doctype and tag style, and Check page lists anything the standard does not support.', [['Standards', opts]], {
      wide: false,
      onPick: (it) => { SC.settings.doctype = it.id; SC.saveSettings(); refreshCompat(); toast(`Saving as ${SC.DOCTYPES[it.id].label}.`); },
    });
  };
  const COMPAT_DESC = {
    html5: 'Every current browser. All elements and form fields work.',
    'xhtml-strict': 'Strict XML-style HTML: every tag closed, no presentational tags or new-tab links.',
    'xhtml-trans': 'XML-style HTML that still allows older tags and attributes.',
    html401: 'For very old browsers and some email programs. No HTML5 elements.',
  };
  A['compat-check'] = () => report('Compatibility check', `Checked against ${SC.DOCTYPES[SC.settings.doctype || 'html5'].label}.`, checkCompat(), 'Everything on this page fits the chosen standard.');
  function refreshCompat() { document.querySelectorAll('[data-compat-label]').forEach((n) => { n.textContent = (SC.DOCTYPES[SC.settings.doctype] || SC.DOCTYPES.html5).label.replace(/ \(.*\)/, ''); }); }
  SC.refreshCompat = refreshCompat;

  // Accessibility and quality check (like a word processor's accessibility checker)
  function lum(rgb) {
    const m = rgb.match(/[\d.]+/g); if (!m) return null;
    const [r, g, b] = m.slice(0, 3).map((v) => { v = v / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  function bgOf(el, win) {
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const c = win.getComputedStyle(e).backgroundColor;
      const m = c.match(/[\d.]+/g);
      if (m && (m.length < 4 || +m[3] > 0.5)) return c;
      if (win.getComputedStyle(e).backgroundImage !== 'none') return null;
    }
    return 'rgb(255, 255, 255)';
  }
  A.a11y = () => {
    const found = [], win = SC.fwin();
    let lastLevel = 0, h1s = 0;
    const ids = new Map();
    wrapper().onAll((c) => {
      if (c === wrapper() || !c.view || !c.view.el) return;
      const el = c.view.el, tag = (c.get('tagName') || '').toLowerCase(), attrs = c.getAttributes();
      if (attrs.id) { if (ids.has(attrs.id)) found.push([c, `Two elements share the id "${attrs.id}". Ids must be unique.`]); ids.set(attrs.id, c); }
      if (tag === 'img' && !('alt' in attrs)) found.push([c, 'Picture without a description (alt text). Add one under Settings.']);
      if (tag === 'a' && !el.textContent.trim() && !el.querySelector('img[alt]')) found.push([c, 'Link without any text: people using screen readers cannot tell where it goes.']);
      if (tag === 'a' && (!attrs.href || attrs.href === '#')) found.push([c, 'Link that goes nowhere (href is empty or #).']);
      if (tag === 'button' && !el.textContent.trim() && !attrs['aria-label']) found.push([c, 'Button without text or a label.']);
      if (/^h[1-6]$/.test(tag)) {
        const lv = +tag[1];
        if (lv === 1) h1s++;
        if (lastLevel && lv > lastLevel + 1) found.push([c, `Heading ${lv} follows heading ${lastLevel}: a level is skipped.`]);
        lastLevel = lv;
      }
      if (['input', 'select', 'textarea'].includes(tag) && !el.closest('label') && !attrs['aria-label'] && !(attrs.id && SC.fdoc().querySelector(`label[for="${attrs.id}"]`)))
        found.push([c, 'Form field without a label.']);
      if (SC.texty(c) && el.textContent.trim()) {
        const cs = win.getComputedStyle(el), bg = bgOf(el, win);
        if (bg) {
          const a = lum(cs.color), b = lum(bg);
          if (a != null && b != null) {
            const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
            const big = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.6 && +cs.fontWeight >= 700);
            if (ratio < (big ? 3 : 4.5)) found.push([c, `Text may be hard to read: contrast ${ratio.toFixed(1)}:1 (aim for ${big ? 3 : 4.5}:1).`]);
          }
        }
      }
    });
    if (!h1s) found.unshift([wrapper(), 'The page has no main heading (Heading 1).']);
    if (h1s > 1) found.unshift([wrapper(), `The page has ${h1s} main headings (Heading 1). One is usual.`]);
    report('Accessibility check', 'Things that make the page harder to use for people with screen readers, low vision or a keyboard only. Click one to go to it.', found, 'No problems found. Nice work!');
  };

  // Preview the real saved page (scripts and libraries run) in a new browser tab.
  A['preview-browser'] = () => {
    const url = URL.createObjectURL(new Blob([SC.fullHtml()], { type: 'text/html' }));
    const w = window.open(url, '_blank');
    if (!w) toast('The browser blocked the new tab. Allow pop-ups for SiteCraft.');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  // =====================================================================
  // Design: themes, font pairs, page color and width, page details
  // =====================================================================
  const THEMES = [
    { name: 'Clean', bg: '#ffffff', fg: '#1d2330', head: '#111827', link: '#2f5bea', font: "'Segoe UI', system-ui, sans-serif", hfont: "'Segoe UI', system-ui, sans-serif" },
    { name: 'Bakery', bg: '#fbf7f0', fg: '#2b2118', head: '#2b2118', link: '#b5542a', font: 'Georgia, serif', hfont: 'Georgia, serif' },
    { name: 'Ocean', bg: '#f1f8fc', fg: '#16324a', head: '#0b4f7a', link: '#0a7cc1', font: 'Verdana, Geneva, sans-serif', hfont: "'Trebuchet MS', sans-serif" },
    { name: 'Forest', bg: '#f3f7f0', fg: '#1f3020', head: '#24502a', link: '#2f7d32', font: "'Palatino Linotype', Palatino, serif", hfont: "'Palatino Linotype', Palatino, serif" },
    { name: 'Sunset', bg: '#fff6ef', fg: '#3b1f14', head: '#c2410c', link: '#e4572e', font: 'Tahoma, Geneva, sans-serif', hfont: "Impact, 'Arial Black', sans-serif" },
    { name: 'Candy', bg: '#fff4fa', fg: '#3d1846', head: '#c0267d', link: '#7b4fd6', font: "'Trebuchet MS', sans-serif", hfont: "'Trebuchet MS', sans-serif" },
    { name: 'Midnight', bg: '#11151f', fg: '#e6e9ef', head: '#ffffff', link: '#8ab4ff', font: "'Segoe UI', system-ui, sans-serif", hfont: "'Segoe UI', system-ui, sans-serif" },
    { name: 'Newsprint', bg: '#f7f5ef', fg: '#222222', head: '#111111', link: '#a1162b', font: "'Times New Roman', Times, serif", hfont: "'Times New Roman', Times, serif" },
  ];
  function applyTheme(t) {
    editor.Css.setRule('body', { 'background-color': t.bg, color: t.fg, 'font-family': t.font });
    editor.Css.setRule('h1, h2, h3, h4, h5, h6', { color: t.head, 'font-family': t.hfont });
    editor.Css.setRule('a', { color: t.link });
    SC.setDirty(true);
    toast(`${t.name} theme applied. Elements with their own colors keep them.`);
  }
  SC.THEMES = THEMES;
  SC.applyTheme = applyTheme;
  const FONT_PAIRS = [
    ['Classic', 'Georgia, serif', 'Arial, Helvetica, sans-serif'], ['Modern', "'Segoe UI', system-ui, sans-serif", "'Segoe UI', system-ui, sans-serif"],
    ['Elegant', "'Palatino Linotype', Palatino, serif", 'Verdana, Geneva, sans-serif'], ['Friendly', "'Trebuchet MS', sans-serif", 'Verdana, Geneva, sans-serif'],
    ['Bold', "Impact, 'Arial Black', sans-serif", 'Tahoma, Geneva, sans-serif'], ['Typewriter', "'Courier New', Courier, monospace", 'Georgia, serif'],
    ['Newspaper', "'Times New Roman', Times, serif", "'Times New Roman', Times, serif"],
  ];
  SC.FONT_PAIRS = FONT_PAIRS;
  A['font-pair'] = (b, value) => {
    const f = FONT_PAIRS.find((x) => x[0] === value); if (!f) return;
    editor.Css.setRule('h1, h2, h3, h4, h5, h6', { 'font-family': f[1] });
    editor.Css.setRule('body', { 'font-family': f[2] });
    SC.setDirty(true); toast(`${f[0]} fonts: headings and text updated.`);
  };
  A['page-color'] = (b) => {
    const pick = (c) => { SC.closePop(); editor.Css.setRule('body', { 'background-color': c || '#ffffff' }); SC.setDirty(true); };
    const more = mk('input', { type: 'color', value: '#ffffff', onchange: () => pick(more.value) });
    const colors = ['#ffffff', '#fbf7f0', '#f7f5ef', '#f3f7f0', '#f1f8fc', '#f5f3ff', '#fff4fa', '#fff6ef', '#fffbe6', '#eef0f4', '#1d2330', '#11151f', '#0b2540', '#2b2118', '#3d1846', '#14301b', '#000000', '#e3e9fd', '#dcf3e9', '#fbe3ef'];
    SC.popover(b, mk('h4', { textContent: 'Page color' }), mk('div', { className: 'palette' }, colors.map((c) => mk('button', { title: c, style: `background:${c}`, onclick: () => pick(c) }))),
      mk('div', { className: 'pop-row' }, mk('label', { className: 'btn' }, 'More colors… ', more)));
  };
  A['page-width'] = (b, value) => {
    if (value === 'full') { editor.Css.setRule('body', { 'max-width': 'none', margin: '0' }); }
    else editor.Css.setRule('body', { 'max-width': value + 'px', margin: '0 auto' });
    SC.setDirty(true); toast(value === 'full' ? 'The page uses the full width.' : `The page is at most ${value} pixels wide and centered.`);
  };
  A['page-props'] = () => {
    const pg = editor.Pages.getSelected(), m = SC.pageMeta(pg);
    const title = mk('input', { type: 'text', value: m.title }), desc = mk('textarea', { rows: 3, value: m.description }), lang = mk('input', { type: 'text', value: m.lang });
    const file = mk('input', { type: 'text', value: m.file || '' , placeholder: 'index.html' });
    dialog({ title: 'Page properties', body: [field('Title (shown in the browser tab and search results)', title), field('Description (shown under the title in search results)', desc),
      mk('div', { className: 'dlg-cols' }, field('Language code (en, fr, es…)', lang), field('File name when saving the site', file))],
      actions: [{ label: 'Cancel' }, { label: 'Save', primary: true, run: () => {
        SC.settings.pages[pg.getId()] = { title: title.value.trim(), description: desc.value.trim(), lang: lang.value.trim() || 'en', file: file.value.trim() };
        if (title.value.trim()) pg.set('name', title.value.trim());
        SC.saveSettings(); SC.refreshPages && SC.refreshPages(); toast('Page properties saved.');
      } }] });
  };

  // =====================================================================
  // Layout: spacing, size, position, columns, and showing on each kind of screen
  // =====================================================================
  const needSel = () => { const c = sel(); if (!c || c === wrapper()) { toast('Select an element on the page first.'); return null; } SC.stopEditing(); return c; };
  A.padding = (b, v) => { const c = needSel(); if (c) SC.setStyle(c, 'padding', v === '0' ? '0' : v + 'px'); };
  A.margin = (b, v) => { const c = needSel(); if (c) SC.setStyle(c, 'margin', v === 'auto' ? '0 auto' : (v === '0' ? '0' : v + 'px 0')); };
  A.width = (b, v) => { const c = needSel(); if (c) { SC.setStyle(c, 'width', v === 'auto' ? '' : v); if (v !== 'auto') SC.setStyle(c, 'max-width', '100%'); } };
  const blockAlign = (where) => () => {
    const c = needSel(); if (!c) return;
    const m = { left: ['0', 'auto'], center: ['auto', 'auto'], right: ['auto', '0'] }[where];
    if (!c.getStyle().width && SC.fwin().getComputedStyle(c.view.el).display === 'block') toast('Tip: give it a width first (Layout › Width) so there is room to move it.');
    c.addStyle({ 'margin-left': m[0], 'margin-right': m[1] }); SC.refreshSoon();
  };
  A['block-left'] = blockAlign('left'); A['block-center'] = blockAlign('center'); A['block-right'] = blockAlign('right');
  const columns = (n) => () => {
    const c = needSel(); if (!c) return;
    if (n === 1) { c.addStyle({ display: 'block' }); c.removeStyle('grid-template-columns'); toast('Stacked: one item under another.'); return; }
    c.addStyle({ display: 'grid', 'grid-template-columns': `repeat(${n}, minmax(0, 1fr))`, gap: '20px' });
    toast(`The items inside are now in ${n} columns.${c.components().length < 2 ? ' (It has fewer than 2 items inside yet.)' : ''}`);
  };
  A['cols-1'] = columns(1); A['cols-2'] = columns(2); A['cols-3'] = columns(3); A['cols-4'] = columns(4);
  A['move-up'] = () => SC.moveSel(-1); A['move-down'] = () => SC.moveSel(1);
  A.duplicate = () => (needSel() ? editor.runCommand('tlb-clone') : null);
  A.delete = () => { const c = needSel(); if (c) { editor.select(null); c.remove(); } };
  const SHOW = { desktop: '@media (min-width: 993px)', tablet: '@media (min-width: 601px) and (max-width: 992px)', phone: '@media (max-width: 600px)' };
  function ensureShowCss() { Object.entries(SHOW).forEach(([k, mq]) => css(`${mq}{.sc-hide-${k}{display:none !important}}`)); }
  ['desktop', 'tablet', 'phone'].forEach((k) => {
    A['show-' + k] = () => {
      const c = needSel(); if (!c) return;
      ensureShowCss();
      const cls = 'sc-hide-' + k;
      if (c.getClasses().includes(cls)) { c.removeClass(cls); toast(`Shown on ${k}s again.`); } else { c.addClass(cls); toast(`Hidden on ${k}s. It stays in Objects on the left.`); }
      SC.refreshSoon();
    };
  });
  SC.refreshHooks.push((c) => {
    ['desktop', 'tablet', 'phone'].forEach((k) => document.querySelectorAll(`[data-act="show-${k}"]`).forEach((b) => b.setAttribute('aria-pressed', !!c && !c.getClasses().includes('sc-hide-' + k))));
  });

  // =====================================================================
  // Tables: merge and split cells, heading row, stripes, borders, Draw Table
  // =====================================================================
  const span = (c, a) => +(c.getAttributes()[a] || 1);
  A['merge-right'] = () => SC.withTable((t) => {
    const next = t.row.components().at(t.cell.index() + 1);
    if (!next) { toast('There is no cell to the right.'); return; }
    const html = [t.cell.getInnerHTML(), next.getInnerHTML()].filter((x) => x.trim()).join(' ');
    t.cell.components(html);
    t.cell.addAttributes({ colspan: String(span(t.cell, 'colspan') + span(next, 'colspan')) });
    next.remove(); editor.select(t.cell);
  });
  A['merge-down'] = () => SC.withTable((t) => {
    const rows = t.table.find('tr'), ri = rows.indexOf(t.row), below = rows[ri + span(t.cell, 'rowspan')];
    const other = below && below.components().at(t.cell.index());
    if (!other) { toast('There is no cell below.'); return; }
    const html = [t.cell.getInnerHTML(), other.getInnerHTML()].filter((x) => x.trim()).join('<br>');
    t.cell.components(html);
    t.cell.addAttributes({ rowspan: String(span(t.cell, 'rowspan') + span(other, 'rowspan')) });
    other.remove(); editor.select(t.cell);
  });
  A['split-cell'] = () => SC.withTable((t) => {
    const cs = span(t.cell, 'colspan'), rs = span(t.cell, 'rowspan');
    const blank = () => { const n = t.cell.clone(); n.components(''); n.removeAttributes(['colspan', 'rowspan']); return n; };
    if (cs > 1) {
      if (cs === 2) t.cell.removeAttributes('colspan'); else t.cell.addAttributes({ colspan: String(cs - 1) });
      t.row.append(blank(), { at: t.cell.index() + 1 });
    } else if (rs > 1) {
      const rows = t.table.find('tr'), below = rows[rows.indexOf(t.row) + rs - 1];
      if (rs === 2) t.cell.removeAttributes('rowspan'); else t.cell.addAttributes({ rowspan: String(rs - 1) });
      if (below) below.append(blank(), { at: Math.min(t.cell.index(), below.components().length) });
    } else { toast('Only merged cells can be split. Use Insert column to add cells.'); return; }
    editor.select(t.cell);
  });
  A['header-row'] = () => SC.withTable((t) => {
    const thead = t.table.components().find((c) => c.get('tagName') === 'thead');
    let tbody = t.table.components().find((c) => c.get('tagName') === 'tbody');
    if (thead) {
      const rows = thead.components().models.slice();
      if (!tbody) tbody = t.table.append({ tagName: 'tbody' })[0];
      rows.reverse().forEach((r) => { r.components().forEach((cell) => cell.set('tagName', 'td')); thead.components().remove(r, { temporary: true }); tbody.append(r, { at: 0 }); });
      thead.remove(); toast('The first row is a normal row now.');
    } else {
      const first = (tbody || t.table).find('tr')[0]; if (!first) return;
      first.parent().components().remove(first, { temporary: true });
      const [h] = t.table.append({ tagName: 'thead' }, { at: 0 });
      first.components().forEach((cell) => cell.set('tagName', 'th'));
      h.append(first); toast('The first row is a heading row now.');
    }
  });
  function tableClass(t, cls, group) {
    css('.sc-table.sc-banded tbody tr:nth-child(even) td{background:#f6f7f9}.sc-table.sc-lines th,.sc-table.sc-lines td{border-left:0;border-right:0}.sc-table.sc-noborder th,.sc-table.sc-noborder td{border:0}');
    const on = t.table.getClasses().includes(cls);
    (group || [cls]).forEach((x) => t.table.removeClass(x));
    if (!on) t.table.addClass(cls);
    return !on;
  }
  A.banded = () => SC.withTable((t) => toast(tableClass(t, 'sc-banded') ? 'Striped rows on.' : 'Striped rows off.'));
  A['borders-grid'] = () => SC.withTable((t) => { ['sc-lines', 'sc-noborder'].forEach((x) => t.table.removeClass(x)); toast('Grid borders.'); });
  A['borders-lines'] = () => SC.withTable((t) => tableClass(t, 'sc-lines', ['sc-lines', 'sc-noborder']));
  A['borders-none'] = () => SC.withTable((t) => tableClass(t, 'sc-noborder', ['sc-lines', 'sc-noborder']));
  A['row-above'] = () => SC.addRow(false); A['row-below'] = () => SC.addRow(true);
  A['col-left'] = () => SC.addCol(false); A['col-right'] = () => SC.addCol(true);
  A['del-row'] = SC.delRow; A['del-col'] = SC.delCol; A['del-table'] = SC.delTable;

  // Draw Table: drag a box on the page; its size decides the rows and columns.
  A['draw-table'] = () => {
    SC.stopEditing();
    const wrap = document.querySelector('.canvas-wrap');
    const layer = mk('div', { className: 'draw-layer' }, mk('div', { className: 'draw-hint', textContent: 'Drag a box where the table should go. Esc cancels.' }));
    wrap.style.position = 'relative'; wrap.append(layer);
    let start = null, box = null;
    const size = (w, h) => [Math.min(12, Math.max(1, Math.round(w / 80))), Math.min(30, Math.max(1, Math.round(h / 34)))];
    const done = () => { layer.remove(); document.removeEventListener('keydown', key, true); };
    const key = (e) => { if (e.key === 'Escape') { e.stopPropagation(); done(); toast('Draw table cancelled.'); } };
    document.addEventListener('keydown', key, true);
    layer.addEventListener('mousedown', (e) => {
      const r = layer.getBoundingClientRect();
      start = { x: e.clientX - r.left, y: e.clientY - r.top, cx: e.clientX, cy: e.clientY };
      box = mk('div', { className: 'draw-box' }); layer.append(box);
    });
    layer.addEventListener('mousemove', (e) => {
      if (!start) return;
      const r = layer.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      const w = Math.abs(x - start.x), h = Math.abs(y - start.y);
      const [cols, rows] = size(w, h);
      Object.assign(box.style, { left: Math.min(x, start.x) + 'px', top: Math.min(y, start.y) + 'px', width: w + 'px', height: h + 'px', backgroundSize: `${w / cols}px ${h / rows}px` });
      box.textContent = `${cols} × ${rows}`;
    });
    layer.addEventListener('mouseup', (e) => {
      if (!start) return;
      const w = Math.abs(e.clientX - start.cx), h = Math.abs(e.clientY - start.cy);
      done();
      if (w < 20 || h < 20) { toast('Drag a bigger box to draw a table.'); return; }
      const [cols, rows] = size(w, h);
      // Put the table after whatever was under the start of the box.
      const fr = editor.Canvas.getFrameEl().getBoundingClientRect(), z = editor.Canvas.getZoom() / 100;
      let el = SC.fdoc().elementFromPoint((start.cx - fr.left) / z, (start.cy - fr.top) / z);
      while (el && !el.__gjsv) el = el.parentElement;
      if (el && el.__gjsv.model !== wrapper()) editor.select(el.__gjsv.model); else editor.select(null);
      SC.insertBlock(SC.tableHtml(rows, cols, rows > 1));
      toast(`Drew a ${cols} × ${rows} table. Double-click a cell to type.`);
    });
  };
  // The HTML standard in use shows in the status bar; click it to change.
  const sbStd = document.getElementById('sb-std');
  if (sbStd) sbStd.onclick = () => A.compat();
  editor.on('load', refreshCompat);
  refreshCompat();

  // Menu entries for the new features
  const menu = (name) => (SC.menus.find(([n]) => n === name) || [])[1];
  const ins = menu('Insert'), view = menu('View'), fmt = menu('Format');
  if (ins) ins.push('-', { label: 'HTML element…', run: () => A['html-element']() }, { label: 'Widgets…', run: () => A.widgets() }, { label: 'Draw table', run: () => A['draw-table']() },
    '-', { label: 'Libraries…', run: () => A.libraries() }, { label: 'Page script…', run: () => A['page-script']() });
  if (view) {
    const at = view.findIndex((it) => it.label === 'Full screen');
    view.splice(at + 1, 0, { label: 'Preview in browser', run: () => A['preview-browser']() }, '-', { heading: 'Checks' },
      { label: 'Compatibility mode…', run: () => A.compat() }, { label: 'Check compatibility', run: () => A['compat-check']() }, { label: 'Accessibility check', run: () => A.a11y() });
  }
  if (fmt) fmt.push('-', { heading: 'Design' }, { label: 'Page color…', run: () => A['page-color'](document.getElementById('sb-std')) }, { label: 'Page properties…', run: () => A['page-props']() });
})();
