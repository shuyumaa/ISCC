// node tools/test-hud-contrast.js : computed contrast of banned veto cell texts + score-at-first-paint check
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const srv = http.createServer((q, r) => { const f = path.join(ROOT, q.url.split('?')[0]); if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' }[path.extname(f)] || 'x' }); fs.createReadStream(f).pipe(r); });
(async () => {
  await new Promise(r => srv.listen(0, r));
  const b = await chromium.launch();
  for (const theme of ['dark', 'light']) for (const lang of ['en', 'zh']) {
    const p = await (await b.newContext({ viewport: { width: 1160, height: 700 } })).newPage();
    await p.goto(`http://127.0.0.1:${srv.address().port}/tools/test-hud.html?theme=${theme}&lang=${lang}`);
    await p.waitForFunction(() => window.ISCCHUD); await p.evaluate(() => { ISCCHUD.stop(); document.querySelector('.bc-frame').classList.add('is-in'); });
    await p.waitForTimeout(1500);
    const r = await p.evaluate(() => {
      const rgb = s => { const m = s.match(/[\d.]+/g).map(Number); return s.startsWith('color(') ? m.map(v => v * 255) : m; };
      const lin = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
      const L = c => .2126 * lin(c[0]) + .7152 * lin(c[1]) + .0722 * lin(c[2]);
      const cr = (a, b) => { const x = L(a), y = L(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
      const bg = rgb(getComputedStyle(document.querySelector('.bc-veto')).backgroundColor);
      const out = {};
      document.querySelectorAll('.vt.ban').forEach((v, i) => {
        const vis = q => [...v.querySelectorAll(q)].find(e => e.offsetParent && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width);
        const nm = v.querySelector('.vt-n'), st = vis('.vt-st > span'), by = v.querySelector('.vt-by');
        out['ban' + i] = { name: cr(rgb(getComputedStyle(nm).color), bg).toFixed(2), status: cr(rgb(getComputedStyle(st).color), bg).toFixed(2), team: cr(rgb(getComputedStyle(by).color), bg).toFixed(2), opacity: getComputedStyle(v).opacity };
      });
      return out;
    });
    console.log(theme, lang, JSON.stringify(r));
    // first paint score after reset
    const sc = await p.evaluate(() => { ISCCHUD.reset(); return document.querySelector('.n-ct').textContent + ':' + document.querySelector('.n-t').textContent; });
    console.log('  score after reset', sc);
    await p.close();
  }
  await b.close(); srv.close();
})();
