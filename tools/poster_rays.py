#!/usr/bin/env python3
"""Backlit god rays for the A4 posters (volumetric light scattering as a post-process:
a bright source behind the cup, occluded by the cup's silhouette, radially blurred outward).
Writes kit/poster/plates/rays-<theme>-<format>.jpg at 300 dpi.  python3 tools/poster_rays.py"""
import os
import numpy as np
from PIL import Image, ImageFilter

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(R, 'kit/poster/plates')
# trim size mm, cup centre x, cup top, cup width (must match a4.src.html)
FMT = {'landscape': (297, 210, 148.5, 58.0, 80.0), 'portrait': (210, 297, 105.0, 92.0, 80.0)}
DPI = 300
WORK = 0.5          # render at half resolution; the rays are soft, then upscale
BLUE = np.array([86, 128, 214]) / 255.0
GOLD = np.array([226, 178, 72]) / 255.0
WARM = np.array([255, 244, 214]) / 255.0


def radial_blur(src, lx, ly, n=110, reach=0.985, decay=0.972):
    """Sum of copies of src scaled toward (lx, ly): every pixel gathers the light lying between it and the source."""
    im = Image.fromarray(src.astype(np.float32), 'F')
    w, h = im.size
    acc = np.zeros_like(src, dtype=np.float32)
    wsum = 0.0
    for k in range(n):
        s = 1.0 - reach * k / n
        wt = decay ** k
        t = im.transform((w, h), Image.AFFINE, (s, 0, lx * (1 - s), 0, s, ly * (1 - s)), resample=Image.BILINEAR)
        acc += np.asarray(t, dtype=np.float32) * wt
        wsum += wt
    return acc / wsum


def render(fmt, theme):
    Wmm, Hmm, cx, cupT, cupW = FMT[fmt]
    pxmm = DPI / 25.4 * WORK
    W, H = int(round(Wmm * pxmm)), int(round(Hmm * pxmm))
    cupH = cupW * 1.24
    lx, ly = cx * pxmm, (cupT + cupH * 0.26) * pxmm     # the source sits behind the bowl

    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    dx, dy = xx - lx, yy - ly
    r = np.sqrt(dx * dx + dy * dy) / pxmm                  # mm from the source
    th = np.arctan2(dy, dx)

    # emission: hot core + halo, broken into blades so the rays read as shafts, not a smooth glow
    rng = np.random.default_rng(26)
    blades = np.full_like(th, 0.10)
    for _ in range(64):
        a = rng.uniform(-np.pi, np.pi)
        wdt = rng.uniform(0.003, 0.022) * (3.0 if rng.random() < .15 else 1.0)
        amp = rng.uniform(0.1, 1.0) ** 2.4
        d = np.angle(np.exp(1j * (th - a)))
        blades += amp * np.exp(-(d / wdt) ** 2)
    up = np.clip(-np.sin(th), 0, 1)                         # stronger upward, weaker into the floor
    blades *= 0.55 + 0.75 * up
    core = np.exp(-(r / 13.0) ** 2) * 3.0 + np.exp(-(r / 34.0) ** 2) * 1.1
    emis = core * blades

    # occluder: the cup's silhouette, placed exactly where the page draws it
    cup = Image.open(os.path.join(P, 'cup-%s.png' % theme)).convert('RGBA')
    cw = int(round(cupW * pxmm))
    ch = int(round(cw * cup.height / cup.width))
    alpha = np.zeros((H, W), np.float32)
    a = np.asarray(cup.resize((cw, ch), Image.LANCZOS))[:, :, 3].astype(np.float32) / 255.0
    x0, y0 = int(round((cx - cupW / 2) * pxmm)), int(round((cupT + cupH) * pxmm)) - ch
    alpha[y0:y0 + ch, x0:x0 + cw] = a
    emis *= (1.0 - alpha) ** 2

    rays = radial_blur(emis, lx, ly)
    rays = np.maximum(rays, 0)
    hz = Image.fromarray(rays, 'F')
    hz = hz.resize((max(1, W // 24), max(1, H // 24)), Image.BOX).resize((W, H), Image.BICUBIC)
    rays += np.asarray(hz, np.float32) * 0.6   # haze

    # colour by side: CT blue to the left, T gold to the right, warm white straight up and in the core
    side = np.clip(dx / (np.abs(dx) + 40 * pxmm), -1, 1)[..., None]
    tint = np.where(side < 0, BLUE, GOLD)
    mixw = np.clip(np.abs(side) * 1.7, 0, 1)
    col = WARM * (1 - mixw) + tint * mixw
    hot = np.clip(np.exp(-(r / 22.0) ** 2), 0, 1)[..., None]
    col = col * (1 - hot) + WARM * hot

    I = rays[..., None]
    if theme == 'dark':
        base = np.array([7, 9, 13]) / 255.0
        lit = 1.0 - np.exp(-I * col * 3.4)
        out = base + (1 - base) * lit
    else:
        base = np.array([233, 225, 205]) / 255.0
        cl = np.where(side < 0, np.array([21, 41, 78]) / 255.0, np.array([150, 112, 40]) / 255.0) * mixw + col * (1 - mixw)
        shade = 1.0 - np.clip(I * 1.25, 0, 0.62) * (1.0 - cl)       # ink-blue and umber shafts on paper
        glow = 1.0 - np.exp(-I * hot * 3.0)                                  # a clean white core
        out = base * shade
        out = out + (1.0 - out) * glow
    out = np.clip(out, 0, 1)
    img = Image.fromarray((out * 255 + 0.5).astype(np.uint8), 'RGB')
    full = (int(round(Wmm / 25.4 * DPI)), int(round(Hmm / 25.4 * DPI)))
    img = img.resize(full, Image.LANCZOS)
    dst = os.path.join(P, 'rays-%s-%s.jpg' % (theme, fmt))
    img.save(dst, quality=92, subsampling=0)
    print(os.path.basename(dst), img.size)


if __name__ == '__main__':
    for f in FMT:
        for t in ('dark', 'light'):
            render(f, t)
