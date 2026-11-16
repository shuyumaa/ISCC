#!/usr/bin/env python3
"""Build the ISCC plug-in asset kit into kit/.   python3 tools/build_kit.py
Stages: fonts -> tokens -> logos -> ornaments -> plates -> PNG renders -> ASSETS.md -> SVG validation.
Set KIT_FORCE=1 to re-capture WebGL plates and re-subset fonts even if cached outputs exist."""
import io
import json
import math
import os
import re
import shutil
import struct
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import kit_geom as G          # noqa: E402
import logo_directions as LD  # noqa: E402

KIT = os.path.join(ROOT, 'kit')
CACHE = os.path.join(HERE, '.fontcache')
FORCE = bool(os.environ.get('KIT_FORCE'))
SCRATCH = os.environ.get('KIT_SCRATCH') or os.path.join(os.environ.get('TMPDIR', '/tmp'), 'iscc-kit-build')
os.makedirs(SCRATCH, exist_ok=True)

GOLD, LIGHT, BLUE, BLACK, PARCH, SILVER = LD.GOLD, LD.LIGHT, LD.BLUE, LD.BLACK, LD.PARCH, LD.SILVER
INK, INKGOLD, PORC, BLUETINT = LD.INK, LD.INKGOLD, LD.PORC, LD.BLUETINT
STAGE_D, STAGE_L, INK2_L = '#07090D', '#E9E1CD', '#5B6470'


def out(*p):
    path = os.path.join(KIT, *p)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    return path


def write(path, s, mode='w'):
    with open(path, mode, **({} if 'b' in mode else {'encoding': 'utf-8'})) as f:
        f.write(s)


def log(*a):
    print('[kit]', *a, flush=True)


def run(cmd, **kw):
    r = subprocess.run(cmd, **kw)
    if r.returncode:
        sys.exit('command failed: %s' % ' '.join(map(str, cmd)))


PNG_JOBS = []   # {svg, png, w, h, bg}


def queue_png(svg, png, w, h, bg=None):
    PNG_JOBS.append({'svg': svg, 'png': png, 'w': int(w), 'h': int(h), 'bg': bg})


def sizes_for(vbw, vbh):
    for L in (256, 1024, 2048):
        if vbw >= vbh:
            yield L, L, max(1, round(L * vbh / vbw))
        else:
            yield L, max(1, round(L * vbw / vbh)), L


# =============================================================== 1. FONTS
FONTS = [  # key, cache, family, weight, ttf out name stem, role, cn
    ('display900', 'BS-900', 'Big Shoulders Display', 900, 'display', False),
    ('display800', 'BS-800', 'Big Shoulders Display', 800, 'display', False),
    ('body400', 'AR-400', 'Archivo', 400, 'body', False),
    ('body600', 'AR-600', 'Archivo', 600, 'body', False),
    ('body700', 'AR-700', 'Archivo', 700, 'body', False),
    ('cnDisplay900', 'SERIF-900', 'Noto Serif SC', 900, 'cn-display', True),
    ('cnBody400', 'SANS-400', 'Noto Sans SC', 400, 'cn-body', True),
    ('cnBody600', 'SANS-600', 'Noto Sans SC', 600, 'cn-body', True),
]


def gb2312_l1():
    chars = []
    for hi in range(0xB0, 0xD8):
        for lo in range(0xA1, 0xFF):
            try:
                chars.append(bytes([hi, lo]).decode('gb2312'))
            except UnicodeDecodeError:
                pass
    assert len(chars) == 3755, len(chars)
    return chars


def cjk_punct():
    cps = set(range(0x3000, 0x3040)) | set(range(0xFF01, 0xFF65)) | {0xFFE0, 0xFFE1, 0xFFE3, 0xFFE5}
    cps |= {0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x2026, 0x00B7, 0x2022}
    return cps


