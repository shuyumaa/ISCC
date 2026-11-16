#!/usr/bin/env python3
"""Subset the page's four font families and emit src/fonts.css (base64 woff2).

Usage:  python3 tools/subset_fonts.py --out src/fonts.css FILE [FILE...]

* Scans FILEs (html/css/js) for the characters used.
* Latin families (Big Shoulders Display, Archivo): Basic Latin + fixed punctuation
  set + any non-CJK characters used. Variable fonts (fontsource) are preferred;
  if a character actually used on the page is only in the full static TTFs,
  that family automatically falls back to per-weight static rules.
* CJK families (Noto Serif SC 900, Noto Sans SC 400/600): only CJK characters and
  CJK / fullwidth punctuation found in the files, with a CJK-only unicode-range.
* Source fonts are fetched once from npm into tools/.fontcache/ (needs `npm`,
  and `pip install fonttools brotli`); later runs work fully offline.
"""
import argparse
import base64
import io
import os
import re
import shutil
import subprocess
import sys
import tarfile
import tempfile
import unicodedata

try:
    from fontTools.ttLib import TTFont
    from fontTools import subset as ftsubset
    from fontTools.varLib import instancer
    import brotli  # noqa: F401  (needed for woff2)
except ImportError:
    sys.exit("Missing deps: pip install fonttools brotli")

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, ".fontcache")
V1_CSS = os.path.join(HERE, "fonts-v1.css")
BUDGET = 450 * 1024

FIXED = "·—–’‘“”…×→←↑↓°$€£¥±≤≥№"
FEATURES = ["kern", "liga", "tnum", "lnum", "case", "rvrn"]  # rvrn: variable-font feature variations

# unicode-range for the CJK families (never matches Latin text)
CJK_RANGES = [(0x2E80, 0x2FDF), (0x3000, 0x30FF), (0x3400, 0x4DBF), (0x4E00, 0x9FFF),
              (0xF900, 0xFAFF), (0xFE30, 0xFE4F), (0xFF00, 0xFFEF), (0x20000, 0x2FFFF)]
UNICODE_RANGE = ",".join("U+%X-%X" % r for r in CJK_RANGES)

# (cache file name, npm package, member path inside the tarball)
SOURCES = {
    "BS-var": ("@fontsource-variable/big-shoulders-display", "package/files/big-shoulders-display-latin-wght-normal.woff2"),
    "BS-800": ("@expo-google-fonts/big-shoulders-display", "package/BigShouldersDisplay_800ExtraBold.ttf"),
    "BS-900": ("@expo-google-fonts/big-shoulders-display", "package/BigShouldersDisplay_900Black.ttf"),
    "AR-var": ("@fontsource-variable/archivo", "package/files/archivo-latin-wght-normal.woff2"),
    "AR-400": ("@expo-google-fonts/archivo", "package/400Regular/Archivo_400Regular.ttf"),
    "AR-600": ("@expo-google-fonts/archivo", "package/600SemiBold/Archivo_600SemiBold.ttf"),
    "AR-700": ("@expo-google-fonts/archivo", "package/700Bold/Archivo_700Bold.ttf"),
    "SERIF-900": ("@expo-google-fonts/noto-serif-sc", "package/900Black/NotoSerifSC_900Black.ttf"),
    "SANS-400": ("@expo-google-fonts/noto-sans-sc", "package/400Regular/NotoSansSC_400Regular.ttf"),
    "SANS-600": ("@expo-google-fonts/noto-sans-sc", "package/600SemiBold/NotoSansSC_600SemiBold.ttf"),
}


def is_cjk(c):
    o = ord(c)
    return any(a <= o <= b for a, b in CJK_RANGES)


# ---------------------------------------------------------------- source fonts
def cache_path(key):
    return os.path.join(CACHE, key + os.path.splitext(SOURCES[key][1])[1])


