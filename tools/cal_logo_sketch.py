#!/usr/bin/env python3
"""Calligraphy logo sketches: real brush glyphs (OFL fonts, outlined) + one CS move each + a gold seal.
-> concepts/calligraphy-logo-sketch.png and concepts/cal-mark-<n>.svg"""
import os, sys, subprocess
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cal_glyph as g

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GOLD, INKGOLD, PARCH, INK, BLACK, PORC = '#C9A44C', '#7A5D22', '#EFE9DA', '#14161C', '#0B0D10', '#F2EEE3'


def fit(cs, box=(70, 70, 800, 840)):
    """Scale/translate all contours so the glyph fills box (x0,y0,x1,y1), keeping proportion."""
    xs0 = min(b[0] for _, b in cs); ys0 = min(b[1] for _, b in cs)
    xs1 = max(b[2] for _, b in cs); ys1 = max(b[3] for _, b in cs)
    # bounds were computed in font space before flip; recompute from flipped: BoundsPen ran through the same transform
    w, h = xs1 - xs0, ys1 - ys0
    s = min((box[2] - box[0]) / w, (box[3] - box[1]) / h)
    tx = box[0] + ((box[2] - box[0]) - w * s) / 2 - xs0 * s
    ty = box[1] + ((box[3] - box[1]) - h * s) / 2 - ys0 * s
    return s, tx, ty


def seal(x, y, size, fill, knock):
    """Square chop with IS/CC cut out (sketch: type is live text)."""
    f = size * 0.5
    return ('<g><rect x="%g" y="%g" width="%g" height="%g" fill="%s"/>'
            '<text x="%g" y="%g" font-family="Big Shoulders Display" font-weight="900" font-size="%g" fill="%s" text-anchor="middle" letter-spacing="2">IS</text>'
            '<text x="%g" y="%g" font-family="Big Shoulders Display" font-weight="900" font-size="%g" fill="%s" text-anchor="middle" letter-spacing="2">CC</text></g>') % (
        x, y, size, size, fill, x + size / 2, y + size * 0.47, f, knock, x + size / 2, y + size * 0.91, f, knock)


def build(n, ink, accent, sealfill, sealknock, with_seal=True):
    if n == 1:                       # 武 — 止戈为武: the dot of 戈 is the round
        cs = g.contours('mashan', '武')
        s, tx, ty = fit(cs)
        areas = [(b[2] - b[0]) * (b[3] - b[1]) for _, b in cs]
        dot = areas.index(min(areas))
        body = ''.join('<path fill="%s" d="%s"/>' % (accent if i == dot else ink, d) for i, (d, b) in enumerate(cs))
        art = '<g transform="translate(%g %g) scale(%g)">%s</g>' % (tx, ty, s, body)
    elif n == 2:                     # 永 — 永字八法: the first stroke, the dot, is the first shot
        cs = g.contours('longcang', '永')
        s, tx, ty = fit(cs)
        dot = min(range(len(cs)), key=lambda i: cs[i][1][1])          # the topmost stroke is the dot
        body = ''.join('<path fill="%s" d="%s"/>' % (accent if i == dot else ink, d) for i, (d, b) in enumerate(cs))
        art = '<g transform="translate(%g %g) scale(%g)">%s</g>' % (tx, ty, s, body)
    else:                            # 中 — 命中: the needle stroke opens a crosshair gap where it pierces the box
        cs = g.contours('mashan', '中')
        s, tx, ty = fit(cs, (150, 50, 760, 900))
        holes = sorted([cs[i][1] for i in range(1, len(cs))], key=lambda b: b[0])
        h1, h2 = holes[0], holes[-1]
        vx = (h1[2] + h2[0]) / 2
        cy = (min(h1[1], h2[1]) + max(h1[3], h2[3])) / 2
        half = (h2[0] - h1[2]) / 2 + 6
        gap = 90 / s
        mid = 'm%d' % id(ink)
        body = ('<mask id="%s" maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="6000" height="6000"><rect x="-2000" y="-2000" width="6000" height="6000" fill="#fff"/>'
                '<rect x="%g" y="%g" width="%g" height="%g" fill="#000"/></mask>') % (mid, vx - half, cy - gap / 2, 2 * half, gap)
        body += '<path fill="%s" fill-rule="nonzero" mask="url(#%s)" d="%s"/>' % (ink, mid, ''.join(d for d, b in cs))
        body += '<circle cx="%g" cy="%g" r="%g" fill="%s"/>' % (vx, cy, 16 / s, accent)
        art = '<g transform="translate(%g %g) scale(%g)">%s</g>' % (tx, ty, s, body)
    if with_seal:
        art += seal(800, 790, 150, sealfill, sealknock)
    return '<svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">%s</svg>' % art


