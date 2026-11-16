// node tools/test-hud-overlays.js : screenshots every kit/overlays page over a mid-grey checkerboard (1920x1080), prints console errors
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = process.env.OUT || __dirname;
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
const PAGES = [
  ['scoreboard', 'ct=KES&ctName=KESTRELS&t=LAN&tName=LANTERNS&cs=7&ts=6&round=14&clock=1:55', 400],
  ['player-rows', '', 400],
  ['killfeed', '', 400, async p => { for (const k of [['kite','ct','wick','t',['hs'],'rifle'],['sable','t','mossglass','ct',[],'rifle'],['ninefold','ct','tallow','t',['smoke'],'sniper'],['ember','t','kite','ct',['flash'],'rifle']]) await p.evaluate(k => ISCC.update({ kill: { a: k[0], as: k[1], v: k[2], vs: k[3], mods: k[4], wpn: k[5] } }), k); }],
  ['lower-third', 'name=ember&line=Northgate%20Academy%20%C2%B7%20ENTRY&side=t&k=17&d=11&adr=81.4', 1200],
  ['map-veto', '', 400],
  ['round-win', 'side=ct&round=14&method=defused', 1200],
  ['stinger', 'side=ct&autoplay=1', 1100],
  ['matchup', '', 400],
  ['starting-soon', 'mins=5', 1500],
  ['break', 'mins=4', 1500],
  ['full-hud', 'demo=1', 6000],
];
(async () => {
  await new Promise(r => srv.listen(0, r));
  const b = await chromium.launch();
  const only = process.env.ONLY;
  for (const theme of (process.env.THEMES || 'dark').split(','))
  for (const lang of (process.env.LANGS || 'en').split(','))
  for (const [name, q, wait, pre] of PAGES) {
    if (only && !only.split(',').includes(name)) continue;
    const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 } });
    const p = await ctx.newPage(); const errs = [];
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    p.on('pageerror', e => errs.push(String(e)));
    await p.goto(`http://127.0.0.1:${srv.address().port}/kit/overlays/${name}.html?bg=checker&theme=${theme}&lang=${lang}&${q}`);
    await p.evaluate(() => document.fonts.ready);
    if (pre) await pre(p);
    await p.waitForTimeout(wait);
    await p.screenshot({ path: path.join(OUT, `test-hud-overlay-${name}${theme === 'dark' && lang === 'en' ? '' : '-' + theme + '-' + lang}.png`) });
    console.log(name, theme, lang, 'console errors:', errs.length ? errs : 'none');
    await ctx.close();
  }
  await b.close(); srv.close();
})();