def ensure_sources(keys):
    """Download (via npm pack) any missing source fonts into the cache."""
    missing = [k for k in keys if not os.path.exists(cache_path(k))]
    if not missing:
        return
    os.makedirs(CACHE, exist_ok=True)
    by_pkg = {}
    for k in missing:
        by_pkg.setdefault(SOURCES[k][0], []).append(k)
    for pkg, ks in by_pkg.items():
        print("[fonts] downloading %s from npm ..." % pkg, flush=True)
        tmp = tempfile.mkdtemp(prefix="_dl_", dir=CACHE)
        try:
            r = subprocess.run(["npm", "pack", pkg, "--silent"], cwd=tmp, capture_output=True, text=True)
            tgzs = [f for f in os.listdir(tmp) if f.endswith(".tgz")]
            if r.returncode or not tgzs:
                print("[fonts] npm pack failed for %s: %s" % (pkg, r.stderr.strip()[:300]))
                continue
            with tarfile.open(os.path.join(tmp, tgzs[0])) as tf:
                for k in ks:
                    try:
                        data = tf.extractfile(SOURCES[k][1]).read()
                    except (KeyError, AttributeError):
                        print("[fonts] %s not found in %s" % (SOURCES[k][1], pkg))
                        continue
                    with open(cache_path(k), "wb") as fh:
                        fh.write(data)
        finally:
            shutil.rmtree(tmp, ignore_errors=True)


def have(key):
    return os.path.exists(cache_path(key))


# -------------------------------------------------------------------- subsetting
def subset_font(font, chars):
    opts = ftsubset.Options()
    opts.hinting = False
    opts.layout_features = FEATURES
    opts.notdef_outline = False
    opts.name_IDs = [1, 2]
    opts.glyph_names = False
    opts.flavor = "woff2"
    opts.desubroutinize = True
    sub = ftsubset.Subsetter(opts)
    sub.populate(unicodes=[ord(c) for c in chars])
    sub.subset(font)
    buf = io.BytesIO()
    font.flavor = "woff2"
    font.save(buf)
    data = buf.getvalue()
    return TTFont(io.BytesIO(data)), data


def load(key):
    return TTFont(cache_path(key))


def cmap_of(key):
    return set(load(key).getBestCmap())


def features_of(font):
    return sorted({r.FeatureTag for r in font["GSUB"].table.FeatureList.FeatureRecord}) if "GSUB" in font else []


def face(family, weight, data, unicode_range=None):
    b64 = base64.b64encode(data).decode()
    ur = ";unicode-range:%s" % unicode_range if unicode_range else ""
    return ("@font-face{font-family:'%s';font-style:normal;font-weight:%s;font-display:swap;"
            "src:url(data:font/woff2;base64,%s) format('woff2')%s}" % (family, weight, b64, ur))


def v1_rules():
    css = open(V1_CSS, encoding="utf-8").read()
    out = {}
    for m in re.finditer(r"@font-face\{[^}]*\}", css):
        r = m.group(0)
        fam = re.search(r"font-family:'([^']+)'", r).group(1)
        w = re.search(r"font-weight:([^;]+);", r).group(1)
        out[(fam, w)] = r
    return out


