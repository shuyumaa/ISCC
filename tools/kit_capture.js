// Capture WebGL plates from the project's own fx.js / cup.js at full size.
// The source text is patched IN MEMORY (resolution caps lifted, preserveDrawingBuffer on);
// the files in src/ are never modified.  Usage: node kit_capture.js jobs.json
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const SRC = path.resolve(__dirname, '../src');

function patch(name, capRx, label) {
  let s = fs.readFileSync(path.join(SRC, name), 'utf8');
  const m = s.match(capRx);
  if (!m || m.length !== 1) throw new Error(name + ': resolution cap pattern ' + label + ' not found exactly once');
  s = s.replace(capRx, m[0].replace(/\d+/, '100000'));
  if (!/antialias:\s*false/.test(s)) throw new Error(name + ': antialias:false not found');
  s = s.replace(/antialias:\s*false/g, 'antialias: false, preserveDrawingBuffer: true');
  return s;
}

(async () => {
  const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const SRCS = {
    fx: patch('fx.js', /\b1280\s*\/\s*Math\.max/g, '1280'),
    cup: patch('cup.js', /\b900\s*\/\s*Math\.max/g, '900'),
  };
  const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist', '--disable-gpu-watchdog'] });
  for (const j of jobs) {
    const t0 = Date.now();
    const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    page.setDefaultTimeout(900000);
    page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('  console', m.type(), m.text()); });
    page.on('pageerror', e => console.log('  pageerror', e.message));
    await page.setContent('<!doctype html><meta charset=utf-8><style>html,body{margin:0;background:transparent;overflow:hidden}' +
      '#c{position:absolute;left:0;top:0;width:' + j.w + 'px;height:' + j.h + 'px}</style><div id=w><canvas id=c></canvas></div>');
    await page.addScriptTag({ content: SRCS[j.kind === 'cup' ? 'cup' : 'fx'] });
    await page.evaluate(({ kind, opts }) => {
      const c = document.getElementById('c');
      if (kind === 'beams') window.__h = ISCCFX.beams(c, opts);
      else if (kind === 'smoke') window.__h = ISCCFX.smoke(c, opts);
      else window.__h = ISCCCUP.mount(c, opts);
    }, { kind: j.kind, opts: j.opts });
    const url = await page.evaluate(async ({ w, h }) => {
      const c = document.getElementById('c');
      const raf = () => new Promise(r => requestAnimationFrame(() => r()));
      for (let i = 0; i < 4; i++) await raf();
      if (c.width !== w || c.height !== h) throw new Error('canvas is ' + c.width + 'x' + c.height + ', wanted ' + w + 'x' + h);
      const gl = c.getContext('webgl');
      gl.finish();
      const px = new Uint8Array(4); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);   // forces completion
      return c.toDataURL('image/png');
    }, { w: j.w, h: j.h });
    fs.writeFileSync(j.png, Buffer.from(url.split(',')[1], 'base64'));
    console.log('captured', path.basename(j.png), j.w + 'x' + j.h, ((Date.now() - t0) / 1000).toFixed(1) + 's');
    await ctx.close();
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
