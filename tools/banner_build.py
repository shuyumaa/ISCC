#!/usr/bin/env python3
"""ISCC banners in the style of the user's poster: backlit rays (re-rendered per size), colour fringing and grain,
gold glitter 百炼 / 成徽 with a mirrored chromatic reflection, grey title and info line, vertical side credits.
-> kit/banners/ISCC-banner-<w>x<h>.png and @2x.   python3 tools/banner_build.py"""
import os, sys, shutil, subprocess
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import poster_rays as pr

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(R, 'kit/banners')
SRC = os.path.join(OUT, 'src')
os.makedirs(SRC, exist_ok=True)

# name: (w, h, cup centre x, cup top, cup width) in 1x px
SIZES = {
    '1142x240': (1142, 240, 571, 50, 108),
    '700x210': (700, 210, 350, 46, 90),
    '800x800': (800, 800, 400, 196, 236),
}
SCALE = 2                       # render plates at 2x for the @2x export
PXMM = pr.DPI / 25.4            # generator works in mm at 300 dpi


def mm(px):
    return px * SCALE / PXMM


def rays():
    pr.FMT = {k: (mm(w), mm(h), mm(cx), mm(t), mm(cw)) for k, (w, h, cx, t, cw) in SIZES.items()}
    for k, (w, h, cx, t, cw) in SIZES.items():
        pr.GLOW = {'1142x240': 2.6, '700x210': 2.2}.get(k, 1.0)
        pr.render(k, 'dark')
        src = os.path.join(pr.P, 'rays-dark-%s.jpg' % k)
        im = Image.open(src).convert('RGB')
        os.remove(src)
        # colour fringing about the light source, as in the poster
        lx, ly = cx * SCALE, (t + cw * 1.24 * 0.26) * SCALE
        pad = int(max(im.size) * 0.03)
        big = Image.fromarray(np.pad(np.asarray(im), ((pad, pad), (pad, pad), (0, 0)), mode='reflect'))
        px, py = lx + pad, ly + pad
        ch = []
        for c, s in zip(big.split(), (1.012, 1.0, 0.988)):
            ch.append(c.transform(big.size, Image.AFFINE, (1 / s, 0, px * (1 - 1 / s), 0, 1 / s, py * (1 - 1 / s)), resample=Image.BICUBIC))
        a = np.asarray(Image.merge('RGB', ch), np.float32)[pad:-pad, pad:-pad]
        rng = np.random.default_rng(7)
        a += rng.normal(0, 7.0, a.shape[:2])[..., None]          # monochrome film grain
        Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(os.path.join(SRC, 'rays-%s.jpg' % k), quality=92, subsampling=0)
        print('rays', k)


def glitter():
    rng = np.random.default_rng(3)
    n = 384
    base = np.array([201, 164, 76], np.float32)
    lit = np.array([240, 214, 150], np.float32)
    v = rng.normal(0, 1, (n, n))
    v = (v + np.roll(v, 1, 0) + np.roll(v, 1, 1)) / 3
    t = np.clip(0.55 + 0.32 * v, 0, 1)[..., None]
    img = base * (0.55 + 0.6 * t)
    sp = rng.random((n, n)) < 0.035
    img[sp] = lit * rng.uniform(0.95, 1.1, (sp.sum(), 1))
    dk = rng.random((n, n)) < 0.05
    img[dk] *= 0.55
    Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(os.path.join(SRC, 'glitter.png'))


CSS = '''*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#000}
.b{position:relative;overflow:hidden;background:#07090D center/cover no-repeat}
.b>*{position:absolute;white-space:nowrap}
.cn{font-family:'Noto Serif SC',serif;font-weight:900}
.gold{background:url(src/glitter.png) 0 0/96px repeat;-webkit-background-clip:text;background-clip:text;color:transparent}
.refl{transform:scaleY(-1);transform-origin:center;opacity:.32;filter:blur(.7px) drop-shadow(-2px 0 0 rgba(72,104,164,.75)) drop-shadow(2px 0 0 rgba(228,207,154,.45));
  -webkit-mask:linear-gradient(to top,#000,transparent 72%);mask:linear-gradient(to top,#000,transparent 72%)}
.grey{color:#9AA3B2;opacity:.72}
.side{font:800 var(--sf)/1 'Big Shoulders Display',sans-serif;letter-spacing:.04em;color:#EFE9DA;opacity:.9;top:50%}
.side.l{left:var(--se);transform:translate(-50%,-50%) rotate(90deg)}
.side.r{right:var(--se);transform:translate(50%,-50%) rotate(-90deg)}
'''

