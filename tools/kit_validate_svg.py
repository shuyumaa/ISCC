#!/usr/bin/env python3
"""Fail (exit 1) if any SVG under kit/ contains text, fonts, currentColor, raster images,
or external references. Usage: python3 tools/kit_validate_svg.py [root]"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BAD = [
    (re.compile(r'<text', re.I), '<text'),
    (re.compile(r'<tspan', re.I), '<tspan'),
    (re.compile(r'font-family', re.I), 'font-family'),
    (re.compile(r'currentColor', re.I), 'currentColor'),
    (re.compile(r'<image', re.I), '<image'),
    (re.compile(r'<foreignObject', re.I), '<foreignObject'),
    (re.compile(r'<script', re.I), '<script'),
    (re.compile(r'<style', re.I), '<style'),
    (re.compile(r'\bhref\s*=', re.I), 'href reference'),
    (re.compile(r'url\s*\(', re.I), 'url() reference'),
    (re.compile(r'@import', re.I), '@import'),
]


def check(path):
    s = open(path, encoding='utf-8').read()
    errs = [name for rx, name in BAD if rx.search(s)]
    # external references: any http(s):// other than the xmlns declaration
    stripped = re.sub(r'xmlns(:\w+)?="[^"]*"', '', s)
    if re.search(r'(https?:)?//[A-Za-z0-9]', stripped) and re.search(r'https?://', stripped):
        errs.append('external URL')
    if 'xmlns="http://www.w3.org/2000/svg"' not in s:
        errs.append('missing xmlns')
    if 'viewBox=' not in s:
        errs.append('missing viewBox')
    if '<title>' not in s:
        errs.append('missing <title>')
    return errs


def main():
    root = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(ROOT, 'kit')
    n = bad = 0
    for dp, _, fs in os.walk(root):
        for f in sorted(fs):
            if f.lower().endswith('.svg'):
                n += 1
                p = os.path.join(dp, f)
                e = check(p)
                if e:
                    bad += 1
                    print('FAIL %s: %s' % (os.path.relpath(p, ROOT), ', '.join(e)))
    print('kit_validate_svg: %d svg checked, %d failed' % (n, bad))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
