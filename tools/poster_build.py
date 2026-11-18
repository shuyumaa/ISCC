#!/usr/bin/env python3
"""Bake kit/poster/a4-landscape.src.html into self-contained posters (images and fonts inlined),
so the file keeps working wherever it is copied."""
import base64, os

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(R, 'kit/poster')


def b64(path, mime):
    with open(path, 'rb') as f:
        return 'data:%s;base64,%s' % (mime, base64.b64encode(f.read()).decode())


FONTS = [
    ('Big Shoulders Display', 900, 'BigShouldersDisplay-Black.woff2', ''),
    ('Big Shoulders Display', 800, 'BigShouldersDisplay-ExtraBold.woff2', ''),
    ('Archivo', 400, 'Archivo-Regular.woff2', ''),
    ('Archivo', 600, 'Archivo-SemiBold.woff2', ''),
    ('Noto Serif SC', 900, 'NotoSerifSC-Black-gb2312.woff2', 'U+2E80-2FDF,U+3000-30FF,U+3400-4DBF,U+4E00-9FFF,U+F900-FAFF,U+FE30-FE4F,U+FF00-FFEF'),
    ('Noto Sans SC', 600, 'NotoSansSC-SemiBold-gb2312.woff2', 'U+2E80-2FDF,U+3000-30FF,U+3400-4DBF,U+4E00-9FFF,U+F900-FAFF,U+FE30-FE4F,U+FF00-FFEF'),
]
css = ''
for fam, w, fn, rng in FONTS:
    css += "@font-face{font-family:'%s';font-weight:%d;font-display:block;src:url(%s) format('woff2')%s}\n" % (
        fam, w, b64(os.path.join(R, 'kit/fonts/web', fn), 'font/woff2'), (';unicode-range:' + rng) if rng else '')

src = open(os.path.join(P, 'a4.src.html'), encoding='utf-8').read()
for fmt in ('landscape', 'portrait'):
    for theme in ('dark', 'light'):
        out = (src.replace('/*@fonts*/', css)
                  .replace('{{THEME}}', theme).replace('{{FORMAT}}', fmt)
                  .replace('{{BEAMS}}', b64(os.path.join(P, 'plates/beams-%s-%s.jpg' % (theme, fmt)), 'image/jpeg'))
                  .replace('{{CUP}}', b64(os.path.join(P, 'plates/cup-%s.png' % theme), 'image/png')))
        dst = os.path.join(P, 'ISCC-A4-%s-%s.html' % (fmt, theme))
        open(dst, 'w', encoding='utf-8').write(out)
        print(os.path.basename(dst), round(len(out.encode()) / 1e6, 2), 'MB')
