const { chromium } = require('playwright');
(async () => {
  const reduced = process.argv[2] === 'reduced';
  const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 2950 }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('console', m.type(), m.text()); });
  page.on('pageerror', e => console.log('pageerror', e.message));
  await page.goto('file://' + __dirname + '/test-fx.html');
  await page.waitForTimeout(reduced ? 1500 : 3500);
  const out = __dirname + (reduced ? '/test-fx-reduced.png' : '/test-fx.png');
  await page.screenshot({ path: out, fullPage: true });
  console.log('shot', out);
  await b.close();
})();
