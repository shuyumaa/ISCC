#!/usr/bin/env python3
"""ISCC logo directions — generates concepts/logo-directions.html.
Every mark is emitted as plain absolute path data (no text, no transforms)."""
import math, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def n(v):
    return ('%.2f' % v).rstrip('0').rstrip('.')


def P(p):
    return n(p[0]) + ' ' + n(p[1])


def corner(a, c, b, k=0.62):
    """Cubic from a to b around corner point c. k=.552 circle, higher = squarer."""
    c1 = (a[0] + k * (c[0] - a[0]), a[1] + k * (c[1] - a[1]))
    c2 = (b[0] + k * (c[0] - b[0]), b[1] + k * (c[1] - b[1]))
    return 'C' + P(c1) + ' ' + P(c2) + ' ' + P(b)


def L(p):
    return 'L' + P(p)


def M(p):
    return 'M' + P(p)


# ---------------------------------------------------------------- cup profile
def profile_path(cx, top, prof, sx=1.0, sy=1.0, side=0):
    """prof: [(x,y), ('L',(x,y)) | ('C',c1,c2,p) ...] right half, x from axis.
    side 0 = both halves closed; +1 right half only; -1 left half only."""
    def T(p, s=1):
        return (cx + s * p[0] * sx, top + p[1] * sy)
    start = prof[0]
    segs = prof[1:]
    pts = [start] + [s[-1] for s in segs]
    d = []
    if side >= 0:
        d.append(M(T(start)))
        for s in segs:
            if s[0] == 'L':
                d.append(L(T(s[1])))
            else:
                d.append('C' + P(T(s[1])) + ' ' + P(T(s[2])) + ' ' + P(T(s[3])))
    if side == 1:
        d.append(L((cx, top + pts[-1][1] * sy)))
        d.append(L((cx, top + start[1] * sy)))
        d.append('Z')
        return ''.join(d)
    if side == -1:
        d.append(M((cx, top + start[1] * sy)))
        d.append(L((cx, top + pts[-1][1] * sy)))
    d.append(L(T(pts[-1], -1)))
    for i in range(len(segs) - 1, -1, -1):
        s = segs[i]
        prev = pts[i]
        if s[0] == 'L':
            d.append(L(T(prev, -1)))
        else:
            d.append('C' + P(T(s[2], -1)) + ' ' + P(T(s[1], -1)) + ' ' + P(T(prev, -1)))
    d.append('Z')
    return ''.join(d)


# The championship cup: flared lip, deep bowl, knop, spread foot. 104 x 140.
CUP = [
    (52, 0),
    ('C', (53.6, 2.6), (53.6, 5.4), (51.2, 7.4)),    # lip roll
    ('C', (51.6, 34), (47, 58), (30, 71)),           # bowl wall
    ('C', (23, 76.5), (15, 79), (9.5, 81)),          # bowl floor into neck
    ('L', (8.6, 97)),                                # stem, slight taper
    ('C', (8.6, 106), (22, 108.5), (31, 113)),       # foot spread
    ('L', (31, 119)),
    ('L', (39, 119)),                                # plinth
    ('L', (39, 140)),
]


# ------------------------------------------------------------ direction A
def mark_a():
    """Face-off. A crosshair with heavy side posts; the gap between the two
    sides is the cup."""
    cx = 120
    top, bot = 82, 158          # post height 76 at the gap
    h = bot - top
    # right half of the negative cup, x from axis (rim 31 -> stem 5 -> foot 22)
    def prof(s):
        x = lambda v: cx + s * v
        return [
            (x(34), top),
            'C%s %s %s' % (P((x(34.5), top + .40 * h)), P((x(27), top + .60 * h)), P((x(6.5), top + .64 * h))),
            L((x(6.5), top + .77 * h)),
            'C%s %s %s' % (P((x(6.5), top + .89 * h)), P((x(19), top + .91 * h)), P((x(26), bot))),
        ]
    r = prof(1)
    right = M(r[0]) + r[1] + r[2] + r[3] + L((234, bot - 5)) + L((234, top + 5)) + 'Z'
    l = prof(-1)
    left = M(l[0]) + l[1] + l[2] + l[3] + L((6, bot - 5)) + L((6, top + 5)) + 'Z'
    tw = 11     # half tick width
    tick_t = M((cx - tw, 8)) + L((cx + tw, 8)) + L((cx + tw, 62)) + L((cx - tw, 62)) + 'Z'
    tick_b = M((cx - tw, 178)) + L((cx + tw, 178)) + L((cx + tw, 232)) + L((cx - tw, 232)) + 'Z'
    return {'left': left, 'right': right, 'ticks': tick_t + tick_b}


