#!/usr/bin/env python3
"""ISCC 'lineup' logo: heavy wordmark + one tapered throw arc (its loop is a cursive e, the bounce) flying into a crosshair.
Pure-path SVG + transparent PNGs -> kit/logos/lineup/, preview -> concepts/lineup-logo.png.  python3 tools/lineup_logo.py"""
import os, math, shutil, subprocess
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(R, 'kit/logos/lineup')
GOLD, PARCH, INK, BLACK, PORC = '#C9A44C', '#EFE9DA', '#14161C', '#0B0D10', '#F2EEE3'


def wordmark(cap=190, x0=300, base=360, track=-6):
    f = TTFont(os.path.join(R, 'kit/fonts/ttf/Archivo-Bold.ttf'))
    gs, cmap, hmtx = f.getGlyphSet(), f.getBestCmap(), f['hmtx']
    capH = f['OS/2'].sCapHeight or 0.7 * f['head'].unitsPerEm
    k = cap / capH
    x, d, bp = x0, '', BoundsPen(None)
    for ch in 'ISCC':
        g = cmap[ord(ch)]
        sp = SVGPathPen(None)
        for pen in (sp, bp):
            gs[g].draw(TransformPen(pen, (k, 0, 0, -k, x, base)))
        d += sp.getCommands()
        x += hmtx[g][0] * k + track
    return d, bp.bounds


def bez(p0, c1, c2, p1, n=60):
    pts = []
    for i in range(n):
        t = i / n
        u = 1 - t
        pts.append((u ** 3 * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t ** 3 * p1[0],
                    u ** 3 * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t ** 3 * p1[1]))
    return pts