def build_fonts():
    from fontTools.ttLib import TTFont
    from fontTools import subset as ft
    if not all(os.path.exists(os.path.join(CACHE, f[1] + '.ttf')) for f in FONTS):
        log('font cache incomplete -> running subset_fonts.py to populate it')
        run([sys.executable, os.path.join(HERE, 'subset_fonts.py'), '--out', os.path.join(SCRATCH, 'x.css'),
             os.path.join(ROOT, 'index.html')])
    ps, rows, files = {}, [], []
    cps = {ord(c) for c in gb2312_l1()} | cjk_punct()
    for key, cache, fam, wt, role, cn in FONTS:
        src = os.path.join(CACHE, cache + '.ttf')
        f = TTFont(src)
        psn = f['name'].getDebugName(6)
        ps[key] = psn
        ttf = out('fonts', 'ttf', psn + '.ttf')
        shutil.copyfile(src, ttf)
        web = out('fonts', 'web', psn + ('-gb2312.woff2' if cn else '.woff2'))
        if FORCE or not os.path.exists(web) or os.path.getmtime(web) < os.path.getmtime(src):
            log('woff2', os.path.basename(web))
            if cn:
                opt = ft.Options()
                opt.flavor = 'woff2'
                opt.notdef_outline = True
                opt.hinting = False
                opt.layout_features = ['kern', 'vert', 'vrt2', 'palt', 'locl', 'ccmp', 'liga']
                fo = TTFont(src)
                sub = ft.Subsetter(opt)
                sub.populate(unicodes=sorted(cps))
                sub.subset(fo)
                fo.flavor = 'woff2'
                fo.save(web)
            else:
                fo = TTFont(src)
                fo.flavor = 'woff2'
                fo.save(web)
        rows.append((key, fam, wt, psn, os.path.relpath(ttf, out('fonts')), os.path.relpath(web, out('fonts')), cn))
    write(out('fonts', 'postscript-names.json'), json.dumps(
        {k: ps[k] for k in ['display900', 'display800', 'body400', 'body600', 'body700', 'cnDisplay900', 'cnBody400', 'cnBody600']},
        indent=2) + '\n')
    # css
    CJK = ('U+2E80-2FDF,U+3000-30FF,U+3400-4DBF,U+4E00-9FFF,U+F900-FAFF,U+FE30-FE4F,U+FF00-FFEF,U+20000-2FFFF')
    css = ['/* ISCC fonts - generated by tools/build_kit.py. All four families: SIL OFL 1.1 (see OFL.txt).',
           '   Chinese files are GB2312 level-1 (3,755 chars) + CJK punctuation subsets; unicode-range keeps Latin text off them. */']
    for key, fam, wt, psn, ttf, web, cn in rows:
        css.append("@font-face{font-family:'%s';font-style:normal;font-weight:%d;font-display:swap;src:url('%s') format('woff2')%s}" % (
            fam, wt, web, (';unicode-range:' + CJK) if cn else ''))
    write(out('fonts', 'iscc-fonts.css'), '\n'.join(css).replace(";unicode", ";unicode") + '\n')
    # OFL
    body = open(os.path.join(HERE, 'kit_ofl_body.txt'), encoding='utf-8').read().rstrip('\n')
    seen, head = set(), []
    for key, cache, fam, wt, role, cn in FONTS:
        c = TTFont(os.path.join(CACHE, cache + '.ttf'))['name'].getDebugName(0)
        if c not in seen:
            seen.add(c)
            head.append(c)
    write(out('fonts', 'OFL.txt'),
          '\n'.join(head) + '\n\nThis Font Software is licensed under the SIL Open Font License, Version 1.1.\n'
          'This license is copied below, and is also available with a FAQ at: https://openfontlicense.org\n\n'
          '-----------------------------------------------------------\n' + body + '\n')
    # README
    lines = ['# ISCC fonts', '',
             'Full, un-subset TTFs for installing (designers, After Effects) plus web builds. All four families are SIL Open Font License 1.1 (`OFL.txt`).',
             '', '| File | Family | Weight | PostScript name | Role |', '|---|---|---|---|---|']
    for key, fam, wt, psn, ttf, web, cn in rows:
        lines.append('| `%s` | %s | %d | `%s` | %s |' % (ttf, fam, wt, psn, key))
    lines += ['', '## Web builds (`web/`)', '',
              '- Latin families: complete fonts converted to woff2 (no subsetting): `' + '`, `'.join(r[5] for r in rows if not r[6]) + '`.',
              '- Chinese families: `*-gb2312.woff2`, subset to GB2312 level-1 hanzi (3,755) + CJK/fullwidth punctuation (U+3000-303F, U+FF01-FF64, quotes, ellipsis, middle dot). '
              'Characters outside that set fall back to the system font; use the TTFs if you need full coverage.',
              '- `iscc-fonts.css` declares `@font-face` for \'Big Shoulders Display\' (800, 900), \'Archivo\' (400, 600, 700), \'Noto Serif SC\' (900) and \'Noto Sans SC\' (400, 600) with relative URLs. '
              'The Chinese faces carry a CJK-only `unicode-range` so Latin text never downloads them. `font-display: swap`.',
              '', '## After Effects / scripting', '',
              'After Effects addresses fonts by PostScript name. `postscript-names.json` maps roles to names:', '', '```json',
              open(out('fonts', 'postscript-names.json')).read().rstrip(), '```', '',
              'The exact name comes from the `name` table, ID 6, of each TTF.', '']
    write(out('fonts', 'README.md'), '\n'.join(lines))
    log('fonts done')
    return ps


# =============================================================== 3. TOKENS
PALETTE = [  # name, hex, zh
    ('Cup Gold', GOLD, '鎏金'), ('Gold Light', LIGHT, '浅金'), ('Legacy Blue', BLUE, '藏蓝'),
    ('Arena Black', BLACK, '玄黑'), ('Parchment', PARCH, '素绢'), ('Engraving Silver', SILVER, '刻银'),
    ('Porcelain', PORC, ''), ('Ink', INK, ''), ('Ink Gold', INKGOLD, ''),
]