def mark_a_micro():
    """16 px optical cut on a 16-unit grid: the cup reduces to a flared gap."""
    left = 'M0 5H5.2L7 7.4V8.6L5.9 11H0Z'
    right = 'M16 5H10.8L9 7.4V8.6L10.1 11H16Z'
    ticks = 'M7 0H9V3.4H7ZM7 12.6H9V16H7Z'
    return {'left': left, 'right': right, 'ticks': ticks}


# ------------------------------------------------------------ direction B
def shield_path(cx=120, top=46, w=104, straight=70, tip=204):
    x0, x1 = cx - w / 2, cx + w / 2
    d = M((x0, top))
    d += 'C%s %s %s' % (P((x0 + 18, top + 7)), P((cx - 16, top + 7)), P((cx, top)))
    d += 'C%s %s %s' % (P((cx + 16, top + 7)), P((x1 - 18, top + 7)), P((x1, top)))
    d += L((x1, top + straight))
    d += 'C%s %s %s' % (P((x1, top + straight + 44)), P((cx + 26, tip - 16)), P((cx, tip)))
    d += 'C%s %s %s' % (P((cx - 26, tip - 16)), P((x0, top + straight + 44)), P((x0, top + straight)))
    return d + 'Z'


def foot_b(cx, y0, hw_neck, hw_foot, y1):
    d = M((cx - hw_neck, y0))
    d += 'C%s %s %s' % (P((cx - hw_neck, y0 + 15)), P((cx - hw_foot + 6, y0 + 17)), P((cx - hw_foot, y1 - 9)))
    d += L((cx - hw_foot, y1)) + L((cx + hw_foot, y1)) + L((cx + hw_foot, y1 - 9))
    d += 'C%s %s %s' % (P((cx + hw_foot - 6, y0 + 17)), P((cx + hw_neck, y0 + 15)), P((cx + hw_neck, y0)))
    return d + 'Z'


def crosshair_cut(cx, cy, s, gap, ln):
    d = 'M%s %sH%sV%sH%sZ' % (n(cx - s), n(cy - gap - ln), n(cx + s), n(cy - gap), n(cx - s))
    d += 'M%s %sH%sV%sH%sZ' % (n(cx - s), n(cy + gap), n(cx + s), n(cy + gap + ln), n(cx - s))
    d += 'M%s %sH%sV%sH%sZ' % (n(cx - gap - ln), n(cy - s), n(cx - gap), n(cy + s), n(cx - gap - ln))
    d += 'M%s %sH%sV%sH%sZ' % (n(cx + gap), n(cy - s), n(cx + gap + ln), n(cy + s), n(cx + gap))
    return d


def mark_b(laurel=True):
    """The crest. The shield is the bowl of the cup; a crosshair is cut into
    it; the laurel is twelve leaves a side - MR12, one leaf a round."""
    cx, cy = 120, 104
    sh = shield_path(cx, 36, 110, 62, 180) + crosshair_cut(cx, 98, 5.2, 10, 24)
    out = {'shield': sh, 'foot': foot_b(cx, 166, 8, 34, 208)}
    if laurel:
        R = 99
        leaves = {-1: '', 1: ''}
        for side in (-1, 1):
            for i in range(12):
                a = math.radians(40 + i * (122 / 11))
                sc = 1.0 - 0.42 * (i / 11) ** 1.4
                tilt = math.radians(38)
                px, py = -R * math.sin(a), R * math.cos(a)
                tx, ty = -math.cos(a), -math.sin(a)
                nx, ny = -math.sin(a), math.cos(a)
                dx = math.cos(tilt) * tx + math.sin(tilt) * nx
                dy = math.cos(tilt) * ty + math.sin(tilt) * ny
                ln, wd = 25 * sc, 9.2 * sc
                ox, oy = -dy, dx
                def pt(u, v):
                    return (cx + side * (px + u * dx + v * ox), cy + (py + u * dy + v * oy))
                a0, a1 = pt(-ln / 2, 0), pt(ln / 2, 0)
                c1, c2 = pt(-ln * .08, wd * 1.2), pt(-ln * .08, -wd * 1.2)
                leaves[side] += M(a0) + 'Q%s %s' % (P(c1), P(a1)) + 'Q%s %s' % (P(c2), P(a0)) + 'Z'
        out['laurel_l'] = leaves[-1]
        out['laurel_r'] = leaves[1]
    return out