def stroke(segs, wmin, wmax, tipmin):
    pts = []
    for sg in segs:
        pts += bez(*sg)
    pts.append(segs[-1][3])
    acc = [0.0]
    for a, b in zip(pts, pts[1:]):
        acc.append(acc[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
    total = acc[-1]
    left, right = [], []
    for i, p in enumerate(pts):
        a, b = pts[max(0, i - 1)], pts[min(len(pts) - 1, i + 1)]
        tx, ty = b[0] - a[0], b[1] - a[1]
        m = math.hypot(tx, ty) or 1
        nx, ny = -ty / m, tx / m
        t = acc[i] / total
        w = wmin + (wmax - wmin) * (math.sin(math.pi * min(1, t * 1.12)) ** 0.6)
        if t > 0.86:
            w = max(w, tipmin)
        left.append((p[0] + nx * w, p[1] + ny * w))
        right.append((p[0] - nx * w, p[1] - ny * w))
    return 'M' + 'L'.join('%.1f %.1f' % q for q in left + right[::-1]) + 'Z'


def icon_paths():
    """Square icon on a 240 grid: a short run-in, the e loop, one throw up into the crosshair."""
    segs = [
        ((18, 198), (40, 202), (62, 200), (84, 192)),
        ((84, 192), (112, 182), (124, 146), (102, 134)),
        ((102, 134), (80, 122), (54, 146), (60, 172)),
        ((60, 172), (66, 198), (106, 204), (132, 192)),
        ((132, 192), (160, 180), (166, 144), (168, 124)),
    ]
    return stroke(segs, 4.0, 10.5, 6.5), crosshair((192, 74), arm=22, gap=12, th=12)


def arc_path(wb, wmul=1.0):
    """Centreline: a low throw from the left, an e-loop under the S/C (the bounce), then up into the crosshair."""
    x0, y0, x1, y1 = wb
    base = y1
    L = x0 - 170
    lx = x0 + (x1 - x0) * 0.34          # loop sits under the S
    cx, cy = x1 + 92, y0 + (base - y0) * 0.42   # crosshair centre, beside the last C
    segs = [
        ((L, base + 118), (L + 140, base + 146), (lx - 150, base + 142), (lx - 20, base + 116)),
        ((lx - 20, base + 116), (lx + 22, base + 106), (lx + 52, base + 80), (lx + 32, base + 66)),
        ((lx + 32, base + 66), (lx + 12, base + 52), (lx - 40, base + 62), (lx - 44, base + 90)),
        ((lx - 44, base + 90), (lx - 48, base + 118), (lx + 10, base + 130), (lx + 80, base + 124)),
        ((lx + 80, base + 124), (lx + 360, base + 130), (x1 + 0, base + 70), (cx - 24, cy + 20)),
    ]
    pts = []
    for s in segs:
        pts += bez(*s)
    pts.append(segs[-1][3])
    # arc length parameter
    acc = [0.0]
    for a, b in zip(pts, pts[1:]):
        acc.append(acc[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
    total = acc[-1]
    left, right = [], []
    for i, p in enumerate(pts):
        a = pts[max(0, i - 1)]
        b = pts[min(len(pts) - 1, i + 1)]
        tx, ty = b[0] - a[0], b[1] - a[1]
        m = math.hypot(tx, ty) or 1
        nx, ny = -ty / m, tx / m
        t = acc[i] / total
        w = (2.2 + 8.5 * (math.sin(math.pi * min(1, t * 1.12)) ** 0.6)) * wmul   # brush taper: fine start, full body, fine tip
        if t > 0.86:
            w = max(w, 3.6 * wmul)
        left.append((p[0] + nx * w, p[1] + ny * w))
        right.append((p[0] - nx * w, p[1] - ny * w))
    poly = left + right[::-1]
    d = 'M' + 'L'.join('%.1f %.1f' % q for q in poly) + 'Z'
    return d, (cx, cy)


def crosshair(c, arm=30, gap=13, th=9):
    x, y = c
    h = th / 2
    r = lambda a, b, cc, dd: 'M%.1f %.1fH%.1fV%.1fH%.1fZ' % (a, b, cc, dd, a)
    return (r(x - h, y - gap - arm, x + h, y - gap) + r(x - h, y + gap, x + h, y + gap + arm) +
            r(x - gap - arm, y - h, x - gap, y + h) + r(x + gap, y - h, x + gap + arm, y + h) +
            'M%.1f %.1fm-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0Z' % (x, y))


WD, WB = wordmark()
AD, C = arc_path(WB)
XD = crosshair(C)
AD_ICON, _ = arc_path(WB, 2.2)
XD_ICON = crosshair(C, arm=34, gap=13, th=15)
PAD = 40
VB = (WB[0] - 170 - PAD, C[1] - 43 - PAD, (C[0] + 43 + PAD) - (WB[0] - 170 - PAD), (WB[3] + 150 + PAD) - (C[1] - 43 - PAD))


def svg(word, accent, kind='full'):
    if kind == 'icon':      # the gesture alone, drawn for a square: e loop -> throw -> crosshair
        ia, ix = icon_paths()
        vb = (0, 0, 240, 240)
        body = '<path fill="%s" d="%s"/><path fill="%s" d="%s"/>' % (accent, ia, accent, ix)
    else:
        vb = VB
        body = '<path fill="%s" d="%s"/><path fill="%s" d="%s"/><path fill="%s" d="%s"/>' % (word, WD, accent, AD, accent, XD)
    w, h = vb[2], vb[3]
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="%.1f %.1f %.1f %.1f" width="%d" height="%d"><title>ISCC</title>%s</svg>'
            % (vb[0], vb[1], w, h, round(w), round(h), body)), w, h


VARIANTS = {
    'dark': (PARCH, GOLD), 'light': (INK, GOLD), 'gold': (GOLD, GOLD),
    'parchment': (PARCH, PARCH), 'black': (BLACK, BLACK),
}


def main():
    os.makedirs(os.path.join(OUT, 'png'), exist_ok=True)
    tmp = os.path.join(OUT, '.render')
    os.makedirs(tmp, exist_ok=True)
    js = "const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();"
    i = 0
    for kind in ('full', 'icon'):
        for name, (wc, ac) in VARIANTS.items():
            s, w, h = svg(wc, ac, kind)
            fn = 'iscc-lineup-%s-%s' % (kind, name)
            open(os.path.join(OUT, fn + '.svg'), 'w').write(s)
            for px in (1024, 2048):
                sc = px / max(w, h)
                W, H = round(w * sc), round(h * sc)
                hp = os.path.join(tmp, '%d.html' % i)
                i += 1
                s2 = s.replace('width="%d" height="%d"' % (round(w), round(h)), 'width="%d" height="%d"' % (W, H), 1)
                open(hp, 'w').write('<!doctype html><body style="margin:0;background:transparent">%s</body>' % s2)
                js += ("await p.setViewportSize({width:%d,height:%d});await p.goto('file://%s');"
                       "await p.screenshot({path:'%s',omitBackground:true,clip:{x:0,y:0,width:%d,height:%d}});") % (W, H, hp, os.path.join(OUT, 'png', '%s-%d.png' % (fn, px)), W, H)
    js += "await b.close()})()"
    subprocess.check_call(['node', '-e', js])
    shutil.rmtree(tmp)

    full_d, _, _ = svg(PARCH, GOLD)
    full_l, _, _ = svg(INK, GOLD)
    icon_d, _, _ = svg(PARCH, GOLD, 'icon')
    mono, _, _ = svg(BLACK, BLACK)
    sizes = ''.join('<figure><div style="width:%dpx;height:%dpx">%s</div><figcaption>%d</figcaption></figure>' % (z, z, icon_d, z) for z in (24, 48, 96)) + '<figure><div style="width:96px;height:96px;background:#C9A44C;border-radius:50%%;padding:14px">%s</div><figcaption>avatar</figcaption></figure>' % svg(BLACK, BLACK, 'icon')[0]
    html = '''<!doctype html><html><head><meta charset="utf-8"><style>*{margin:0;box-sizing:border-box}
body{background:#0B0D10;color:#EFE9DA;font:14px sans-serif;padding:40px;width:1400px}
.g{display:grid;grid-template-columns:1fr 1fr;gap:16px}.p{display:grid;place-items:center;padding:60px 40px;aspect-ratio:16/10}
.d{background:#07090D;outline:1px solid rgba(154,163,178,.16)}.l{background:#F2EEE3}.w{background:#fff}.ray{background:url(file://%s/kit/banners/src/rays-800x800.jpg) center/cover}
.p>div{width:100%%}svg{width:100%%;height:auto;display:block}.ic{width:220px}.row{display:flex;gap:28px;align-items:flex-end;margin-top:16px}
figure{display:flex;flex-direction:column;align-items:center;gap:6px;margin:0}figcaption{font:600 11px sans-serif;letter-spacing:.18em;color:#9AA3B2}
</style></head><body><div class="g">
<div class="p d"><div>%s</div></div><div class="p l"><div>%s</div></div>
<div class="p ray"><div style="width:70%%">%s</div></div><div class="p w"><div>%s</div></div>
</div><div class="row"><div class="ic">%s</div>%s</div></body></html>''' % (R, full_d, full_l, full_d, mono, icon_d, sizes)
    p = os.path.join(R, 'concepts/lineup-logo.html')
    open(p, 'w').write(html)
    subprocess.check_call(['node', '-e', "const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1480,height:900}});await p.goto('file://%s');await p.screenshot({path:'%s',fullPage:true});await b.close()})()" % (p, p.replace('.html', '.png'))])
    print('ok')


if __name__ == '__main__':
    main()