def hex_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def build_tokens():
    src = open(os.path.join(ROOT, 'src', 'tokens.css'), encoding='utf-8').read().rstrip('\n')
    extra = '''

/* ---- kit additions (iscc-tokens.css only; everything above is src/tokens.css verbatim) ---- */
:root{
  --c-cup-gold:#C9A44C;--c-gold-light:#E4CF9A;--c-legacy-blue:#15294E;--c-legacy-blue-lit:#4868A4;
  --c-arena-black:#0B0D10;--c-parchment:#EFE9DA;--c-engraving-silver:#9AA3B2;
  --c-porcelain:#F2EEE3;--c-ink:#14161C;--c-ink-gold:#7A5D22;
  --c-arena-deep:#0E1420;--c-beam-stage:#07090D;--c-porcelain-plate:#FAF7EF;--c-porcelain-stage:#E9E1CD;
  --sp-xs:10px;--sp-sm:14px;--sp-md:26px;--sp-lg:48px;--sp-section:104px;
  --ease-out:cubic-bezier(.16,1,.3,1);
  --r-plate:0;--r-glass:14px;
  --fs-display:clamp(38px,5.4vw,68px);--lh-display:.98;--ls-display:.02em;
  --fs-headline:24px;--ls-headline:.08em;
  --fs-lead:17px;--lh-lead:1.7;
  --fs-body:15px;--lh-body:1.6;
  --fs-label:11px;--ls-label:.22em;
  --fs-cn-display:clamp(38px,5.4vw,68px);--lh-cn-display:1.16;--ls-cn-display:.08em;
  --fs-cn-body:16px;--lh-cn-body:1.95;
  --dur-fast:.3s;--dur-base:.6s;--dur-plate:.7s;--dur-sheen:1.1s;
}
'''
    write(out('tokens', 'iscc-tokens.css'), '/* ISCC tokens. Built from src/tokens.css by tools/build_kit.py */\n' + src + extra)

    dark = dict(ground=BLACK, plate=BLACK, stage=STAGE_D, ink=PARCH, ink2=SILVER, gold=GOLD, sideCt=BLUETINT, sideT=GOLD,
                hair='rgba(201,164,76,.28)', edge='rgba(154,163,178,.16)', glass='rgba(11,13,16,.62)', glassEdge='rgba(239,233,218,.16)')
    light = dict(ground=PORC, plate='#FAF7EF', stage=STAGE_L, ink=INK, ink2=INK2_L, gold=INKGOLD, sideCt=BLUE, sideT=INKGOLD,
                 hair='rgba(122,93,34,.35)', edge='rgba(20,22,28,.14)', glass='rgba(250,247,239,.68)', glassEdge='rgba(20,22,28,.12)')

    def c(v, desc=None):
        d = {'$value': v, '$type': 'color'}
        if desc:
            d['$description'] = desc
        return d

    def arena(m):
        return {k: c(v) for k, v in m.items()}
    T = {
        'color': {
            'brand': {'cupGold': c(GOLD, 'T side'), 'goldLight': c(LIGHT), 'legacyBlue': c(BLUE, 'CT side'), 'legacyBlueLit': c(BLUETINT, 'CT on dark'),
                      'arenaBlack': c(BLACK), 'parchment': c(PARCH), 'engravingSilver': c(SILVER)},
            'lightArena': {'porcelain': c(PORC), 'ink': c(INK), 'inkGold': c(INKGOLD, 'text-safe gold')},
            'arena': {'dark': arena(dark), 'light': arena(light)},
            'side': {'ct': c(BLUE), 'ctLit': c(BLUETINT), 't': c(GOLD)},
            'ratio': {'black': {'$value': 70, '$type': 'number'}, 'blue': {'$value': 20, '$type': 'number'}, 'gold': {'$value': 10, '$type': 'number'}},
        },
        'type': {
            'family': {'display': {'$value': "'Big Shoulders Display', sans-serif", '$type': 'fontFamily'},
                       'body': {'$value': "'Archivo', sans-serif", '$type': 'fontFamily'},
                       'cnDisplay': {'$value': "'Noto Serif SC', serif", '$type': 'fontFamily'},
                       'cnBody': {'$value': "'Noto Sans SC', sans-serif", '$type': 'fontFamily'}},
            'scale': {
                'display': {'$type': 'typography', '$value': {'fontFamily': '{type.family.display}', 'fontSize': 'clamp(38px, 5.4vw, 68px)', 'fontWeight': 900, 'lineHeight': 0.98, 'letterSpacing': '0.02em'}},
                'headline': {'$type': 'typography', '$value': {'fontFamily': '{type.family.display}', 'fontSize': '24px', 'fontWeight': 800, 'letterSpacing': '0.08em'}},
                'lead': {'$type': 'typography', '$value': {'fontFamily': '{type.family.body}', 'fontSize': '17px', 'fontWeight': 400, 'lineHeight': 1.7}},
                'body': {'$type': 'typography', '$value': {'fontFamily': '{type.family.body}', 'fontSize': '15px', 'fontWeight': 400, 'lineHeight': 1.6}},
                'label': {'$type': 'typography', '$value': {'fontFamily': '{type.family.body}', 'fontSize': '11px', 'fontWeight': 600, 'letterSpacing': '0.22em'}},
                'cnDisplay': {'$type': 'typography', '$value': {'fontFamily': '{type.family.cnDisplay}', 'fontSize': 'clamp(38px, 5.4vw, 68px)', 'fontWeight': 900, 'lineHeight': 1.16, 'letterSpacing': '0.08em'}},
                'cnBody': {'$type': 'typography', '$value': {'fontFamily': '{type.family.cnBody}', 'fontSize': '16px', 'fontWeight': 400, 'lineHeight': 1.95}},
            },
        },
        'space': {k: {'$value': v, '$type': 'dimension'} for k, v in
                  [('xs', '10px'), ('sm', '14px'), ('md', '26px'), ('lg', '48px'), ('section', '104px')]},
        'radius': {'plate': {'$value': '0px', '$type': 'dimension'}, 'glass': {'$value': '14px', '$type': 'dimension'}},
        'motion': {'easing': {'out': {'$value': [0.16, 1, 0.3, 1], '$type': 'cubicBezier'}},
                   'duration': {k: {'$value': v, '$type': 'duration'} for k, v in
                                [('fast', '300ms'), ('base', '600ms'), ('plate', '700ms'), ('sheen', '1100ms')]}},
    }
    write(out('tokens', 'iscc-tokens.json'), json.dumps(T, indent=2, ensure_ascii=False) + '\n')

    s = ['// ISCC tokens (SCSS). Generated by tools/build_kit.py', '']
    for n, h, zh in PALETTE:
        s.append('$iscc-%s: %s;' % (n.lower().replace(' ', '-'), h))
    s += ['$iscc-legacy-blue-lit: #4868A4;', '$iscc-arena-stage-dark: #07090D;', '$iscc-arena-stage-light: #E9E1CD;', '',
          '$iscc-ease: cubic-bezier(.16,1,.3,1);', '$iscc-space: (xs: 10px, sm: 14px, md: 26px, lg: 48px, section: 104px);',
          '$iscc-radius-plate: 0;', '$iscc-radius-glass: 14px;',
          '$iscc-font-display: "Big Shoulders Display", sans-serif;', '$iscc-font-body: "Archivo", sans-serif;',
          '$iscc-font-cn-display: "Noto Serif SC", serif;', '$iscc-font-cn-body: "Noto Sans SC", sans-serif;',
          '$iscc-type: (display: (clamp(38px, 5.4vw, 68px), 900, .98), headline: (24px, 800, 1.1), lead: (17px, 400, 1.7), body: (15px, 400, 1.6), label: (11px, 600, 1.2), cn-display: (clamp(38px, 5.4vw, 68px), 900, 1.16), cn-body: (16px, 400, 1.95));',
          '$iscc-ratio: (black: 70, blue: 20, gold: 10);', '']

    def smap(name, m):
        return '$%s: (\n%s\n);' % (name, ',\n'.join('  %s: %s' % (re.sub(r'([A-Z])', lambda x: '-' + x.group(1).lower(), k),
                                                              v) for k, v in m.items()))
    s += [smap('iscc-arena-dark', dark), '', smap('iscc-arena-light', light), '']
    write(out('tokens', 'iscc-tokens.scss'), '\n'.join(s))

    # ASE
    blocks = b''
    for n, h, zh in PALETTE:
        r, g, b = hex_rgb(h)
        name = (n + '\0').encode('utf-16-be')
        body = struct.pack('>H', len(n) + 1) + name + b'RGB ' + struct.pack('>fff', r / 255, g / 255, b / 255) + struct.pack('>H', 0)
        blocks += struct.pack('>HI', 1, len(body)) + body
    write(out('tokens', 'iscc-palette.ase'), b'ASEF' + struct.pack('>HHI', 1, 0, len(PALETTE)) + blocks, 'wb')
    gpl = ['GIMP Palette', 'Name: ISCC', 'Columns: 3', '#']
    for n, h, zh in PALETTE:
        r, g, b = hex_rgb(h)
        gpl.append('%3d %3d %3d\t%s %s' % (r, g, b, n, h))
    write(out('tokens', 'iscc-palette.gpl'), '\n'.join(gpl) + '\n')

    # palette PNG via browser
    fdir = out('fonts', 'ttf')
    ps = json.load(open(out('fonts', 'postscript-names.json')))
    sw = []
    for i, (n, h, zh) in enumerate(PALETTE):
        dark_bg = sum(hex_rgb(h)) < 330
        fg = PARCH if dark_bg else BLACK
        sw.append('<div class="s" style="background:%s;color:%s%s"><b>%s</b><i>%s</i><code>%s</code></div>' % (
            h, fg, ';box-shadow:inset 0 0 0 1px rgba(154,163,178,.25)' if h in (BLACK,) else '', n.upper(), zh, h))
    html = '''<!doctype html><meta charset=utf-8><style>
@font-face{font-family:D;font-weight:900;src:url('file://%s/%s.ttf')}
@font-face{font-family:B;font-weight:600;src:url('file://%s/%s.ttf')}
@font-face{font-family:Z;font-weight:600;src:url('file://%s/%s.ttf')}
*{box-sizing:border-box;margin:0}body{width:2400px;height:600px;background:%s;display:flex;flex-direction:column}
.row{display:flex;flex:1}.s{flex:1;padding:36px 28px;display:flex;flex-direction:column;justify-content:flex-end;gap:10px;position:relative}
b{font:900 44px/1 D;letter-spacing:.04em}i{font:600 30px/1 Z;font-style:normal;letter-spacing:.14em;min-height:30px}
code{font:600 22px/1 B;letter-spacing:.16em}
</style><div class=row>%s</div>''' % (fdir, ps['display900'], fdir, ps['body600'], fdir, ps['cnBody600'], BLACK, ''.join(sw))
    hp = os.path.join(SCRATCH, 'palette.html')
    write(hp, html)
    run(['node', os.path.join(HERE, 'kit_shot.js'), hp, out('tokens', 'iscc-palette.png'), '2400', '600'])
    log('tokens done')