def mark_b_micro():
    sh = shield_path(120, 8, 176, 92, 204) + crosshair_cut(120, 92, 11, 22, 40)
    return {'shield': sh, 'foot': foot_b(120, 178, 16, 62, 236)}


# ------------------------------------------------------------ direction C
def mark_c():
    """Counterlight. One shaft of key light; inside it the cup is carved out,
    outside it the cup is solid. The shaft dies into smoke."""
    cx, top = 138, 50
    cup_r = profile_path(cx, top, CUP, side=1)
    cup_l = profile_path(cx, top, CUP, side=-1)
    # beam: right edge is the cup axis, left edge is the key-light angle
    beam = M((cx, 4)) + L((cx, 190))
    beam += 'A19 19 0 0 1 %s' % P((cx - 35, 200))
    beam += 'A31 31 0 0 1 %s' % P((cx - 92, 204))
    beam += 'A22 22 0 0 1 %s' % P((cx - 128, 186))
    beam += L((cx - 52, 22)) + 'Z'
    return {'beam': beam + cup_l, 'cup': cup_r}


# ------------------------------------------------------------ wordmarks
def glyph_I(ox, V, style):
    w = V + 2
    if style == 'flare':
        f = 4.6
        d = M((ox - f, 0)) + L((ox + w + f, 0))
        d += 'C%s %s %s' % (P((ox + w, 22)), P((ox + w, 78)), P((ox + w + f, 100)))
        d += L((ox - f, 100))
        d += 'C%s %s %s' % (P((ox, 78)), P((ox, 22)), P((ox - f, 0))) + 'Z'
        return d, w
    if style == 'shear':
        a = 11
        return M((ox, 0)) + L((ox + w, a)) + L((ox + w, 100)) + L((ox, 100 - a)) + 'Z', w
    # bar: the I is the crosshair's two vertical ticks, split by the gap
    g = 6.5
    return ('M%s 0H%sV%sH%sZ' % (n(ox), n(ox + w), n(50 - g), n(ox))
            + 'M%s %sH%sV100H%sZ' % (n(ox), n(50 + g), n(ox + w), n(ox))), w


def term(style, x_out, x_in, y, upper):
    """Terminal cut on the right arm, returns (outer point, inner point)."""
    if style == 'flare':
        return ((x_out + 4, y + (5 if upper else -5)), (x_in - 2, y + (-5 if upper else 5)))
    if style == 'shear':
        return ((x_out, y + 6), (x_in, y - 6))
    return ((x_out, y), (x_in, y))


def glyph_C(ox, W, V, H, R, ri, style, o=1.2):
    T, B = -o, 100 + o
    k, ki = 0.64, 0.56
    x = lambda v: ox + v
    tu_o, tu_i = term(style, x(W), x(W - V), 34.5, True)
    tl_o, tl_i = term(style, x(W), x(W - V), 65.5, False)
    d = M(tu_o) + L((x(W), T + R)) + corner((x(W), T + R), (x(W), T), (x(W - R), T), k)
    d += L((x(R), T)) + corner((x(R), T), (x(0), T), (x(0), T + R), k)
    d += L((x(0), B - R)) + corner((x(0), B - R), (x(0), B), (x(R), B), k)
    d += L((x(W - R), B)) + corner((x(W - R), B), (x(W), B), (x(W), B - R), k)
    d += L(tl_o) + L(tl_i)
    d += L((x(W - V), 100 - H - ri)) + corner((x(W - V), 100 - H - ri), (x(W - V), 100 - H), (x(W - V - ri), 100 - H), ki)
    d += L((x(V + ri), 100 - H)) + corner((x(V + ri), 100 - H), (x(V), 100 - H), (x(V), 100 - H - ri), ki)
    d += L((x(V), H + ri)) + corner((x(V), H + ri), (x(V), H), (x(V + ri), H), ki)
    d += L((x(W - V - ri), H)) + corner((x(W - V - ri), H), (x(W - V), H), (x(W - V), H + ri), ki)
    d += L(tu_i) + 'Z'
    return d, W


