#!/usr/bin/env python3
"""Helpers for build_kit.py: SVG path parsing / baking, text-to-path, SVG writers."""
import re

NUM = re.compile(r'[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?')
TOK = re.compile(r'([MmLlHhVvCcSsQqTtAaZz])|([-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?)')
ARGC = {'M': 2, 'L': 2, 'H': 1, 'V': 1, 'C': 6, 'S': 4, 'Q': 4, 'T': 2, 'A': 7, 'Z': 0}


def fmt(v, prec=2):
    s = ('%.' + str(prec) + 'f') % v
    if '.' in s:
        s = s.rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s


def parse(d):
    """-> list of (CMD, [floats]) in ABSOLUTE coordinates, explicit repeats.
    Supports M L H V C Q A Z (and relative forms of them)."""
    toks = TOK.findall(d)
    out, i = [], 0
    cx = cy = sx = sy = 0.0
    cmd = None
    while i < len(toks):
        c, num = toks[i]
        if c:
            cmd = c
            i += 1
            if cmd in 'Zz':
                out.append(('Z', []))
                cx, cy = sx, sy
                continue
        elif cmd is None:
            raise ValueError('path data starts with a number')
        u = cmd.upper()
        rel = cmd.islower()
        n = ARGC[u]
        if u in 'ST':
            raise ValueError('S/T not supported')
        args = []
        for _ in range(n):
            if i >= len(toks) or toks[i][0]:
                raise ValueError('bad path data near %r' % d[:60])
            args.append(float(toks[i][1]))
            i += 1
        if u == 'A':
            # flags may be written packed ("01") only in minified data; ours are spaced
            ex, ey = args[5], args[6]
            if rel:
                ex += cx; ey += cy
            args = args[:5] + [ex, ey]
            cx, cy = ex, ey
        elif u == 'H':
            x = args[0] + (cx if rel else 0)
            args = [x]; cx = x
        elif u == 'V':
            y = args[0] + (cy if rel else 0)
            args = [y]; cy = y
        else:
            if rel:
                args = [a + (cx if k % 2 == 0 else cy) for k, a in enumerate(args)]
            cx, cy = args[-2], args[-1]
        out.append((u, args))
        if u == 'M':
            sx, sy = cx, cy
            cmd = 'l' if rel else 'L'     # implicit lineto
    return out


def emit(segs, prec=2):
    parts = []
    for u, a in segs:
        if u == 'Z':
            parts.append('Z')
        elif u == 'A':
            parts.append('A%s %s %s %s %s %s %s' % (fmt(a[0], prec), fmt(a[1], prec), fmt(a[2], prec),
                                                    int(a[3]), int(a[4]), fmt(a[5], prec), fmt(a[6], prec)))
        else:
            parts.append(u + ' '.join(fmt(v, prec) for v in a))
    return ''.join(parts)


def bake(d, s=1.0, tx=0.0, ty=0.0, prec=2):
    """Uniform scale s then translate (tx, ty), returned as absolute path data."""
    out = []
    for u, a in parse(d):
        if u == 'Z':
            out.append((u, a))
        elif u == 'H':
            out.append((u, [a[0] * s + tx]))
        elif u == 'V':
            out.append((u, [a[0] * s + ty]))
        elif u == 'A':
            out.append((u, [a[0] * s, a[1] * s, a[2], a[3], a[4], a[5] * s + tx, a[6] * s + ty]))
        else:
            out.append((u, [v * s + (tx if k % 2 == 0 else ty) for k, v in enumerate(a)]))
    return emit(out, prec)


def bbox(d):
    xs, ys = [], []
    cx = cy = 0
    for u, a in parse(d):
        if u == 'H':
            xs.append(a[0]); cx = a[0]
        elif u == 'V':
            ys.append(a[0]); cy = a[0]
        elif u == 'Z':
            pass
        else:
            pts = list(zip(a[0::2], a[1::2])) if u != 'A' else [(a[5], a[6])]
            for x, y in pts:
                xs.append(x); ys.append(y)
    return min(xs), min(ys), max(xs), max(ys)


def circle(cx, cy, r):
    return 'M%s %sA%s %s 0 1 0 %s %sA%s %s 0 1 0 %s %sZ' % (
        fmt(cx - r, 3), fmt(cy, 3), fmt(r, 3), fmt(r, 3), fmt(cx + r, 3), fmt(cy, 3),
        fmt(r, 3), fmt(r, 3), fmt(cx - r, 3), fmt(cy, 3))


def rect(x, y, w, h):
    return 'M%s %sH%sV%sH%sZ' % (fmt(x, 3), fmt(y, 3), fmt(x + w, 3), fmt(y + h, 3), fmt(x, 3))


# ------------------------------------------------------------------ svg writers
def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def svg_doc(title, vb, layers, size=None, bg=None):
    """vb = (x, y, w, h). layers = list of dicts: d, fill, [evenodd], [stroke, sw, extra attrs].
    Plain absolute path data only."""
    x, y, w, h = vb
    if size is None:
        size = (w, h)
    o = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="%s %s %s %s" width="%s" height="%s" role="img">' % (
        fmt(x, 3), fmt(y, 3), fmt(w, 3), fmt(h, 3), fmt(size[0], 2), fmt(size[1], 2)),
        '<title>%s</title>' % esc(title)]
    if bg:
        o.append('<path fill="%s" d="%s"/>' % (bg, rect(x, y, w, h)))
    for L in layers:
        a = ['fill="%s"' % L.get('fill', 'none')]
        if L.get('evenodd'):
            a.append('fill-rule="evenodd"')
        elif L.get('fill', 'none') != 'none':
            a.append('fill-rule="nonzero"')
        for k in ('fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-linejoin', 'stroke-linecap'):
            if k in L:
                a.append('%s="%s"' % (k, L[k]))
        o.append('<path %s d="%s"/>' % (' '.join(a), L['d']))
    o.append('</svg>')
    return '\n'.join(o) + '\n'


# ------------------------------------------------------------------ text to path
class Glyphs:
    """Convert a Latin string to path data with fontTools (no kerning beyond advance widths)."""

    def __init__(self, ttf):
        from fontTools.ttLib import TTFont
        self.f = TTFont(ttf)
        self.gs = self.f.getGlyphSet()
        self.cmap = self.f.getBestCmap()
        self.upm = self.f['head'].unitsPerEm
        self.hmtx = self.f['hmtx']

    def path(self, text, size, x, y, track=0.0):
        """Baseline origin (x, y), font size in user units, tracking in em. -> (d, advance)"""
        from fontTools.pens.svgPathPen import SVGPathPen
        from fontTools.pens.transformPen import TransformPen
        s = size / self.upm
        ds, cx = [], x
        for ch in text:
            gn = self.cmap.get(ord(ch))
            if gn is None:
                gn = '.notdef'
            if ch != ' ':
                pen = SVGPathPen(self.gs)
                self.gs[gn].draw(TransformPen(pen, (s, 0, 0, -s, cx, y)))
                ds.append(pen.getCommands())
            cx += self.hmtx[gn][0] * s + track * size
        d = ' '.join(ds)
        # normalise to our compact absolute format
        return emit(parse(d), 2) if d else '', cx - x
