"""Glyph outline helpers for the calligraphy logo sketches: returns per-contour SVG path data, y flipped, em-normalised to 1000."""
import os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen

D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.fontcache/cal/package/400Regular')
FONTS = {'zhimang': 'ZhiMangXing_400Regular.ttf', 'mashan': 'MaShanZheng_400Regular.ttf',
         'liujian': 'LiuJianMaoCao_400Regular.ttf', 'longcang': 'LongCang_400Regular.ttf'}
_cache = {}


def font(key):
    if key not in _cache:
        _cache[key] = TTFont(os.path.join(D, FONTS[key]))
    return _cache[key]


def contours(key, ch):
    """List of (svg_path_d, (xmin, ymin, xmax, ymax)) per closed contour, in a 1000-unit box, y down."""
    f = font(key)
    gs = f.getGlyphSet()
    name = f.getBestCmap()[ord(ch)]
    upm = f['head'].unitsPerEm
    k = 1000.0 / upm
    asc = f['hhea'].ascent * k
    rec = RecordingPen()
    gs[name].draw(rec)
    out, cur = [], []
    for op, args in rec.value:
        cur.append((op, args))
        if op in ('closePath', 'endPath'):
            out.append(cur)
            cur = []
    res = []
    for c in out:
        sp = SVGPathPen(None)
        bp = BoundsPen(None)
        for pen in (sp, bp):
            tp = TransformPen(pen, (k, 0, 0, -k, 0, asc))
            for op, args in c:
                getattr(tp, op)(*args)
        if bp.bounds:
            res.append((sp.getCommands(), bp.bounds))
    return res
