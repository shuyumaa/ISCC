// node tools/test-hud.js : serves the repo over http, shoots the in-page HUD, checks theme/lang layout stability,
// first-paint score, the stale-state invariants of the loop, and the reduced-motion static frame.
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = process.env.OUT || __dirname;
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const srv = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
// [width, theme, lang, [[ms, name]...]]
const E = 15935; // end of an even (defuse) lap
const shots = [
  [1440, 'dark', 'en', [[1500, 'freeze'], [6000, 'live'], [12500, 'bomb'], [E + 900, 'round-end'], [E + 3000, 'after'], [E + 3400, 'banner']]],
  [1440, 'light', 'zh', [[6000, 'live'], [1500, 'freeze'], [E + 900, 'round-end']]],
  [960, 'dark', 'en', [[6000, 'live']]],
  [390, 'dark', 'zh', [[6000, 'live']]],
  [390, 'light', 'en', [[12500, 'bomb']]],
];
const H = w => Math.round(w < 640 ? w * 1.25 : w * 0.5625) + 40;
async function open(b, base, w, theme, lang, extra = {}) {
  const ctx = await b.newContext({ viewport: { width: w, height: H(w) }, ...extra });
  const p = await ctx.newPage();
  const errs = [];
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto(`${base}?theme=${theme}&lang=${lang}`);
  await p.waitForSelector('#broadcast');
  await p.waitForFunction(() => window.ISCCHUD);
  await p.evaluate(() => document.fonts.ready);
  return { ctx, p, errs };
}
(async () => {
  await new Promise(r => srv.listen(0, r));
  const base = 'http://127.0.0.1:' + srv.address().port + '/tools/test-hud.html';
  const b = await chromium.launch();
  let fails = 0;
  for (const [w, theme, lang, moments] of shots) {
    const { ctx, p, errs } = await open(b, base, w, theme, lang);
    await p.evaluate(() => { ISCCHUD.stop(); document.querySelector('.bc-frame').classList.add('is-in'); });
    for (const [ms, name] of moments) {
      await p.evaluate(t => ISCCHUD.seek(t), ms);
      await p.waitForTimeout(650);
      await p.locator('#broadcast').screenshot({ path: path.join(OUT, `test-hud-${w}-${theme}-${lang}-${name}.png`) });
    }
    console.log(w, theme, lang, 'console errors:', errs.length ? errs : 'none');
    await ctx.close();
  }

  // first paint reads 7 : 6 (before any start/seek)
  {
    const ctx = await b.newContext({ viewport: { width: 1200, height: 800 } });
    const p = await ctx.newPage();
    await p.goto(base);
    await p.waitForFunction(() => window.ISCCHUD);
    const sc = await p.evaluate(() => [...document.querySelectorAll('.sb-sc')].map(n => n.textContent).join(':'));
    console.log('first paint score', sc, sc === '7:6' ? 'OK' : 'FAIL'); if (sc !== '7:6') fails++;
    await ctx.close();
  }

  // layout stability: theme + language swaps move nothing (> 1 px)
  for (const w of [1440, 960, 390]) {
    const { ctx, p } = await open(b, base, w, 'dark', 'en');
    await p.evaluate(() => { ISCCHUD.stop(); document.querySelector('.bc-frame').classList.add('is-in'); ISCCHUD.seek(4200); });
    await p.waitForTimeout(900);
    const sels = ['.sb', '.sb-bar', '.sb-t.ct', '.sb-t.t', '.sb-tab', '.sb-lb', '.hist', '.rws-ct', '.rws-t', '.rws-ct .rw:nth-child(1)', '.rws-ct .rw:nth-child(5)', '.rws-t .rw:nth-child(1)', '.rws-t .rw:nth-child(5)', '.rws-ct .rw:nth-child(1) .rw-n', '.rws-t .rw:nth-child(3) .rw-hp', '.fp', '.fp-st:nth-of-type(2)', '.rd-fr', '.rd', '.kf'];
    const measure = () => p.evaluate(s => s.map(q => { const e = document.querySelector(q); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }), sels);
    const base0 = await measure();
    let worst = 0;
    for (const [th, lg] of [['light', 'en'], ['dark', 'zh'], ['light', 'zh'], ['dark', 'en']]) {
      await p.evaluate(([th, lg]) => { document.body.dataset.theme = th; document.body.dataset.lang = lg; }, [th, lg]);
      await p.waitForTimeout(250);
      const m = await measure();
      m.forEach((r, i) => r && r.forEach((v, k) => { const d = Math.abs(v - base0[i][k]); worst = Math.max(worst, d); if (d > 1) { console.log('  DRIFT', sels[i], th, lg, base0[i].map(n => +n.toFixed(1)), r.map(n => +n.toFixed(1))); } }));
    }
    console.log('layout stability @', w, 'max delta px =', worst.toFixed(2), worst <= 1 ? 'OK' : 'FAIL'); if (worst > 1) fails++;
    await ctx.close();
  }

  // loop invariants: stale state, score timing, window overlap
  {
    const { ctx, p } = await open(b, base, 1280, 'dark', 'en');
    await p.evaluate(() => { ISCCHUD.stop(); document.querySelector('.bc-frame').classList.add('is-in'); });
    const rows = [];
    for (let t = 0; t < 40000; t += 100) {
      rows.push(await p.evaluate(t => {
        ISCCHUD.seek(t);
        const v = s => { const e = document.querySelector(s); return getComputedStyle(e).visibility === 'visible'; };
        return { t, bomb: v('.l-bomb'), res: v('.l-res'), def: v('.l-def'), st: document.querySelector('.sb-tab').dataset.st,
          score: [...document.querySelectorAll('.sb-sc')].map(n => n.textContent).join(':'), stg: document.querySelector('.stg').classList.contains('on'),
          bar: getComputedStyle(document.querySelector('.sb-bomb')).opacity, kf: document.querySelectorAll('.kr').length,
          nowTxt: document.querySelector('.clk, .sb-clk').textContent, fz: document.querySelector('.bc-frame').classList.contains('s-fz') };
      }, t));
    }
    let bad = 0;
    rows.forEach((r, i) => {
      const lap = Math.floor(r.t / 20000), tl = r.t - lap * 20000;
      const E_ = (lap % 2 ? 16000 : 15935);
      if (tl > E_ && tl < 19400 && r.bomb) { bad++; console.log('  STALE bomb label at', r.t); }
      if (tl >= 19400 && (r.st !== 'def' || r.stg)) { bad++; console.log('  stale end state in freeze at', r.t); }
      if (r.stg && tl < E_ + 300) { bad++; console.log('  stinger early at', r.t); }
      if (i && rows[i - 1].score !== r.score && tl < 19400 && tl > 1000) { if (r.stg) { bad++; console.log('  score changed under the band at', r.t); } else console.log('  score', rows[i - 1].score, '->', r.score, 'at lap-time', tl, '(band on:', r.stg, ')'); }
      if (r.kf > 5) { bad++; console.log('  killfeed >5 at', r.t); }
    });
    console.log('loop invariants:', bad ? 'FAIL ' + bad : 'OK'); if (bad) fails++;
    await ctx.close();
  }

  // reduced motion: static mid-round frame, no loop, no running animations/transitions
  {
    const { ctx, p } = await open(b, base, 1440, 'dark', 'en', { reducedMotion: 'reduce' });
    await p.waitForTimeout(600);
    const snap = () => p.evaluate(() => ({ clk: document.querySelector('.sb-clk').textContent, kf: document.querySelectorAll('.kr').length, anim: document.getAnimations().length, st: document.querySelector('.sb-tab').dataset.st, rows: [...document.querySelectorAll('.rw-hp')].map(n => n.textContent).join(','), isin: document.querySelector('.bc-frame').classList.contains('is-in') }));
    const a = await snap(); await p.waitForTimeout(2500); const c = await snap();
    await p.evaluate(() => { ISCCHUD.start(); }); await p.waitForTimeout(1200); const d = await snap();
    await p.locator('#broadcast').screenshot({ path: path.join(OUT, 'test-hud-1440-dark-en-reduced.png') });
    const same = JSON.stringify(a) === JSON.stringify(c) && JSON.stringify(a) === JSON.stringify(d);
    console.log('reduced motion static frame:', JSON.stringify(a), same && a.anim === 0 && a.kf > 0 && a.isin ? 'OK' : 'FAIL'); if (!(same && a.anim === 0 && a.kf > 0 && a.isin)) fails++;
    await ctx.close();
  }
  await b.close(); srv.close();
  console.log(fails ? 'FAILURES: ' + fails : 'ALL OK');
  process.exitCode = fails ? 1 : 0;
})();