# =============================================================== 2. LOGOS
CW = [('gold', GOLD), ('parchment', PARCH), ('ink', INK), ('black', BLACK)]
DIRS = [('A', 'A-faceoff', 'Face-off', 'bar'), ('B', 'B-crest', 'The Crest', 'flare'), ('C', 'C-counterlight', 'Counterlight', 'shear')]


def L(d, fill, evenodd=False):
    return {'d': d, 'fill': fill, 'evenodd': evenodd}


def mark_el(key, c1, c2=None, c3=None, micro=False, laurel=True):
    c2, c3 = c2 or c1, c3 or c1
    if key == 'A':
        m = LD.mark_a_micro() if micro else LD.mark_a()
        s = 16 if micro else 240
        return dict(w=s, h=s, layers=[L(m['left'], c2), L(m['right'], c1), L(m['ticks'], c3)])
    if key == 'B':
        if micro:
            m = LD.mark_b_micro()
            return dict(w=240, h=240, layers=[L(m['shield'], c1, True), L(m['foot'], c1)])
        m = LD.mark_b(laurel)
        ls = [L(m['shield'], c1, True), L(m['foot'], c1)]
        if laurel:
            ls += [L(m['laurel_l'], c2), L(m['laurel_r'], c3)]
        return dict(w=240, h=240, layers=ls)
    m = LD.mark_c()
    return dict(w=240, h=240, layers=[L(m['beam'], c2, True), L(m['cup'], c1)])


def word_el(style, fill):
    d, w = LD.wordmark(style)
    return dict(w=w + 10, h=106, layers=[L(G.bake(d, 1, 6, 3), fill)])


_CN = None


def cn_el(fill):
    global _CN
    if _CN is None:
        s = open(os.path.join(HERE, 'cn-logotype.svgfrag'), encoding='utf-8').read()
        m = re.search(r'translate\(\s*([-\d.]+)[ ,]+([-\d.]+)\s*\)', s)
        tx, ty = float(m.group(1)), float(m.group(2))
        _CN = ' '.join(G.bake(d, 1, tx, ty) for d in re.findall(r'<path d="([^"]+)"', s))
    return dict(w=911.8, h=95.8, layers=[L(_CN, fill)])


def place(el, x, y, s=1.0):
    return [dict(l, d=G.bake(l['d'], s, x, y)) for l in el['layers']]


def content_box(el):
    bs = [G.bbox(l['d']) for l in el['layers']]
    return min(b[0] for b in bs), min(b[1] for b in bs), max(b[2] for b in bs), max(b[3] for b in bs)


def place_fit_h(el, x, y, h):
    """Place el so its CONTENT bbox has height h with top-left at (x, y). -> layers, width"""
    x0, y0, x1, y1 = content_box(el)
    s = h / (y1 - y0)
    return place(el, x - x0 * s, y - y0 * s, s), (x1 - x0) * s


def doc(title, w, h, layers, size=None, bg=None):
    return G.svg_doc(title, (0, 0, w, h), layers, size=size, bg=bg)


def el_doc(title, el):
    return doc(title, el['w'], el['h'], el['layers'])


def lockup_h(key, style, col, laurel=False):
    P, GAP, G2 = 14, 18, 26
    wm = word_el(style, col)
    ww = wm['w'] - 10
    cn = cn_el(col)
    cs = ww / cn['w']
    cnh = cn['h'] * cs
    blockH = 100 + GAP + cnh
    mk = mark_el(key, col, laurel=laurel)
    ml, mw = place_fit_h(mk, P, P, blockH)
    tx = P + mw + G2
    layers = ml + place(wm, tx - 6 + 0, P - 3, 1) + place(cn, tx, P + 100 + GAP, cs)
    return dict(w=tx + ww + P + 4, h=2 * P + blockH, layers=layers)


