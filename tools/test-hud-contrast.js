// node tools/test-hud-contrast.js : computed text contrast of every visible text node of the in-page HUD, both themes, both
// languages, at several moments of the loop. Text must be >= 4.5:1 (>= 3:1 for large display text) against its plate.
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const f = path.join(ROOT, q.url.split('?')[0]); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'x' }); fs.createReadStream(f).pipe(r); });
const MOMENTS = [1500, 4200, 6000, 8000, 12500, 15900, 16700, 18800];
(async () => {
  await new Promise(r => srv.listen(0, r));
  const b = await chromium.launch();
  let fails = 0;
  for (const theme of ['dark', 'light']) for (const lang of ['en', 'zh']) for (const w of [1440, 390]) {
    const p = await (await b.newContext({ viewport: { width: w, height: w < 640 ? 640 : 820 } })).newPage();
    await p.goto(`http://127.0.0.1:${srv.address().port}/tools/test-hud.html?theme=${theme}&lang=${lang}`);
    await p.waitForFunction(() => window.ISCCHUD); await p.evaluate(() => document.fonts.ready);
    await p.evaluate(() => { ISCCHUD.stop(); document.querySelector('.bc-frame').classList.add('is-in'); });
    const all = [];
    for (const t of MOMENTS) {
      await p.evaluate(t => ISCCHUD.seek(t), t); await p.waitForTimeout(80);
      await p.addStyleTag({ content: '.bc *{transition:none!important;animation:none!important}' });
      const res = await p.evaluate(() => {
        const toRGB = s => { const m = s.match(/[\d.]+/g).map(Number); if (s.startsWith('color(')) return [m[0] * 255, m[1] * 255, m[2] * 255, m[3] == null ? 1 : m[3]]; return [m[0], m[1], m[2], m[3] == null ? 1 : m[3]]; };
        const lin = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
        const L = c => .2126 * lin(c[0]) + .7152 * lin(c[1]) + .0722 * lin(c[2]);
        const cr = (a, b) => { const x = L(a), y = L(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
        const over = (top, bot) => [0, 1, 2].map(i => top[i] * top[3] + bot[i] * (1 - top[3])).concat([1]);
        const bgOf = n => { const stack = []; for (let e = n; e; e = e.parentElement) { const c = toRGB(getComputedStyle(e).backgroundColor); if (c[3] > 0) { stack.push(c); if (c[3] >= .99) break; } if (e.classList && e.classList.contains('bc')) break; }
          let c = stack.pop() || toRGB(getComputedStyle(document.querySelector('.bc-feed')).backgroundColor); while (stack.length) c = over(stack.pop(), c); return c; };
        const out = [];
        const w = document.createTreeWalker(document.querySelector('#broadcast'), NodeFilter.SHOW_TEXT);
        for (let n; (n = w.nextNode());) {
          const t = n.textContent.trim(); if (!t) continue; const e = n.parentElement;
          const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
          let hidden = false; for (let a = e; a && a.id !== 'broadcast'; a = a.parentElement) { const s = getComputedStyle(a); if (s.display === 'none' || s.visibility === 'hidden') { hidden = true; break; } } if (hidden) continue;
          const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue;
          if (e.closest('.bc-feed,.bc-radar-slot')) continue;
          const fs = parseFloat(cs.fontSize), fw = +cs.fontWeight, large = fs >= 24 || (fs >= 18.66 && fw >= 700);
          const fg = toRGB(cs.color), bg = bgOf(e);
          out.push({ t: t.slice(0, 24), r: cr(over(fg, bg), bg), large, fs: +fs.toFixed(1), cls: e.className && e.className.baseVal === undefined ? e.className : '' });
        }
        return out;
      });
      res.forEach(x => all.push({ ...x, at: t }));
    }
    const bad = all.filter(x => x.r < (x.large ? 3 : 4.5));
    const min = all.reduce((m, x) => x.r < m.r ? x : m, all[0]);
    const minSmall = all.filter(x => !x.large).reduce((m, x) => x.r < m.r ? x : m, all.filter(x => !x.large)[0]);
    const minFs = Math.min(...all.map(x => x.fs));
    console.log(`${theme} ${lang} ${w}: ${all.length} text samples, dimmest ${min.r.toFixed(2)}:1 ("${min.t}" ${min.cls} @${min.at}), dimmest small ${minSmall.r.toFixed(2)}:1, smallest font ${minFs}px, failures ${bad.length}`);
    bad.slice(0, 8).forEach(x => console.log('   FAIL', x.r.toFixed(2), JSON.stringify(x.t), x.cls, x.fs + 'px', '@' + x.at));
    if (bad.length) fails++;
    await p.close();
  }
  await b.close(); srv.close(); console.log(fails ? 'CONTRAST FAILURES' : 'CONTRAST OK');
})();