def glyph_S(ox, W, V, H, R, ri, style, o=1.2):
    T, B = -o, 100 + o
    k, ki = 0.64, 0.56
    Ro = 23
    xu = W - 2.2                      # upper bowl sits narrower than the lower
    sTl, sTr = 35.5, 42.5             # spine top edge, left / right
    sBl, sBr = 57.5, 64.5             # spine bottom edge
    m = (sTr - sTl) / W
    sT = lambda v: sTl + m * v
    sB = lambda v: sBl + m * v
    x = lambda v: ox + v
    # terminals: upper on the right arm, lower on the left arm (mirrored sense)
    tu_o, tu_i = term(style, x(xu), x(xu - V), 32.5, True)
    if style == 'flare':
        tl_o, tl_i = (x(-4), 67.5 - 5), (x(V + 2), 67.5 + 5)
    elif style == 'shear':
        tl_o, tl_i = (x(0), 67.5 - 6), (x(V), 67.5 + 6)
    else:
        tl_o, tl_i = (x(0), 67.5), (x(V), 67.5)
    d = M(tu_o) + L((x(xu), T + R)) + corner((x(xu), T + R), (x(xu), T), (x(xu - R), T), k)
    d += L((x(R), T)) + corner((x(R), T), (x(0), T), (x(0), T + R), k)
    d += L((x(0), sB(0) - Ro)) + corner((x(0), sB(0) - Ro), (x(0), sB(0)), (x(Ro), sB(Ro)), k)
    xi = W - V - ri
    d += L((x(xi), sB(xi))) + corner((x(xi), sB(xi)), (x(W - V), sB(W - V)), (x(W - V), sB(W - V) + ri), ki)
    d += L((x(W - V), 100 - H - ri)) + corner((x(W - V), 100 - H - ri), (x(W - V), 100 - H), (x(W - V - ri), 100 - H), ki)
    d += L((x(V + ri), 100 - H)) + corner((x(V + ri), 100 - H), (x(V), 100 - H), (x(V), 100 - H - ri), ki)
    d += L(tl_i) + L(tl_o)
    d += L((x(0), B - R)) + corner((x(0), B - R), (x(0), B), (x(R), B), k)
    d += L((x(W - R), B)) + corner((x(W - R), B), (x(W), B), (x(W), B - R), k)
    d += L((x(W), sT(W) + Ro)) + corner((x(W), sT(W) + Ro), (x(W), sT(W)), (x(W - Ro), sT(W - Ro)), k)
    xj = V + ri
    d += L((x(xj), sT(xj))) + corner((x(xj), sT(xj)), (x(V), sT(V)), (x(V), sT(V) - ri), ki)
    d += L((x(V), H + ri)) + corner((x(V), H + ri), (x(V), H), (x(V + ri), H), ki)
    d += L((x(xu - V - ri), H)) + corner((x(xu - V - ri), H), (x(xu - V), H), (x(xu - V), H + ri), ki)
    d += L(tu_i) + 'Z'
    return d, W


def wordmark(style):
    V, H = 23, 19.5          # stems heavier than bars: real stroke contrast
    R, ri = 25, 7.5
    if style == 'flare':
        V, H, R, ri = 22, 17.5, 23, 7
    d = ''
    x = 0
    g, w = glyph_I(x, V, style); d += g; x += w + (17 if style == 'flare' else 11.5)
    g, w = glyph_S(x, 59, V, H, R, ri, style); d += g; x += w + 10.5
    g, w = glyph_C(x, 61, V, H, R, ri, style); d += g; x += w + 8.5
    g, w = glyph_C(x, 61, V, H, R, ri, style); d += g; x += w
    return d, x + (4 if style == 'flare' else 0)