INFO = [
    ('武', '止戈为武', 'Stopping the weapon is true skill',
     'The dot of 戈 is the round: one gold mark in a wet ink stroke.', 'CS: the slash of 戈 is the tracer; the CT side literally stops the weapon.', 'School value: discipline and restraint. A competition about control, not violence.'),
    ('永', '永字八法', 'The eight principles of 永',
     'Every calligraphy student\'s first character: it holds all eight basic strokes.', 'CS: the first stroke, the dot, is the first shot. Fundamentals before flair.', 'School value: practice. 百炼 is the eight strokes, a thousand times.'),
    ('中', '命中', 'Hit the mark',
     'Read zhòng, 中 means to hit the target. The long hanging-needle stroke pierces the box.', 'CS: where the needle crosses the box it opens into a crosshair gap, with the round in the centre.', 'School value: precision and focus, the shooter\'s and the scholar\'s.'),
]
cols = ''
for i, (ch, idiom, en, l1, l2, l3) in enumerate(INFO, start=1):
    dark = build(i, PARCH, GOLD, GOLD, BLACK)
    light = build(i, INK, INKGOLD, INKGOLD, PORC)
    lock = build(i, PARCH, GOLD, GOLD, BLACK, with_seal=False)
    sm = ''.join('<figure><div style="width:%dpx;height:%dpx">%s</div><figcaption>%d</figcaption></figure>' % (z, z, build(i, PARCH, GOLD, GOLD, BLACK), z) for z in (32, 64, 96))
    fav = ''.join('<figure><div style="width:%dpx;height:%dpx"><svg viewBox="0 0 150 150">%s</svg></div><figcaption>%d seal</figcaption></figure>' % (z, z, seal(0, 0, 150, GOLD, BLACK), z) for z in (16, 32))
    cols += '''<section><h2><span>%d</span><b lang="zh">%s</b><em>%s</em></h2><p class="en">%s</p>
<ul><li>%s</li><li>%s</li><li>%s</li></ul>
<div class="st d"><div class="hero">%s</div></div><div class="st l"><div class="hero s">%s</div></div>
<div class="row">%s%s</div>
<div class="lock"><div style="width:74px;height:74px">%s</div><div><b>ISCC</b><i>国际学校CS2锦标赛</i></div></div></section>''' % (i, ch, idiom, en, l1, l2, l3, dark, light, sm, fav, lock)
    open(os.path.join(R, 'concepts/cal-mark-%d.svg' % i), 'w').write(dark)

html = '''<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="file://%s/kit/fonts/iscc-fonts.css">
<style>*{box-sizing:border-box;margin:0;padding:0}
body{background:#0B0D10;color:#EFE9DA;font:400 14px/1.5 Archivo,sans-serif;padding:44px;width:1560px}
header{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:28px;gap:40px}
h1{font:900 54px/.92 'Big Shoulders Display';text-transform:uppercase}h1 em{display:block;font:600 12px/1.6 Archivo;font-style:normal;letter-spacing:.24em;color:#9AA3B2;margin-top:10px}
header p{max-width:60ch;color:#9AA3B2;text-align:right}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
h2{display:flex;align-items:baseline;gap:12px}h2 span{font:900 46px/.8 'Big Shoulders Display';color:#C9A44C}h2 b{font:900 30px/1 'Noto Serif SC'}h2 em{font:900 20px/1 'Noto Serif SC';font-style:normal;color:#C9A44C;letter-spacing:.14em}
.en{font:800 18px/1.2 'Big Shoulders Display';letter-spacing:.08em;text-transform:uppercase;margin:8px 0 6px}
ul{list-style:none;color:#9AA3B2;font-size:13px;line-height:1.5;min-height:118px;margin-bottom:12px}li+li{margin-top:4px}
.st{display:grid;place-items:center;padding:26px}.st.d{background:#07090D;outline:1px solid rgba(154,163,178,.16);outline-offset:-1px}.st.l{background:#F2EEE3;padding:18px}
.hero{width:300px;height:300px}.hero.s{width:150px;height:150px}svg{display:block;width:100%%;height:100%%}
.row{display:flex;gap:20px;align-items:flex-end;padding:16px 0;border-bottom:1px solid rgba(154,163,178,.16)}
figure{display:flex;flex-direction:column;align-items:center;gap:6px}figcaption{font:600 11px Archivo;letter-spacing:.16em;color:#9AA3B2;white-space:nowrap}
.lock{display:flex;align-items:center;gap:14px;padding-top:16px}.lock b{display:block;font:900 42px/.9 'Big Shoulders Display';letter-spacing:.04em}.lock i{font:900 13px/1.6 'Noto Serif SC';font-style:normal;letter-spacing:.2em;color:#C9A44C}
footer{margin-top:24px;color:#9AA3B2;font:600 11px/1.7 Archivo;letter-spacing:.18em;text-transform:uppercase}
</style></head><body>
<header><h1>Calligraphy marks<em>Real brush strokes · one CS move each · a gold seal signs the work</em></h1>
<p>Each mark is a written character, not a drawn icon. The brush carries the school: discipline, practice, precision. One stroke carries Counter-Strike. The seal, the way a calligrapher signs a scroll, carries ISCC and becomes the favicon, where brushwork cannot survive.</p></header>
<div class="grid">%s</div>
<footer>Sketch: brush forms come from open-licence fonts (Ma Shan Zheng, Long Cang, OFL). The final mark should be written by hand or by a calligrapher, scanned, then vectorised, so the stroke is ours.</footer>
</body></html>''' % (R, cols)
out = os.path.join(R, 'concepts/calligraphy-logo-sketch.html')
open(out, 'w').write(html)
js = ("const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1560,height:900},deviceScaleFactor:1.5});"
      "await p.goto('file://%s');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(400);await p.screenshot({path:'%s',fullPage:true});await b.close()})()") % (out, out.replace('.html', '.png'))
subprocess.check_call(['node', '-e', js])
print('ok')