def lockup_s(key, style, col, laurel=False):
    P, MH, GAP = 14, 180, 30
    wm = word_el(style, col)
    ww = wm['w'] - 10
    mk = mark_el(key, col, laurel=laurel)
    x0, y0, x1, y1 = content_box(mk)
    mw = (x1 - x0) * MH / (y1 - y0)
    W = 2 * P + max(ww, mw) + 4
    ml, mw = place_fit_h(mk, (W - (x1 - x0) * MH / (y1 - y0)) / 2, P, MH)
    layers = ml + place(wm, (W - ww) / 2 - 6, P + MH + GAP - 3, 1)
    return dict(w=W, h=P + MH + GAP + 100 + P, layers=layers)


def sides_el(key, theme):
    if theme == 'dark':
        two = {'A': (GOLD, BLUETINT, PARCH), 'B': (PARCH, BLUETINT, GOLD), 'C': (GOLD, BLUETINT, None)}[key]
    else:
        two = {'A': (GOLD, BLUE, INK), 'B': (INK, BLUE, GOLD), 'C': (GOLD, BLUE, None)}[key]
    return mark_el(key, *two)


def emit_logo(folder, name, title, el, png_colourway=None, bg=None):
    p = out('logos', folder, name + '.svg')
    write(p, el_doc(title, el))
    return p


def logo_set(folder, base, title, make, micro_ok=True):
    """make(colour) -> el ; writes 4 colourway svgs, queues gold+parchment pngs."""
    for cwn, col in CW:
        el = make(col)
        p = out('logos', folder, '%s-%s.svg' % (base, cwn))
        write(p, el_doc('%s (%s)' % (title, cwn), el))
        if cwn in ('gold', 'parchment'):
            for Lg, w, h in sizes_for(el['w'], el['h']):
                queue_png(p, out('logos', folder, 'png', '%s-%s-%d.png' % (base, cwn, Lg)), w, h)


def build_logos():
    for key, folder, nm, style in DIRS:
        T = 'ISCC %s' % nm
        logo_set(folder, 'mark', T + ' mark', lambda c, k=key: mark_el(k, c))
        if key in ('A', 'B'):
            logo_set(folder, 'mark-micro', T + ' mark, 16 px cut', lambda c, k=key: mark_el(k, c, micro=True))
        logo_set(folder, 'wordmark', T + ' wordmark', lambda c, s=style: word_el(s, c))
        logo_set(folder, 'logotype-cn', 'ISCC 国际学校CS2锦标赛 logotype', lambda c: cn_el(c))
        logo_set(folder, 'lockup-horizontal', T + ' lockup, horizontal', lambda c, k=key, s=style: lockup_h(k, s, c))
        logo_set(folder, 'lockup-stacked', T + ' lockup, stacked', lambda c, k=key, s=style: lockup_s(k, s, c))
        for th in ('dark', 'light'):
            el = sides_el(key, th)
            p = out('logos', folder, 'sides-%s.svg' % th)
            write(p, el_doc('%s sides, CT / T, %s arena' % (T, th), el))
            for Lg, w, h in sizes_for(el['w'], el['h']):
                queue_png(p, out('logos', folder, 'png', 'sides-%s-%d.png' % (th, Lg)), w, h)
        # favicons
        fk = dict(micro=key in ('A', 'B'))
        fav = mark_el(key, GOLD, **fk)
        fp = out('logos', folder, 'favicon', 'favicon.svg')
        write(fp, el_doc(T + ' favicon', fav))
        for px in (16, 32, 48):
            if px == 48:
                src = fp if key == 'C' else write_tmp(folder + '-fav48', el_doc(T, mark_el(key, GOLD)))
            else:
                src = fp
            queue_png(src, out('logos', folder, 'favicon', 'favicon-%d.png' % px), px, px)
        full = mark_el(key, GOLD)
        ap = write_tmp(folder + '-apple', el_doc(T, full))
        queue_png(ap, out('logos', folder, 'favicon', 'apple-touch-180.png'), 180, 180, BLACK)
        # apple-touch: pad the mark (rendered via a padded svg)
        padded = G.svg_doc(T + ' apple touch', (-60, -60, 360, 360), [dict(l, d=l['d']) for l in full['layers']], size=(180, 180), bg=BLACK)
        write(ap, padded)
    # placeholder
    PH = 'M109 14h22v70h-22zM109 156h22v70h-22zM14 109h70v22H14zM156 109h70v22h-70z'
    for cwn, col in CW:
        p = out('logos', 'placeholder', 'mark-%s.svg' % cwn)
        write(p, G.svg_doc('ISCC placeholder mark (%s)' % cwn, (0, 0, 240, 240), [L(G.bake(PH), col)]))
        if cwn in ('gold', 'parchment'):
            for Lg, w, h in sizes_for(240, 240):
                queue_png(p, out('logos', 'placeholder', 'png', 'mark-%s-%d.png' % (cwn, Lg)), w, h)
    build_sheet()


def write_tmp(name, s):
    p = os.path.join(SCRATCH, name + '.svg')
    write(p, s)
    return p


def build_sheet():
    gl_d = G.Glyphs(os.path.join(CACHE, 'BS-900.ttf'))
    gl_l = G.Glyphs(os.path.join(CACHE, 'AR-600.ttf'))
    W, H = 1160, 1400
    layers = []

    def text(g, t, size, x, y, col, track=0.0):
        d, adv = g.path(t, size, x, y, track)
        layers.append(L(d, col))
        return adv
    text(gl_d, 'ISCC LOGO DIRECTIONS', 40, 40, 62, PARCH, .03)
    text(gl_l, 'THREE PROVISIONAL DIRECTIONS  /  MARK  /  WORDMARK  /  LOCKUPS', 11, 40, 88, SILVER, .22)
    for i, (key, folder, nm, style) in enumerate(DIRS):
        y0 = 110 + i * 420
        layers.append({'d': G.rect(40, y0, W - 80, 1), 'fill': SILVER, 'fill-opacity': '.16'})
        text(gl_d, key, 64, 40, y0 + 62, GOLD)
        text(gl_d, nm.upper(), 22, 92, y0 + 36, PARCH, .08)
        text(gl_l, 'WORDMARK STYLE: ' + style.upper(), 11, 92, y0 + 56, SILVER, .22)
        layers += place(mark_el(key, GOLD), 40, y0 + 90, 1.0)
        st = lockup_s(key, style, PARCH)
        layers += place(st, 320, y0 + 74, 0.9)
        wm = word_el(style, GOLD)
        layers += place(wm, 640, y0 + 76, 1.35)
        lk = lockup_h(key, style, PARCH)
        layers += place(lk, 640, y0 + 226, 1.0)
    p = out('logos', 'sheet.svg')
    write(p, G.svg_doc('ISCC logo directions sheet', (0, 0, W, H), layers, bg=BLACK))
    queue_png(p, out('logos', 'sheet.png'), W, H)


