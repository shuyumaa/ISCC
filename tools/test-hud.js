// node tools/test-hud.js  : serves repo over http, shoots screenshots, checks layout stability
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };
const srv = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
const shots = [
  [1440, 'dark', 'en'], [1440, 'light', 'zh'], [960, 'dark', 'en'], [960, 'light', 'zh'],
  [700, 'dark', 'zh'], [390, 'dark', 'zh'], [390, 'light', 'en'],
];
const moments = [[4000, 'live'], [10000, 'bomb'], [14350, 'stinger'], [17500, 'after']];
(async () => {
  await new Promise(r => srv.listen(0, r));
  const base = 'http://127.0.0.1:' + srv.address().port + '/tools/test-hud.html';
  const b = await chromium.launch();
  for (const [w, theme, lang] of shots) {
    const ctx = await b.newContext({ viewport: { width: w, height: w < 500 ? 760 : 820 } });
    const p = await ctx.newPage();
    const errs = [];
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    p.on('pageerror', e => errs.push(String(e)));
    await p.goto(`${base}?theme=${theme}&lang=${lang}`);
    await p.waitForSelector('#broadcast');
    await p.evaluate(() => document.fonts.ready);
    await p.waitForFunction(() => window.ISCCHUD);
    await p.evaluate(() => { ISCCHUD.stop(); ISCCHUD.reset(); ISCCHUD.start(); });
    let t = 0;
    for (const [ms, name] of moments) {
      await p.waitForTimeout(ms - t); t = ms;
      await p.locator('#broadcast').screenshot({ path: path.join(__dirname, `test-hud-${w}-${theme}-${lang}-${name}.png`) });
    }
    console.log(w, theme, lang, 'console errors:', errs.length ? errs : 'none');
    await ctx.close();
  }
  // layout stability: toggle lang + theme, compare rects (frozen frame)
  for (const w of [1160, 700, 390]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 800 } });
    const p = await ctx.newPage();
    await p.goto(base);
    await p.waitForFunction(() => window.ISCCHUD);
    await p.evaluate(() => document.fonts.ready);
    await p.evaluate(() => { ISCCHUD.stop(); ISCCHUD.reset(); });
    await p.waitForTimeout(200);
    await p.evaluate(() => { document.querySelector('.bc-frame').classList.add('is-in'); });
    await p.waitForTimeout(1500);
    const sels = ['.bc-sb', '.sb-ct', '.sb-t', '.sb-mid', '.bc-l3', '.bc-veto', '.vt:nth-child(6)', '.bc-eco', '.bc-hist'];
    const measure = () => p.evaluate(s => s.map(q => { const r = document.querySelector(q).getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }), sels);
    const base0 = await measure();
    let worst = 0;
    for (const [th, lg] of [['light', 'en'], ['dark', 'zh'], ['light', 'zh'], ['dark', 'en']]) {
      await p.evaluate(([th, lg]) => { document.body.dataset.theme = th; document.body.dataset.lang = lg; }, [th, lg]);
      await p.waitForTimeout(150);
      const m = await measure();
      m.forEach((r, i) => r.forEach((v, k) => { worst = Math.max(worst, Math.abs(v - base0[i][k])); if (Math.abs(v - base0[i][k]) > 1) console.log('  DRIFT', sels[i], th, lg, base0[i], r); }));
    }
    console.log('layout stability @', w, 'max delta px =', worst.toFixed(2));
    await ctx.close();
  }
  await b.close(); srv.close();
})();
