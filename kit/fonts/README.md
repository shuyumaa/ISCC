# ISCC fonts

Full, un-subset TTFs for installing (designers, After Effects) plus web builds. All four families are SIL Open Font License 1.1 (`OFL.txt`).

| File | Family | Weight | PostScript name | Role |
|---|---|---|---|---|
| `ttf/BigShouldersDisplay-Black.ttf` | Big Shoulders Display | 900 | `BigShouldersDisplay-Black` | display900 |
| `ttf/BigShouldersDisplay-ExtraBold.ttf` | Big Shoulders Display | 800 | `BigShouldersDisplay-ExtraBold` | display800 |
| `ttf/Archivo-Regular.ttf` | Archivo | 400 | `Archivo-Regular` | body400 |
| `ttf/Archivo-SemiBold.ttf` | Archivo | 600 | `Archivo-SemiBold` | body600 |
| `ttf/Archivo-Bold.ttf` | Archivo | 700 | `Archivo-Bold` | body700 |
| `ttf/NotoSerifSC-Black.ttf` | Noto Serif SC | 900 | `NotoSerifSC-Black` | cnDisplay900 |
| `ttf/NotoSansSC-Regular.ttf` | Noto Sans SC | 400 | `NotoSansSC-Regular` | cnBody400 |
| `ttf/NotoSansSC-SemiBold.ttf` | Noto Sans SC | 600 | `NotoSansSC-SemiBold` | cnBody600 |

## Web builds (`web/`)

- Latin families: complete fonts converted to woff2 (no subsetting): `web/BigShouldersDisplay-Black.woff2`, `web/BigShouldersDisplay-ExtraBold.woff2`, `web/Archivo-Regular.woff2`, `web/Archivo-SemiBold.woff2`, `web/Archivo-Bold.woff2`.
- Chinese families: `*-gb2312.woff2`, subset to GB2312 level-1 hanzi (3,755) + CJK/fullwidth punctuation (U+3000-303F, U+FF01-FF64, quotes, ellipsis, middle dot). Characters outside that set fall back to the system font; use the TTFs if you need full coverage.
- `iscc-fonts.css` declares `@font-face` for 'Big Shoulders Display' (800, 900), 'Archivo' (400, 600, 700), 'Noto Serif SC' (900) and 'Noto Sans SC' (400, 600) with relative URLs. The Chinese faces carry a CJK-only `unicode-range` so Latin text never downloads them. `font-display: swap`.

## After Effects / scripting

After Effects addresses fonts by PostScript name. `postscript-names.json` maps roles to names:

```json
{
  "display900": "BigShouldersDisplay-Black",
  "display800": "BigShouldersDisplay-ExtraBold",
  "body400": "Archivo-Regular",
  "body600": "Archivo-SemiBold",
  "body700": "Archivo-Bold",
  "cnDisplay900": "NotoSerifSC-Black",
  "cnBody400": "NotoSansSC-Regular",
  "cnBody600": "NotoSansSC-SemiBold"
}
```

The exact name comes from the `name` table, ID 6, of each TTF.