# ------------------------------------------------------------------------ main
def collect_chars(files):
    text = []
    for f in files:
        with open(f, encoding="utf-8", errors="replace") as fh:
            t = fh.read()
        t = re.sub(r"data:[a-z/+.-]+;base64,[A-Za-z0-9+/=]+", "", t)  # embedded blobs
        t = re.sub(r"<!--.*?-->", "", t, flags=re.S)
        text.append(t)
    chars = set("".join(text))
    return {c for c in chars if not c.isspace() and unicodedata.category(c) not in ("Cc", "Cf", "Co", "Cn", "Cs")}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", required=True, help="output css path")
    ap.add_argument("files", nargs="+", metavar="FILE")
    args = ap.parse_args()

    used = collect_chars(args.files)
    cjk_used = {c for c in used if is_cjk(c)}
    other_used = {c for c in used if not is_cjk(c) and ord(c) > 0x7E}
    latin_want = {chr(i) for i in range(0x20, 0x7F)} | set(FIXED) | other_used
    print("[fonts] %d distinct chars used: %d CJK/fullwidth, %d non-ASCII non-CJK"
          % (len(used), len(cjk_used), len(other_used)))

    ensure_sources(SOURCES.keys())

    v1 = None
    rows, rules = [], []   # rows: (family, weight, glyphs, bytes, note)
    embedded = {"latin": set(), "cjk": set()}  # codepoints actually present in output
    loud = []

    # ---------------- Latin families
    for fam, pre, widths in (("Big Shoulders Display", "BS", {"wght": (700, 900)}),
                             ("Archivo", "AR", {"wght": (400, 700)})):
        static_keys = {"BS": ["BS-800", "BS-900"], "AR": ["AR-400", "AR-600", "AR-700"]}[pre]
        static_w = {k: k.split("-")[1] for k in static_keys}
        var_key = pre + "-var"
        mode = None
        if have(var_key):
            vcm = cmap_of(var_key)
            need_static = [c for c in other_used if ord(c) not in vcm and all(have(k) for k in static_keys)
                           and ord(c) in cmap_of(static_keys[0])]
            if need_static:
                print("[fonts] %s: variable source lacks %s which the page uses -> using static weights"
                      % (fam, "".join(sorted(need_static))))
                mode = "static"
            else:
                mode = "variable"
        elif all(have(k) for k in static_keys):
            mode = "static"
        if mode == "variable":
            f = load(var_key)
            limits = dict(widths)
            if "fvar" in f and any(a.axisTag == "wdth" for a in f["fvar"].axes):
                limits["wdth"] = 100
            f = instancer.instantiateVariableFont(f, limits)
            _b = io.BytesIO(); f.save(_b); f = TTFont(io.BytesIO(_b.getvalue()))  # reload: avoids lazy-gvar subset bug
            sf, data = subset_font(f, latin_want)
            rules.append(face(fam, "%d %d" % widths["wght"], data))
            rows.append((fam, "%d-%d (var)" % widths["wght"], len(sf.getGlyphOrder()), len(data),
                         "feat:" + ",".join(t for t in features_of(sf) if t in FEATURES)))
            embedded["latin"] |= set(sf.getBestCmap())
        elif mode == "static":
            for k in static_keys:
                sf, data = subset_font(load(k), latin_want)
                rules.append(face(fam, static_w[k], data))
                rows.append((fam, static_w[k] + " (static)", len(sf.getGlyphOrder()), len(data),
                             "feat:" + ",".join(t for t in features_of(sf) if t in FEATURES)))
                embedded["latin"] |= set(sf.getBestCmap())
        else:
            loud.append("!! %s could not be obtained: re-emitting fonts-v1.css rules UNCHANGED" % fam)
            v1 = v1 or v1_rules()
            for (vf, vw), r in v1.items():
                if vf == fam:
                    rules.append(r)
                    m = re.search(r"base64,([^)]+)\)", r)
                    n = len(base64.b64decode(m.group(1)))
                    rows.append((fam, vw + " (v1 fallback)", 0, n, ""))

    # ---------------- CJK families
    for fam, key, w in (("Noto Serif SC", "SERIF-900", "900"),
                        ("Noto Sans SC", "SANS-400", "400"),
                        ("Noto Sans SC", "SANS-600", "600")):
        if have(key):
            f = load(key)
            cm = f.getBestCmap()
            want = {c for c in cjk_used if ord(c) in cm}
            sf, data = subset_font(f, want)
            rules.append(face(fam, w, data, UNICODE_RANGE))
            rows.append((fam, w, len(sf.getGlyphOrder()), len(data), "%d chars" % len(want)))
            embedded["cjk"] |= set(sf.getBestCmap())
        else:
            loud.append("!! %s %s could not be obtained: re-emitting fonts-v1.css rule UNCHANGED (only 136 glyphs!)" % (fam, w))
            v1 = v1 or v1_rules()
            r = v1.get((fam, w))
            if r:
                rules.append(r)
                m = re.search(r"base64,([^)]+)\)", r)
                rows.append((fam, w + " (v1 fallback)", 0, len(base64.b64decode(m.group(1))), ""))
                embedded["cjk"] |= {0}  # unknown coverage

    css = "\n".join(rules) + "\n"
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as fh:
        fh.write(css)

    # ---------------- report
    print()
    print("%-24s %-18s %7s %10s  %s" % ("family", "weight", "glyphs", "woff2 B", "notes"))
    for r in rows:
        print("%-24s %-18s %7d %10d  %s" % r)
    total = os.path.getsize(args.out)
    print("\nTotal %s: %d bytes (%.1f KB)" % (args.out, total, total / 1024))
    if total > BUDGET:
        print("WARNING: over the %d KB budget by %.1f KB" % (BUDGET // 1024, (total - BUDGET) / 1024))
    for l in loud:
        print("\n" + "!" * 70 + "\n" + l + "\n" + "!" * 70)

    cj = embedded["cjk"]
    uncovered = sorted(c for c in used if ord(c) > 0x7E and ord(c) not in embedded["latin"]
                       and not (is_cjk(c) and ord(c) in cj))
    if uncovered:
        print("\nCharacters used in the files that NO embedded family covers (%d):" % len(uncovered))
        print("  " + " ".join("%s(U+%04X)" % (c, ord(c)) for c in uncovered))
    else:
        print("\nAll used non-ASCII characters are covered by an embedded family.")


if __name__ == "__main__":
    main()