# ------------------------------------------------------------ plate
GOLD, LIGHT, BLUE, BLACK, PARCH, SILVER = '#C9A44C', '#E4CF9A', '#15294E', '#0B0D10', '#EFE9DA', '#9AA3B2'
INK, INKGOLD, PORC, BLUETINT = '#14161C', '#7A5D22', '#F2EEE3', '#4868A4'


def svg(vb, body, cls='', extra=''):
    return '<svg class="%s" viewBox="%s" %s xmlns="http://www.w3.org/2000/svg" aria-hidden="true">%s</svg>' % (cls, vb, extra, body)


def path(d, fill, evenodd=False):
    return '<path fill="%s"%s d="%s"/>' % (fill, ' fill-rule="evenodd"' if evenodd else '', d)


def render_mark(key, c1, c2=None, c3=None, micro=False, laurel=True):
    """c1 main, c2 second side, c3 tertiary (ticks / laurel)."""
    c2 = c2 or c1
    c3 = c3 or c1
    if key == 'A':
        if micro:
            m = mark_a_micro()
            return svg('0 0 16 16', path(m['left'], c2) + path(m['right'], c1) + path(m['ticks'], c3))
        m = mark_a()
        return svg('0 0 240 240', path(m['left'], c2) + path(m['right'], c1) + path(m['ticks'], c3))
    if key == 'B':
        if micro:
            mm = mark_b_micro(); return svg('0 0 240 240', path(mm['shield'], c1, True) + path(mm['foot'], c1))
        m = mark_b(laurel)
        b = path(m['shield'], c1, True) + path(m['foot'], c1)
        if laurel:
            b += path(m['laurel_l'], c2) + path(m['laurel_r'], c3)
        return svg('0 0 240 240', b)
    m = mark_c()
    return svg('0 0 240 240', path(m['beam'], c2, True) + path(m['cup'], c1))


def render_word(style, fill):
    d, w = wordmark(style)
    return svg('-6 -3 %s 106' % n(w + 10), path(d, fill), 'wm')


