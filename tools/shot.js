const { chromium } = require('playwright');
(async () => {
  const [,, file, out, w = '1440', full = '1', scale = '1'] = process.argv;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +w, height: 900 }, deviceScaleFactor: +scale });
  await p.goto('file://' + require('path').resolve(file));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  await p.screenshot({ path: out, fullPage: full === '1' });
  await b.close();
})();
