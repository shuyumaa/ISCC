// node tools/probe.js "<js expression>" [width]
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
  const p = await b.newPage({ viewport: { width: +(process.argv[3] || 1440), height: 900 } });
  p.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
  p.on('pageerror', e => console.log('PAGEERROR', e.message));
  await p.goto('file://' + path.resolve(__dirname, '../index.html'));
  await p.waitForTimeout(1500);
  console.log(JSON.stringify(await p.evaluate(process.argv[2]), null, 1));
  await b.close();
})();
