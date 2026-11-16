// Render SVG files to PNG with Playwright/Chromium. Usage: node kit_render.js jobs.json
// jobs: [{svg, png, w, h, bg?}]  (bg: css colour, omitted = transparent)
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const b = await chromium.launch();
  const ctx = await b.newContext({ deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  let n = 0;
  for (const j of jobs) {
    const svg = fs.readFileSync(j.svg);
    const uri = 'data:image/svg+xml;base64,' + svg.toString('base64');
    await page.setViewportSize({ width: j.w, height: j.h });
    await page.setContent('<!doctype html><meta charset=utf-8><style>html,body{margin:0;padding:0;background:' + (j.bg || 'transparent') +
      '}img{display:block;width:' + j.w + 'px;height:' + j.h + 'px}</style><img id=i src="' + uri + '">');
    await page.evaluate(() => document.getElementById('i').decode());
    await page.screenshot({ path: j.png, omitBackground: !j.bg, clip: { x: 0, y: 0, width: j.w, height: j.h } });
    n++;
  }
  await b.close();
  console.log('kit_render: ' + n + ' png');
})().catch(e => { console.error(e); process.exit(1); });
