// Renders kit/poster/ISCC-A4-<format>-<theme>.html to print PDFs (trim and 3 mm bleed) and 300 dpi PNGs.
// node tools/poster.js ["DATE TEXT"]   (the date line; default keeps the page's own)
const { chromium } = require('playwright');
const path = require('path');
const OUT = path.resolve(__dirname, '../kit/poster');
const DATE = process.argv[2] ? '&date=' + encodeURIComponent(process.argv[2]) : '';
(async () => {
  const b = await chromium.launch();
  for (const fmt of ['landscape', 'portrait']) for (const theme of ['dark', 'light']) for (const bleed of [0, 3]) {
    const W = (fmt === 'landscape' ? 297 : 210) + 2 * bleed, H = (fmt === 'landscape' ? 210 : 297) + 2 * bleed;
    const tag = `ISCC-A4-${fmt}-${theme}` + (bleed ? '-bleed3mm' : '');
    const p = await b.newPage({ viewport: { width: Math.ceil(W / 25.4 * 96), height: Math.ceil(H / 25.4 * 96) }, deviceScaleFactor: bleed ? 1 : 300 / 96 });
    p.on('pageerror', e => console.log('PAGEERROR', e.message));
    await p.goto('file://' + path.join(OUT, `ISCC-A4-${fmt}-${theme}.html`) + `?bleed=${bleed}&raw=1` + DATE, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.emulateMedia({ media: 'print' });
    await p.pdf({ path: path.join(OUT, tag + '.pdf'), width: W + 'mm', height: H + 'mm', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }, preferCSSPageSize: true });
    if (!bleed) { await p.emulateMedia({ media: 'screen' }); await (await p.$('#sheet')).screenshot({ path: path.join(OUT, tag + '-300dpi.png') }); }
    console.log('wrote', tag);
    await p.close();
  }
  await b.close();
})();
