#!/usr/bin/env python3
"""Blackletter monogram + heavy wide 'ISCC' wordmark (after the user's design.com mockup), rebuilt from OFL fonts
as pure-path SVG.  python3 tools/blackletter_logo.py [--sheet]  ->  concepts/blackletter-options.png, kit/logos/blackletter/"""
import os, sys, subprocess
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
F = os.path.join(R, 'tools/.fontcache/bl/package')
FONTS = {
    'maguntia': '400Regular/UnifrakturMaguntia_400Regular.ttf',
    'cook': '700Bold/UnifrakturCook_700Bold.ttf',
    'grenze': '900Black/GrenzeGotisch_900Black.ttf',
    'pirata': '400Regular/PirataOne_400Regular.ttf',
}
WORD = '400Regular/ArchivoBlack_400Regular.ttf'
_c = {}


def font(rel):
    if rel not in _c:
        _c[rel] = TTFont(os.path.join(F, rel))
    return _c[rel]


def text_path(rel, s, tracking=0.0):
    """Path data for string s, 1000-unit em, baseline at y=0 (y down), plus (xmin, ymin, xmax, ymax)."""
    f = font(rel)
    gs, cmap, hmtx = f.getGlyphSet(), f.getBestCmap(), f['hmtx']
    k = 1000.0 / f['head'].unitsPerEm
    x, d = 0.0, ''
    bp = BoundsPen(None)
    for ch in s:
        g = cmap[ord(ch)]
        sp = SVGPathPen(None)
        for pen in (sp, bp):
            gs[g].draw(TransformPen(pen, (k, 0, 0, -k, x, 0)))
        d += sp.getCommands()
        x += hmtx[g][0] * k + tracking
    return d, bp.bounds


def place(d, b, x, y, h=None, w=None):
    """Transform string for path d with bounds b so it fits height h (or width w) with top-left at (x, y)."""
    s = (h / (b[3] - b[1])) if h else (w / (b[2] - b[0]))
    return 'translate(%.2f %.2f) scale(%.4f) translate(%.2f %.2f)' % (x, y, s, -b[0], -b[1]), s


def lockup(letter_font, letter, fill, kind='stacked'):
    """Returns (svg, w, h). stacked = monogram over wordmark (as in the mockup); horizontal = side by side; mark = monogram alone."""
    md, mb = text_path(FONTS[letter_font], letter)
    wd, wb = text_path(WORD, 'ISCC', tracking=-10)
    if kind == 'mark':
        W = H = 1000
        mh = 860
        mw = (mb[2] - mb[0]) * mh / (mb[3] - mb[1])
        t, _ = place(md, mb, (W - mw) / 2, (H - mh) / 2, h=mh)
        body = '<path transform="%s" d="%s"/>' % (t, md)
    elif kind == 'stacked':
        W, H = 1000, 1000
        mh = 560
        mw = (mb[2] - mb[0]) * mh / (mb[3] - mb[1])
        ww = 520
        wh = (wb[3] - wb[1]) * ww / (wb[2] - wb[0])
        top = (H - (mh + 70 + wh)) / 2
        t1, _ = place(md, mb, (W - mw) / 2, top, h=mh)
        t2, _ = place(wd, wb, (W - ww) / 2, top + mh + 70, w=ww)
        body = '<path transform="%s" d="%s"/><path transform="%s" d="%s"/>' % (t1, md, t2, wd)
    else:
        H = 400
        mh = 340
        mw = (mb[2] - mb[0]) * mh / (mb[3] - mb[1])
        wh = 150
        ww = (wb[2] - wb[0]) * wh / (wb[3] - wb[1])
        W = int(30 + mw + 50 + ww + 30)
        t1, _ = place(md, mb, 30, (H - mh) / 2, h=mh)
        t2, _ = place(wd, wb, 30 + mw + 50, (H - wh) / 2, h=wh)
        body = '<path transform="%s" d="%s"/><path transform="%s" d="%s"/>' % (t1, md, t2, wd)
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" height="%d"><title>ISCC</title>'
           '<g fill="%s">%s</g></svg>') % (W, H, W, H, fill, body)
    return svg, W, H


def sheet():
    cells = ''
    for fk in FONTS:
        for L in 'ISC':
            svg, _, _ = lockup(fk, L, '#C9A44C')
            cells += '<figure><div class="t">%s</div><figcaption>%s · %s</figcaption></figure>' % (svg, fk, L)
    html = ('<body style="margin:0;background:#0B0D10;color:#9AA3B2;font:13px sans-serif;padding:24px;width:1300px">'
            '<style>.g{display:grid;grid-template-columns:repeat(6,1fr);gap:14px}.t{background:#07090D;aspect-ratio:1}svg{width:100%;height:100%}figure{margin:0}</style>'
            '<div class="g">' + cells + '</div></body>')
    p = os.path.join(R, 'concepts/blackletter-options.html')
    open(p, 'w').write(html)
    shot(p, 1348, p.replace('.html', '.png'))


