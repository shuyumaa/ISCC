#!/usr/bin/env python3
"""Assemble src/* into the single offline index.html.
Authoring aid only: the shipped file has no build step."""
import os, re, subprocess, sys

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def rd(p):
    p = os.path.join(R, p)
    return open(p, encoding='utf-8').read() if os.path.exists(p) else ''


def bi(s):
    return re.sub(r'\{\{(.*?)\|\|(.*?)\}\}', r'<span class="le">\1</span><span class="lz">\2</span>', s, flags=re.S)


page = bi(rd('src/page.html'))
hud = bi(rd('src/hud.html'))
css = '\n'.join(rd(f) for f in ('src/tokens.css', 'src/page.css', 'src/fx.css', 'src/hud.css', 'src/overrides.css'))
js = '\n'.join('<script>\n%s\n</script>' % rd(f) for f in ('src/fx.js', 'src/cup.js', 'src/hud.js', 'src/page.js') if rd(f))
tmp = (page.replace('<!--@hud-->', hud)
           .replace('<!--@css-->', '<style>\n%s\n</style>' % css)
           .replace('<!--@js-->', js))
scan = os.path.join(R, 'tools/.scan.html')
open(scan, 'w', encoding='utf-8').write(tmp)
if '--fonts' in sys.argv or not rd('src/fonts.css'):
    subprocess.check_call([sys.executable, os.path.join(R, 'tools/subset_fonts.py'),
                           '--out', os.path.join(R, 'src/fonts.css'), scan])
out = tmp.replace('<!--@fonts-->', '<style>\n%s\n</style>' % rd('src/fonts.css'))
open(os.path.join(R, 'index.html'), 'w', encoding='utf-8').write(out)
print('index.html', len(out.encode()), 'bytes')
