const { chromium } = require('playwright');
(async () => {
  const reduced = process.argv[2] === 'reduced';
  const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 1680, height: 1040 }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('console', m.type(), m.text()); });
  page.on('pageerror', e => console.log('pageerror', e.message));
  await page.goto('file://' + __dirname + '/test-cup.html');
  await page.waitForTimeout(reduced ? 1500 : 2500);
  const out = __dirname + (reduced ? '/test-cup-reduced.png' : '/test-cup.png');
  await page.screenshot({ path: out, fullPage: true, timeout: 180000 });
  console.log('shot', out, await page.evaluate(() => document.querySelectorAll('.fx-off').length + ' fx-off'));
  await page.evaluate(() => { cups[0].finish('chrome'); cups[0].theme('light'); cups[1].pointer(0.8,-0.5); cups[1].release(); cups[3].destroy(); });
  await page.waitForTimeout(1500);
  console.log('api ok');
  await b.close();
})();
