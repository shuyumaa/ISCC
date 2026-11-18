#!/usr/bin/env python3
"""Sketch sheet for the 武 (止戈为武) logo direction -> concepts/wu-logo-sketch.html/.png
Built on a 240-unit grid from straight blocks: horizontals 22u, verticals and the slash 26-28u."""
import os, subprocess

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def rect(x0, y0, x1, y1):
    return 'M%g %gH%gV%gH%gZ' % (x0, y0, x1, y1, x0)


def poly(*pts):
    return 'M' + 'L'.join('%g %g' % p for p in pts) + 'Z'


# strokes of 武: 一 (short top) + 弋 (long horizontal, slash with hook, dot) + 止 (bottom left)
TOP = rect(44, 34, 112, 56)
HOR = rect(16, 78, 224, 100)
SLASH = poly((112, 18), (138, 18), (222, 214), (196, 214))
HOOK = rect(208, 178, 232, 214)
DOT = rect(176, 30, 198, 52)
ZHI = rect(44, 132, 66, 206) + rect(92, 110, 114, 206) + rect(114, 146, 150, 166) + rect(26, 196, 162, 218)

# the crossing of the long horizontal and the slash, opened into a crosshair gap
GAP = rect(134, 66, 178, 112)

V1 = TOP + HOR + SLASH + HOOK + DOT + ZHI


def mark(variant, fill, bg=None):
    if variant == 1:      # faithful 武, squared
        body = '<path fill="%s" d="%s"/>' % (fill, V1)
    elif variant == 2:    # the shot, stopped: crosshair gap where the weapon's two strokes cross
        body = ('<mask id="m%s"><rect width="240" height="240" fill="#fff"/><path fill="#000" d="%s"/></mask>'
                '<path fill="%s" mask="url(#m%s)" d="%s"/>') % (fill[1:], GAP, fill, fill[1:], V1)
        body += '<path fill="%s" d="%s"/>' % (fill, rect(150, 83, 162, 95))   # the centre dot of the crosshair
    else:                 # seal: 武 cut out of a square chop
        body = '<rect width="240" height="240" fill="%s"/><g transform="translate(18 18) scale(.85)"><path fill="%s" d="%s"/></g>' % (fill, bg, V1)
    return '<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">%s</svg>' % body


GOLD, BLACK, PARCH, INK, PORC = '#C9A44C', '#0B0D10', '#EFE9DA', '#14161C', '#F2EEE3'
NAMES = [
    ('1', '武, squared', 'The character itself, cut from straight blocks. The slash of 戈 reads as a tracer line.'),
    ('2', 'The shot, stopped', 'Where the weapon\'s two strokes cross, a crosshair gap opens. 止戈为武 in one detail.'),
    ('3', 'Seal', '武 cut out of a square chop: the crest you earn, stamped on posters, jerseys, certificates.'),
]

cols = ''
for v, title, line in NAMES:
    v = int(v)
    dark = mark(v, GOLD, BLACK)
    light = mark(v, INK, PORC)
    small = ''.join('<figure><div style="width:%dpx;height:%dpx">%s</div><figcaption>%d</figcaption></figure>' % (s, s, mark(v, GOLD, BLACK), s) for s in (16, 32, 64))
    lock = '<div class="lock"><div style="width:58px;height:58px">%s</div><div><b>ISCC</b><i>国际学校CS2锦标赛</i></div></div>' % mark(v, GOLD, BLACK)
    cols += '''<section><h2><span>%d</span>%s</h2><p>%s</p>
<div class="stage d"><div class="hero">%s</div></div>
<div class="stage l"><div class="hero sm">%s</div></div>
<div class="row">%s</div>%s</section>''' % (v, title, line, dark, light, small, lock)

html = '''<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="file://%s/kit/fonts/iscc-fonts.css">
<style>*{box-sizing:border-box;margin:0}
body{background:#0B0D10;color:#EFE9DA;font:400 15px/1.5 Archivo,sans-serif;padding:44px;width:1500px}
header{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:30px}
h1{font:900 54px/.92 'Big Shoulders Display';text-transform:uppercase}h1 em{font:900 46px/1 'Noto Serif SC';font-style:normal;color:#C9A44C;margin-left:14px}
header p{max-width:52ch;color:#9AA3B2;text-align:right}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
h2{font:800 24px/1 'Big Shoulders Display';letter-spacing:.06em;text-transform:uppercase;display:flex;gap:12px;align-items:baseline}
h2 span{font-size:44px;color:#C9A44C}
section>p{color:#9AA3B2;font-size:14px;margin:8px 0 14px;min-height:42px}
.stage{display:grid;place-items:center;padding:34px}.stage.d{background:#07090D;outline:1px solid rgba(154,163,178,.16);outline-offset:-1px}.stage.l{background:#F2EEE3;padding:22px}
.hero{width:240px;height:240px}.hero.sm{width:120px;height:120px}
.row{display:flex;gap:26px;align-items:flex-end;padding:18px 0;border-bottom:1px solid rgba(154,163,178,.16)}
figure{display:flex;flex-direction:column;align-items:center;gap:6px;margin:0}figcaption{font:600 11px Archivo;letter-spacing:.2em;color:#9AA3B2}
svg{display:block;width:100%%;height:100%%}
.lock{display:flex;align-items:center;gap:14px;padding-top:18px}.lock b{display:block;font:900 40px/.9 'Big Shoulders Display';letter-spacing:.04em}.lock i{font:900 13px/1.6 'Noto Serif SC';font-style:normal;letter-spacing:.2em;color:#C9A44C}
footer{margin-top:26px;color:#9AA3B2;font:600 11px/1.7 Archivo;letter-spacing:.2em;text-transform:uppercase}
</style></head><body>
<header><h1>Logo sketch<em>止戈为武</em></h1><p>True skill is the power to stop the weapon. Three ways to cut 武 for ISCC, on a 240-unit grid, one colour, tested at 16 / 32 / 64 px.</p></header>
<div class="grid">%s</div>
<footer>Sketches for direction, not final artwork: optical corrections, stroke contrast and ink traps come in the final drawing.</footer>
</body></html>''' % (R, cols)

out = os.path.join(R, 'concepts/wu-logo-sketch.html')
open(out, 'w').write(html)
for v in (1, 2, 3):
    open(os.path.join(R, 'concepts/wu-mark-%d.svg' % v), 'w').write(mark(v, GOLD, BLACK))
js = ("const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();"
      "const p=await b.newPage({viewport:{width:1500,height:900},deviceScaleFactor:1.5});"
      "await p.goto('file://%s');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);"
      "await p.screenshot({path:'%s',fullPage:true});await b.close()})()") % (out, out.replace('.html', '.png'))
subprocess.check_call(['node', '-e', js])
print('wrote', out.replace('.html', '.png'))