INFO = '十二月 2026 | 微信号: FAZE_CLAN_CS'


def page(k):
    w, h, cx, t, cw = SIZES[k]
    if k == '1142x240':
        f, top, gap, title, tsz, ty, isz, ib, sf, se = 70, 92, 74, '国际学校CS2锦标赛', 22, 14, 14, 12, 9, 15
    elif k == '700x210':
        f, top, gap, title, tsz, ty, isz, ib, sf, se = 54, 92, 58, '国际学校CS2锦标赛', 16, 12, 11, 10, 8, 12
    else:
        f, top, gap, title, tsz, ty, isz, ib, sf, se = 118, 500, 108, '国际学校CS2锦标赛', 44, 50, 22, 34, 12, 20
    lh = f * 1.0
    words = ''
    for side, txt in (('l', '百炼'), ('r', '成徽')):
        pos = 'right:%gpx' % (w - cx + gap) if side == 'l' else 'left:%gpx' % (cx + gap)
        words += '<div class="cn gold" style="%s;top:%gpx;font-size:%gpx;line-height:1">%s</div>' % (pos, top, f, txt)
        words += '<div class="cn gold refl" style="%s;top:%gpx;font-size:%gpx;line-height:1">%s</div>' % (pos, top + lh * 0.96, f, txt)
    if k == '1142x240':
        tpos = 'left:44px;top:50%%;transform:translateY(-50%%);font-size:%gpx' % tsz
        ipos = 'right:44px;top:50%%;transform:translateY(-50%%);font-size:%gpx' % isz
    elif k == '700x210':
        tpos = 'left:30px;top:16px;font-size:%gpx' % tsz
        ipos = 'right:30px;bottom:14px;font-size:%gpx' % isz
    else:
        tpos = 'left:50%%;top:%gpx;transform:translateX(-50%%);font-size:%gpx' % (ty, tsz)
        ipos = 'left:50%%;bottom:%gpx;transform:translateX(-50%%);font-size:%gpx' % (ib, isz)
    return '''<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="file://%s/kit/fonts/iscc-fonts.css"><style>%s</style></head>
<body><div class="b" id="b" style="width:%dpx;height:%dpx;background-image:url(src/rays-%s.jpg);--sf:%gpx;--se:%gpx">
<div class="cn grey" style="%s;letter-spacing:.02em">%s</div>
%s
<div class="cn grey" style="%s;letter-spacing:.02em">%s</div>
<div class="side l">© ISCC &amp; Sean Ma 2026</div><div class="side r">All Rights Reserved.</div>
</div></body></html>''' % (R, CSS, w, h, k, sf, se, tpos, title, words, ipos, INFO)


def shoot():
    js = []
    for k, (w, h, *_ ) in SIZES.items():
        html = os.path.join(OUT, 'ISCC-banner-%s.html' % k)
        open(html, 'w', encoding='utf-8').write(page(k))
        for dsf, suf in ((1, ''), (2, '@2x')):
            js.append("await shot('%s',%d,%d,%d,'%s');" % (html, w, h, dsf, os.path.join(OUT, 'ISCC-banner-%s%s.png' % (k, suf))))
    code = ("const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();"
            "async function shot(f,w,h,d,o){const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:d});"
            "await p.goto('file://'+f);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(200);"
            "await (await p.$('#b')).screenshot({path:o});await p.close()}" + ''.join(js) + "await b.close()})()")
    subprocess.check_call(['node', '-e', code])
    print('wrote banners')


if __name__ == '__main__':
    if '--no-rays' not in sys.argv:
        rays()
    glitter()
    shoot()
