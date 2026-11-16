// Lists elements that poke past the viewport's right edge without a clipping ancestor.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  for (const w of [1440, 390]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    await p.goto('file://' + path.resolve(__dirname, '../index.html'));
    await p.waitForTimeout(500);
    const r = await p.evaluate(() => {
      const W = innerWidth, o = [];
      document.querySelectorAll('body *').forEach(e => {
        const r = e.getBoundingClientRect();
        if (r.right > W + 1 && r.width > 0) {
          let c = e, clipped = false;
          while ((c = c.parentElement)) {
            const s = getComputedStyle(c);
            if (/hidden|clip|auto|scroll/.test(s.overflowX) && c !== document.body) { clipped = true; break; }
          }
          if (!clipped && getComputedStyle(e).position !== 'fixed') o.push((e.getAttribute('class') || '') + ' ' + e.tagName + ' ' + Math.round(r.right - W));
        }
      });
      return o.slice(0, 14);
    });
    console.log(w, r);
    await p.close();
  }
  await b.close();
})();
