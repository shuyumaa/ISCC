// node tools/shots.js <outDir> <width> <theme> <lang> [sections,comma] [reduced]
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [, , out, w = '1440', theme = 'dark', lang = 'en', only = '', reduced = ''] = process.argv;
  const W = +w, H = W < 500 ? 844 : 900;
  const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  await ctx.addInitScript(([t, l]) => { try { localStorage.setItem('iscc-theme', t); localStorage.setItem('iscc-lang', l); } catch (e) {} }, [theme, lang]);
  const p = await ctx.newPage();
  p.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
  p.on('pageerror', e => console.log('PAGEERROR', e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html'));
  await p.evaluate(() => document.fonts.ready);
  const ids = only ? only.split(',') : ['cover', 'mark', 'light', 'smoke', 'metal', 'live', 'color', 'type', 'posters', 'foot'];
  const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (ov > 0) console.log('H-OVERFLOW', ov);
  for (const id of ids) {
    await p.evaluate(i => { const e = i === 'foot' ? document.querySelector('.foot') : document.getElementById(i); const r = e.getBoundingClientRect(); scrollTo(0, r.top + scrollY); }, id);
    await p.waitForTimeout(id === 'cover' ? 2600 : id === 'live' ? 9000 : 1800);
    if (id === 'smoke') { await p.mouse.click(W * 0.45, H * 0.7); await p.waitForTimeout(700); }
    await p.screenshot({ path: path.join(out, `${id}-${w}-${theme}-${lang}.png`), timeout: 120000 });
  }
  await b.close();
})();
