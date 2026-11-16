// Captures frame sequences of the authored motion for review.
// node tools/motion.js <outDir>
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
  const shoot = async (p, name) => p.screenshot({ path: path.join(out, name + '.png'), timeout: 120000 });
  // cover entrance
  let p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  await p.goto('file://' + path.resolve(__dirname, '../index.html'), { waitUntil: 'commit' });
  for (let i = 0; i < 6; i++) { await p.waitForTimeout(260); await shoot(p, 'cover-entrance-' + i); }
  // (the stinger wipe cannot be captured under software GL: screenshots stall mid-animation)
  // rig flash
  await p.evaluate(() => { const e = document.getElementById('light'); scrollTo(0, e.getBoundingClientRect().top + scrollY - 40); });
  await p.waitForTimeout(1500); await shoot(p, 'rig-0-rest');
  await p.mouse.move(900, 500); await p.waitForTimeout(900); await shoot(p, 'rig-1-steered');
  await p.mouse.click(900, 500); await p.waitForTimeout(120); await shoot(p, 'rig-2-flash'); await p.waitForTimeout(900); await shoot(p, 'rig-3-after');
  // smoke punch
  await p.evaluate(() => { const e = document.getElementById('smoke-plate'); scrollTo(0, e.getBoundingClientRect().top + scrollY - 80); });
  await p.waitForTimeout(1500); await shoot(p, 'smoke-0-rest');
  await p.mouse.click(520, 420); await p.waitForTimeout(500); await shoot(p, 'smoke-1-punched');
  await p.mouse.click(860, 380); await p.waitForTimeout(1500); await shoot(p, 'smoke-2-two');
  await p.close();
  // reduced motion
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  p = await ctx.newPage();
  await p.goto('file://' + path.resolve(__dirname, '../index.html'));
  await p.waitForTimeout(1200); await shoot(p, 'reduced-cover');
  await p.evaluate(() => document.querySelector('.radar [data-go="live"]').click());
  await p.waitForTimeout(1500); await shoot(p, 'reduced-live');
  await b.close();
})();