# =============================================================== 5. ORNAMENTS
SPRAY = [[0, 0], [1, -9], [-1, -19], [2, -30], [0, -42], [3, -54], [1, -66], [-4, -76], [-12, -83], [-21, -88], [-30, -91],
         [-38, -92], [-30, -96], [-18, -98], [-4, -99], [10, -98], [23, -99], [35, -97], [45, -99], [38, -102], [27, -103],
         [15, -102], [3, -104], [-9, -103], [-20, -105], [-12, -107], [0, -106], [12, -108], [22, -107], [30, -109]]


def quad_pts(p0, p1, p2, n=3000):
    pts = []
    for i in range(n + 1):
        t = i / n
        pts.append(((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
                    (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]))
    return pts


def dots_along(p0, p1, p2, frac=0.0171, r=1.7):
    pts = quad_pts(p0, p1, p2)
    cum = [0.0]
    for a, b in zip(pts, pts[1:]):
        cum.append(cum[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
    total = cum[-1]
    step = total * frac
    d, k, j = [], 0, 0
    while k * step <= total + 1e-6:
        s = k * step
        while j < len(cum) - 1 and cum[j + 1] < s:
            j += 1
        d.append(G.circle(pts[j][0], pts[j][1], r))
        k += 1
    return ''.join(d)


def ornament(name, title, vb, layers, pngs, bg=None):
    p = out('ornaments', name + '.svg')
    write(p, G.svg_doc(title, vb, layers, bg=bg))
    return p


def build_ornaments():
    colourways = [('gold', GOLD), ('parchment', PARCH)]

    def both(name, title, vb, mk, tag=None):
        for cwn, col in colourways:
            p = out('ornaments', '%s-%s.svg' % (name, cwn))
            write(p, G.svg_doc('%s (%s)' % (title, cwn), vb, mk(col)))
            for Lg, w, h in [t for t in sizes_for(vb[2], vb[3]) if t[0] == 2048]:
                queue_png(p, out('ornaments', 'png', '%s-%s-2048.png' % (name, cwn)), w, h)
    # spray
    def spray(col):
        big = ''.join(G.circle(60 + p[0], 290 + p[1] * 2.5, 3.6) for p in SPRAY[:7])
        small = ''.join(G.circle(60 + p[0], 290 + p[1] * 2.5, 2.8) for p in SPRAY[7:])
        return [L(big + small, col)]
    both('spray', 'ISCC authored spray pattern, 30 dots', (8, 4, 110, 300), spray)

    # arcs
    def arcs(col):
        a1 = dots_along((150, 372), (420, -90), (700, 200))
        a2 = dots_along((700, 200), (750, 150), (800, 262))
        a3 = dots_along((1100, 360), (985, 80), (800, 262))
        ring = G.circle(800, 262, 26.75) + G.circle(800, 262, 25.25)
        return [L(a1 + a2 + a3, col), L(ring, col, True), L(G.circle(800, 262, 5) + G.circle(700, 200, 5), col)]
    both('utility-arcs', 'ISCC utility arcs: three dotted parabolas, landing ring, bounce point', (0, 0, 1200, 420), arcs)

    # map
    def map_layers(theme):
        if theme == 'dark':
            grid, floor, site, crate = ({'stroke': SILVER, 'stroke-opacity': '.16'}, {'stroke': SILVER, 'stroke-opacity': '.34'}, GOLD, STAGE_D)
            room = {'fill': SILVER, 'fill-opacity': '.34'}
        else:
            grid, floor, site, crate = ({'stroke': INK, 'stroke-opacity': '.14'}, {'stroke': INK2_L, 'stroke-opacity': '.34'}, INKGOLD, STAGE_L)
            room = {'fill': INK2_L, 'fill-opacity': '.34'}
        B = lambda d: G.bake(d)
        ls = [dict(d=B('M0 66.5H400M0 133.5H400M0 200.5H400M0 266.5H400M0 333.5H400M66.5 0V400M133.5 0V400M200.5 0V400M266.5 0V400M333.5 0V400'),
                   fill='none', **{'stroke-width': '1'}, **grid)]
        for sw, d in [(34, 'M200 336V92'), (28, 'M246 356H338V128'), (28, 'M154 356H72V146'),
                      (22, 'M200 196H306V128M200 246H110V146'), (24, 'M248 66H292M152 66H118')]:
            ls.append(dict(d=B(d), fill='none', **{'stroke-width': str(sw), 'stroke-linejoin': 'miter', 'stroke-linecap': 'butt'}, **floor))
        ls.append(dict(d=B('M150 330h100v48H150zM156 38h88v56h-88zM288 54h84v78h-84zM32 66h88v84H32z'), **room))
        ls.append(dict(d=B('M300 66h60v54h-60zM44 78h64v60H44z'), fill='none', stroke=site, **{'stroke-width': '2', 'stroke-linejoin': 'miter'}))
        ls.append(dict(d=B('M316 84h14v14h-14zM62 104h16v12H62zM190 150h20v12h-20zM330 220h14v22h-14zM66 250h12v20H66z'), fill=crate))
        return ls
    for th in ('dark', 'light'):
        p = out('ornaments', 'tactical-map-%s.svg' % th)
        write(p, G.svg_doc('ISCC tactical map, %s arena' % th, (0, 0, 400, 400), map_layers(th)))
        queue_png(p, out('ornaments', 'png', 'tactical-map-%s-2048.png' % th), 2048, 2048)

    # crop marks
    def crops(col):
        x0, y0, x1, y1 = 120, 120, 780, 1000
        gap, ln, t = 14, 40, 3
        d = ''
        for cx, cy, sx, sy in [(x0, y0, -1, -1), (x1, y0, 1, -1), (x0, y1, -1, 1), (x1, y1, 1, 1)]:
            hx = cx + sx * gap if sx > 0 else cx - gap - ln
            d += G.rect(hx, cy - t / 2, ln, t)
            vy = cy + sy * gap if sy > 0 else cy - gap - ln
            d += G.rect(cx - t / 2, vy, t, ln)
        return [L(d, col)]
    both('crop-marks', 'ISCC crop marks, 3:4 trim', (0, 0, 900, 1120), crops)

    # ratio bar
    bar = [dict(d=G.rect(0, 0, 700, 120), fill=BLACK), dict(d=G.rect(700, 0, 200, 120), fill=BLUE), dict(d=G.rect(900, 0, 100, 120), fill=GOLD),
           dict(d=G.rect(0, 0, 1000, 120) + G.rect(1, 1, 998, 118), fill=SILVER, evenodd=True, **{'fill-opacity': '.4'})]
    p = out('ornaments', 'ratio-bar-70-20-10.svg')
    write(p, G.svg_doc('ISCC 70 / 20 / 10 ratio bar: Arena Black, Legacy Blue, Cup Gold', (0, 0, 1000, 120), bar))
    queue_png(p, out('ornaments', 'png', 'ratio-bar-70-20-10-2048.png'), 2048, 246)

    # grain tile
    import numpy as np
    from PIL import Image
    rng = np.random.default_rng(2026)
    n = rng.standard_normal((512, 512))
    fx = np.fft.fftfreq(512)[:, None] ** 2 + np.fft.fftfreq(512)[None, :] ** 2
    n = np.real(np.fft.ifft2(np.fft.fft2(n) * np.exp(-fx * (2 * math.pi ** 2) * 0.55 ** 2)))   # circular blur, stays tileable
    n = (n - n.mean()) / n.std()
    g = np.clip(np.rint(128 + n * 26), 0, 255)
    g += 128 - g.mean()          # zero-mean around mid grey
    g = np.clip(np.rint(g), 0, 255).astype('uint8')
    assert abs(float(g.mean()) - 128) < 0.25, g.mean()
    Image.fromarray(g, 'L').save(out('ornaments', 'png', 'film-grain-512.png'), optimize=True)
    log('ornaments done')


# =============================================================== 4. PLATES
def build_plates():
    pdir = out('plates', '.keep')
    S = '/'
    jobs = []
    pl = lambda n: out('plates', n)
    jobs += [
        dict(kind='beams', w=3840, h=2160, opts=dict(theme='dark', target=[0.5, 0.78]), png=pl('beams-dark-16x9.png')),
        dict(kind='beams', w=3840, h=2160, opts=dict(theme='light', target=[0.5, 0.78]), png=pl('beams-light-16x9.png')),
        dict(kind='beams', w=2160, h=3840, opts=dict(theme='dark', target=[0.5, 0.78]), png=pl('beams-dark-9x16.png')),
        dict(kind='beams', w=2160, h=2160, opts=dict(theme='dark', target=[0.5, 0.78]), png=pl('beams-dark-1x1.png')),
        dict(kind='smoke', w=3840, h=2160, opts=dict(theme='dark'), png=pl('smoke-dark-alpha.png')),
        dict(kind='smoke', w=3840, h=2160, opts=dict(theme='light'), png=pl('smoke-light-alpha.png')),
    ]
    for f in ('polished', 'brushed', 'chrome', 'steel'):
        jobs.append(dict(kind='cup', w=2000, h=2480, opts=dict(finish=f, theme='dark'), png=pl('cup-%s.png' % f)))
    jobs.append(dict(kind='cup', w=2000, h=2480, opts=dict(finish='polished', theme='light'), png=pl('cup-polished-light.png')))
    srcs = [os.path.join(ROOT, 'src', x) for x in ('fx.js', 'cup.js')] + [os.path.join(HERE, 'kit_capture.js')]
    newest = max(os.path.getmtime(s) for s in srcs)
    todo = [j for j in jobs if FORCE or not os.path.exists(j['png']) or os.path.getmtime(j['png']) < newest]
    if todo:
        jp = os.path.join(SCRATCH, 'plates.json')
        write(jp, json.dumps(todo))
        run(['node', os.path.join(HERE, 'kit_capture.js'), jp])
    else:
        log('plates up to date (KIT_FORCE=1 to recapture)')
    from PIL import Image
    for j in jobs:
        im = Image.open(j['png'])
        assert im.size == (j['w'], j['h']), (j['png'], im.size)
        if im.info.get('kit') != 'opt':          # lossless re-compress once (marker in a tEXt chunk)
            from PIL.PngImagePlugin import PngInfo
            im.load()
            meta = PngInfo()
            meta.add_text('kit', 'opt')
            im.save(j['png'], optimize=True, compress_level=9, pnginfo=meta)
        if 'beams' in j['png']:
            im.convert('RGB').save(j['png'][:-4] + '.jpg', quality=90, optimize=True, subsampling=0)
    log('plates done')


# =============================================================== 6. ASSETS.md
DESC = [
    (r'logos/sheet\.(svg|png)', 'review sheet: all three directions, marks / wordmarks / lockups, Arena Black'),
    (r'logos/placeholder/png/', 'neutral placeholder glyph, PNG render (transparent)'),
    (r'logos/placeholder/', 'neutral placeholder glyph (four bars and a gap), single-colour SVG'),
    (r'favicon/favicon\.svg', 'favicon SVG, gold (micro cut where one exists)'),
    (r'favicon/apple-touch', 'apple touch icon 180 px, gold on Arena Black'),
    (r'favicon/favicon-\d+', 'favicon PNG, transparent, gold'),
    (r'/png/.*mark-micro', '16 px optical cut, PNG render'),
    (r'/png/.*mark-', 'mark, PNG render'),
    (r'/png/.*wordmark', 'wordmark, PNG render'),
    (r'/png/.*logotype-cn', 'Chinese logotype, PNG render'),
    (r'/png/.*lockup-horizontal', 'horizontal lockup, PNG render'),
    (r'/png/.*lockup-stacked', 'stacked lockup, PNG render'),
    (r'/png/.*sides', 'CT/T two-colour mark, PNG render'),
    (r'logos/.*mark-micro', '16 px optical-cut mark, pure-path SVG'),
    (r'logos/.*mark-', 'mark, pure-path SVG'),
    (r'logos/.*wordmark', 'wordmark, pure-path SVG'),
    (r'logos/.*logotype-cn', 'Chinese logotype (国际学校CS2锦标赛), pure-path SVG'),
    (r'logos/.*lockup-horizontal', 'lockup: mark + wordmark + Chinese logotype beneath, SVG'),
    (r'logos/.*lockup-stacked', 'lockup: mark above wordmark, SVG'),
    (r'logos/.*sides-dark', 'two-colour CT (lit blue) / T (gold) version for dark arena, SVG'),
    (r'logos/.*sides-light', 'two-colour CT (blue) / T (text-safe gold) version for light arena, SVG'),
    (r'fonts/ttf/', 'full TTF for installation'),
    (r'fonts/web/.*gb2312', 'woff2 web build, GB2312 level-1 + CJK punctuation subset'),
    (r'fonts/web/', 'woff2 web build, full Latin'),
    (r'fonts/iscc-fonts\.css', '@font-face declarations for the four families'),
    (r'fonts/OFL\.txt', 'SIL Open Font License 1.1 with the four copyright lines'),
    (r'fonts/README\.md', 'font file list, weights, PostScript names'),
    (r'fonts/postscript-names\.json', 'role -> PostScript name map for After Effects scripts'),
    (r'tokens/iscc-tokens\.css', 'CSS custom properties: src/tokens.css verbatim + spacing, radius, motion, type scale'),
    (r'tokens/iscc-tokens\.json', 'design tokens (DTCG style): colour incl. both arenas, type, space, radius, motion'),
    (r'tokens/iscc-tokens\.scss', 'SCSS variables and arena maps'),
    (r'tokens/iscc-palette\.ase', 'Adobe Swatch Exchange palette (9 swatches)'),
    (r'tokens/iscc-palette\.gpl', 'GIMP / Inkscape palette'),
    (r'tokens/iscc-palette\.png', 'labelled swatch strip, 2400x600'),
    (r'plates/beams-.*\.jpg', 'opaque beam plate, JPG q90'),
    (r'plates/beams-', 'beam light plate, opaque PNG (static frame of ISCCFX.beams)'),
    (r'plates/smoke-', 'smoke plate, transparent PNG (static frame of ISCCFX.smoke)'),
    (r'plates/cup-polished-light', 'cup, polished finish, light theme, transparent'),
    (r'plates/cup-', 'cup render, transparent PNG (ISCCCUP.mount)'),
    (r'ornaments/png/', 'ornament PNG render (2048 px long side / 512 px tile)'),
    (r'ornaments/spray', 'authored 30-dot spray pattern, pure-path SVG'),
    (r'ornaments/utility-arcs', 'three dotted utility arcs + landing ring + bounce point, SVG'),
    (r'ornaments/tactical-map', 'tactical map, plain stroke/fill attributes, SVG'),
    (r'ornaments/crop-marks', 'eight crop-mark legs around a 3:4 trim, SVG'),
    (r'ornaments/ratio-bar', '70 / 20 / 10 ratio bar, SVG'),
    (r'ASSETS\.md', 'this file'),
]


def hs(n):
    for u in ('B', 'KB', 'MB', 'GB'):
        if n < 1024 or u == 'GB':
            return ('%d %s' % (n, u)) if u == 'B' else '%.1f %s' % (n, u)
        n /= 1024.0


def build_assets():
    p = out('ASSETS.md')
    write(p, '')
    files = []
    for dp, _, fs in os.walk(KIT):
        for f in fs:
            fp = os.path.join(dp, f)
            files.append(os.path.relpath(fp, KIT))
    files = sorted(f for f in files if f.split('/')[0] in ('logos', 'fonts', 'tokens', 'plates', 'ornaments', 'ASSETS.md'))
    lines = ['# ISCC asset kit', '', 'Generated by `python3 tools/build_kit.py`. Do not edit by hand.', '']
    tops = ['logos', 'fonts', 'tokens', 'plates', 'ornaments']
    tot = 0
    sizes = {}
    for t in tops:
        sizes[t] = sum(os.path.getsize(os.path.join(KIT, f)) for f in files if f.startswith(t + '/'))
    tot = sum(os.path.getsize(os.path.join(KIT, f)) for f in files if f != 'ASSETS.md')
    lines += ['| Directory | Size |', '|---|---|'] + ['| `kit/%s/` | %s |' % (t, hs(sizes[t])) for t in tops] + ['| **total** | **%s** |' % hs(tot), '']
    cur = None
    for f in files:
        top = f.split('/')[0]
        if top != cur:
            cur = top
            lines += ['', '## ' + (top if top != 'ASSETS.md' else 'misc'), '']
        d = next((dsc for rx, dsc in DESC if re.search(rx, f)), '')
        lines.append('- `%s` (%s): %s' % (f, hs(os.path.getsize(os.path.join(KIT, f))), d))
    write(p, '\n'.join(lines) + '\n')


# =============================================================== main
def main():
    os.makedirs(KIT, exist_ok=True)
    build_fonts()
    build_tokens()
    build_logos()
    build_ornaments()
    jp = os.path.join(SCRATCH, 'png-jobs.json')
    write(jp, json.dumps(PNG_JOBS))
    for j in PNG_JOBS:
        os.makedirs(os.path.dirname(j['png']), exist_ok=True)
    run(['node', os.path.join(HERE, 'kit_render.js'), jp])
    build_plates()
    build_assets()
    log('running SVG validator')
    run([sys.executable, os.path.join(HERE, 'kit_validate_svg.py')])
    build_assets()   # sizes after everything


if __name__ == '__main__':
    main()
