// Screenshot an HTML file: node kit_shot.js in.html out.png width height
const { chromium } = require('playwright');
(async () => {
  const [, , inp, out, w, h] = process.argv;
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 })).newPage();
  await p.goto('file://' + inp);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(500);
  await p.screenshot({ path: out, clip: { x: 0, y: 0, width: +w, height: +h } });
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