def build():
    fonts = open(os.path.join(ROOT, 'tools/fonts-v1.css')).read()
    cn = open(os.path.join(ROOT, 'tools/cn-logotype.svgfrag')).read()
    cn = re.sub(r'(\d+\.\d{3})\d+', r'\1', cn)

    def cn_svg(fill):
        return svg('0 0 911.8 95.8', cn.replace('#C9A44C', fill), 'cn')

    dirs = [
        ('A', 'bar', 'Face-off', '对峙',
         'A crosshair with two heavy side posts. The gap they leave is the cup.',
         '准星两翼对峙,留白即金杯。'),
        ('B', 'flare', 'The Crest', '校徽',
         'The school shield is the bowl of the cup. A crosshair is cut into it; the laurel carries twelve leaves a side, one a round.',
         '盾即杯身,准星镂其上;桂叶十二,一叶一局。'),
        ('C', 'shear', 'Counterlight', '破雾',
         'One shaft of key light. Inside it the cup is carved out; outside it the cup is solid.',
         '一束主光破雾,明处镂空,暗处成金。'),
    ]
    cols = ''
    for key, style, en, zh, line, linezh in dirs:
        def stage(theme):
            dark = theme == 'dark'
            main = GOLD if dark else INK
            word = PARCH if dark else INK
            two = (GOLD, BLUETINT, PARCH) if dark else (GOLD, BLUE, INK)
            if key == 'B':
                two = (PARCH, BLUETINT, GOLD) if dark else (INK, BLUE, GOLD)
            if key == 'C':
                two = (GOLD, BLUETINT, None) if dark else (GOLD, BLUE, None)
            sizes = ''
            for px in (16, 32, 96):
                mic = px == 16 and key in ('A', 'B')
                lau = px >= 96
                sizes += '<figure style="--s:%dpx">%s<figcaption>%d</figcaption></figure>' % (
                    px, render_mark(key, main, micro=mic, laurel=lau), px)
            return '''<div class="stage %s">
  <div class="hero">%s</div>
  <div class="lock">%s<div class="lk">%s%s</div></div>
  <div class="row"><div class="sizes">%s</div><div class="sides">%s<span>CT / T</span></div></div>
</div>''' % (theme, render_mark(key, main), render_mark(key, main, laurel=False), render_word(style, word),
             cn_svg(main if dark else INKGOLD), sizes, render_mark(key, two[0], two[1], two[2]))
        cols += '''<section class="dir">
  <header><b>%s</b><div><h2>%s <i>%s</i></h2><p>%s</p><p class="zh">%s</p></div></header>
  %s%s
</section>''' % (key, en, zh, line, linezh, stage('dark'), stage('light'))

    html = '''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ISCC — Logo directions</title><style>%s
*{box-sizing:border-box;margin:0}
body{background:#0B0D10;color:#EFE9DA;font:400 15px/1.5 Archivo,sans-serif;padding:40px 32px 56px}
.top{display:flex;justify-content:space-between;align-items:baseline;max-width:1500px;margin:0 auto 30px;gap:24px;flex-wrap:wrap}
h1{font:900 54px/.95 'Big Shoulders Display',sans-serif;letter-spacing:.02em;text-transform:uppercase}
h1 span{color:#C9A44C}
.top p{font:600 11px/1.6 Archivo;letter-spacing:.24em;text-transform:uppercase;color:#9AA3B2}
.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;max-width:1500px;margin:0 auto}
.dir header{display:flex;gap:18px;align-items:flex-start;min-height:132px;padding-bottom:18px}
.dir header b{font:900 112px/.78 'Big Shoulders Display';color:#C9A44C}
h2{font:800 26px/1 'Big Shoulders Display';letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px}
h2 i{font:900 20px/1 'Noto Serif SC';font-style:normal;letter-spacing:.14em;color:#C9A44C;margin-left:8px}
.dir header p{color:#9AA3B2;font-size:14px;line-height:1.5;max-width:40ch}
.dir header p.zh{font-family:'Noto Sans SC';font-size:13px;margin-top:3px}
.stage{padding:34px 30px 22px}
.stage.dark{background:#07090D;outline:1px solid rgba(154,163,178,.16);outline-offset:-1px}
.stage.light{background:#F2EEE3;color:#14161C}
.hero{display:flex;justify-content:center;padding:6px 0 30px}
.hero svg{width:232px;height:232px}
.lock{display:flex;align-items:center;justify-content:center;gap:20px;padding:22px 0 26px;border-top:1px solid rgba(154,163,178,.16)}
.light .lock{border-color:rgba(20,22,28,.14)}
.lock>svg{width:76px;height:76px;flex:none}
.lk{display:flex;flex-direction:column;gap:9px}
.lk .wm{height:50px;width:auto;display:block}
.lk .cn{width:186px;display:block}
.row{display:flex;justify-content:space-between;align-items:flex-end;padding-top:20px;border-top:1px solid rgba(154,163,178,.16)}
.light .row{border-color:rgba(20,22,28,.14)}
.sizes{display:flex;align-items:flex-end;gap:22px}
figure{display:flex;flex-direction:column;align-items:center;gap:8px}
figure svg{width:var(--s);height:var(--s);display:block}
figcaption,.sides span{font:600 11px/1 Archivo;letter-spacing:.22em;color:#9AA3B2;font-variant-numeric:tabular-nums}
.light figcaption,.light .sides span{color:#5B6470}
.sides{display:flex;flex-direction:column;align-items:center;gap:8px}
.sides svg{width:96px;height:96px}
.note{max-width:1500px;margin:26px auto 0;font:600 11px/1.7 Archivo;letter-spacing:.2em;text-transform:uppercase;color:#9AA3B2}
@media(max-width:1100px){.grid{grid-template-columns:1fr}.dir header{min-height:0}}
</style></head><body>
<div class="top"><h1>The mark. <span>Pick one.</span></h1><p>ISCC · logo directions · concept · 16 px cuts are redrawn, not scaled</p></div>
<div class="grid">%s</div>
<p class="note">Comparison comps. The chosen direction gets the full pass: optical overshoot, ink traps, seal, 26, favicon, lockups.</p>
</body></html>''' % (fonts, cols)
    out = os.path.join(ROOT, 'concepts/logo-directions.html')
    open(out, 'w').write(html)
    print('wrote', out, len(html))


if __name__ == '__main__':
    build()