def shot(html, w, png):
    js = ("const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:%d,height:800}});"
          "await p.goto('file://%s');await p.screenshot({path:'%s',fullPage:true});await b.close()})()") % (w, html, png)
    subprocess.check_call(['node', '-e', js])


if __name__ == '__main__':
    if '--sheet' in sys.argv:
        sheet()
        print('sheet')


COLOURS = {'gold': '#C9A44C', 'black': '#0B0D10', 'parchment': '#EFE9DA', 'ink': '#14161C'}


def export():
    out = os.path.join(R, 'kit/logos/blackletter')
    os.makedirs(os.path.join(out, 'png'), exist_ok=True)
    jobs = []
    for L, tag in (('I', 'I'), ('S', 'S')):
        for kind in ('stacked', 'horizontal', 'mark'):
            for cn, cv in COLOURS.items():
                svg, W, H = lockup('maguntia', L, cv, kind)
                name = 'iscc-blackletter-%s-%s-%s' % (tag, kind, cn)
                open(os.path.join(out, name + '.svg'), 'w').write(svg)
                if cn in ('gold', 'parchment', 'black'):
                    for px in (1024, 2048):
                        jobs.append((os.path.join(out, name + '.svg'), W, H, px, os.path.join(out, 'png', '%s-%d.png' % (name, px))))
    js = "const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();"
    for svgp, W, H, px, png in jobs:
        sc = px / max(W, H)
        js += ("await p.setViewportSize({width:%d,height:%d});await p.goto('file://%s');"
               "await p.screenshot({path:'%s',omitBackground:true,clip:{x:0,y:0,width:%d,height:%d}});") % (round(W * sc), round(H * sc), svgp + '#', png, round(W * sc), round(H * sc))
    js += "await b.close()})()"
    # render each svg scaled to the target size via an html wrapper
    js = js.replace("await p.goto('file://", "await p.setContent('<html><body style=\"margin:0;background:transparent\"><img style=\"width:100%;height:100%;display:block\" src=\"file://").replace("#');", "\"></body></html>');await p.waitForTimeout(30);")
    subprocess.check_call(['node', '-e', js])
    print('exported', len(jobs), 'pngs to', out)


def preview():
    rows = ''
    for L in 'IS':
        st_d, _, _ = lockup('maguntia', L, '#C9A44C', 'stacked')
        st_l, _, _ = lockup('maguntia', L, '#14161C', 'stacked')
        hz, W, H = lockup('maguntia', L, '#C9A44C', 'horizontal')
        mk, _, _ = lockup('maguntia', L, '#C9A44C', 'mark')
        sizes = ''.join('<figure><div style="width:%dpx;height:%dpx">%s</div><figcaption>%d</figcaption></figure>' % (z, z, mk, z) for z in (16, 32, 64))
        rows += ('<section><h2>Monogram %s</h2><div class="r"><div class="p d">%s</div><div class="p l">%s</div>'
                 '<div class="p ray"><div class="lk">%s</div></div></div><div class="r2"><div class="hz">%s</div><div class="sz">%s</div></div></section>') % (
            L, st_d, st_l, st_d.replace('#C9A44C', '#EFE9DA'), hz, sizes)
    html = '''<!doctype html><html><head><meta charset="utf-8"><style>*{margin:0;box-sizing:border-box}
body{background:#0B0D10;color:#EFE9DA;font:14px Archivo,sans-serif;padding:40px;width:1400px}
h1{font:900 44px/1 Archivo,sans-serif;margin-bottom:26px}h2{font:700 13px Archivo,sans-serif;letter-spacing:.24em;text-transform:uppercase;color:#C9A44C;margin:26px 0 12px}
.r{display:grid;grid-template-columns:1fr 1fr 1.6fr;gap:16px}.p{aspect-ratio:1;display:grid;place-items:center;padding:30px}.p.ray{aspect-ratio:auto;background:url(file://%s/kit/banners/src/rays-800x800.jpg) center/cover}
.p.d{background:#07090D;outline:1px solid rgba(154,163,178,.16)}.p.l{background:#F2EEE3}.lk{width:240px;height:240px}
svg{width:100%%;height:100%%;display:block}.r2{display:flex;justify-content:space-between;align-items:flex-end;padding:18px 0;border-bottom:1px solid rgba(154,163,178,.16)}
.hz{width:420px}.sz{display:flex;gap:22px;align-items:flex-end}figure{display:flex;flex-direction:column;align-items:center;gap:6px;margin:0}figcaption{font:600 11px sans-serif;letter-spacing:.18em;color:#9AA3B2}
</style></head><body><h1>ISCC · blackletter monogram</h1>%s</body></html>''' % (R, rows)
    p = os.path.join(R, 'concepts/blackletter-logo.html')
    open(p, 'w').write(html)
    shot(p, 1480, p.replace('.html', '.png'))


if __name__ == '__main__' and '--export' in sys.argv:
    export()
    preview()
    print('preview')
