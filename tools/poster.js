// Renders kit/poster/a4-landscape.html to print PDFs and 300 dpi PNGs.
// node tools/poster.js
const { chromium } = require('playwright');
const path = require('path');
const OUT = path.resolve(__dirname, '../kit/poster');

(async () => {
  const b = await chromium.launch();
  for (const theme of ['light', 'dark']) {
    for (const bleed of [0, 3]) {
      const W = 297 + 2 * bleed, H = 210 + 2 * bleed;
      const pxW = Math.ceil(W / 25.4 * 96), pxH = Math.ceil(H / 25.4 * 96);
      const tag = `ISCC-A4-landscape-${theme}` + (bleed ? '-bleed3mm' : '');
      const url = 'file://' + path.join(OUT, `ISCC-A4-landscape-${theme}.html`) + `?bleed=${bleed}&raw=1`;
      const p = await b.newPage({ viewport: { width: pxW, height: pxH }, deviceScaleFactor: bleed ? 1 : 300 / 96 });
      p.on('pageerror', e => console.log('PAGEERROR', e.message));
      p.on('requestfailed', r => console.log('MISSING', r.url()));
      await p.goto(url, { waitUntil: 'networkidle' });
      await p.evaluate(() => document.fonts.ready);
      await p.emulateMedia({ media: 'print' });
      await p.pdf({ path: path.join(OUT, tag + '.pdf'), width: W + 'mm', height: H + 'mm', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }, preferCSSPageSize: true });
      if (!bleed) {
        await p.emulateMedia({ media: 'screen' });
        const el = await p.$('#sheet');
        await el.screenshot({ path: path.join(OUT, tag + '-300dpi.png') });
      }
      console.log('wrote', tag);
      await p.close();
    }
  }
  await b.close();
})();
