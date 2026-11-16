# ISCC kit

Everything needed to produce ISCC material without opening the concept page.
All content is concept material: the teams, schools, players and maps are invented.

| Folder | What it is | Start with |
|---|---|---|
| `logos/` | Three provisional logo directions (A Face-off, B The Crest, C Counterlight) and the neutral placeholder glyph. Pure-path SVG in gold, parchment, ink and black; PNG at 256, 1024 and 2048; favicons. | `logos/sheet.png` |
| `fonts/` | Full font files (TTF) for design tools and After Effects, web builds (woff2) and one stylesheet. All four families are under the SIL Open Font License. | `fonts/README.md` |
| `tokens/` | Colour, type, spacing and motion tokens as CSS, JSON and SCSS; swatches for Adobe (`.ase`) and GIMP/Inkscape (`.gpl`). | `tokens/iscc-tokens.css` |
| `plates/` | Rendered backgrounds: 4K beam plates in both arenas and three ratios, transparent smoke plates, transparent cup renders in four finishes. | `plates/beams-dark-16x9.png` |
| `ornaments/` | Spray pattern, utility arcs, tactical map, crop marks, film-grain tile, the 70/20/10 ratio bar. SVG and PNG. | `ornaments/png/` |
| `overlays/` | Eleven 1920×1080 transparent pages for OBS browser sources: scoreboard, player rows, killfeed, lower third, map veto, round win, stinger, matchup, starting soon, break, full HUD. Driven by URL parameters or a live update call. | `overlays/README.md` |
| `ae/` | After Effects scripts that build 62 template comps: transitions, lower thirds, in-game graphics, full screens, ads and social, elements. | `ae/README.md` |

`ASSETS.md` lists every file in logos, fonts, tokens, plates and ornaments.

## Using your own logo

The three directions here are provisional. When the final mark exists:

- **Concept page (`index.html`)**: open the Mark plate and load the file. Opaque images from an image model are keyed and trimmed automatically.
- **OBS overlays**: pass `logo=<url>` to any page.
- **After Effects**: replace the contents of the precomp `LOGO (replace me)`; every template references it.

## Known limits

- The After Effects scripts were validated against a mock runtime, not inside After Effects. Run them once with the JavaScript debugger enabled and expect small layout corrections.
- The plates are static frames. The smoke plates have no punched holes.
- The web font subset for Chinese covers the 3,755 most common characters. A rarer character, such as 隼 in the demo team name 红隼, falls back to a system font in the OBS pages.
- `overlays/iscc-overlay.css` is a copy of the page's HUD stylesheet. A change to one must be made in the other.

## Rebuilding

```bash
python3 tools/build_kit.py
```

```bash
python3 tools/build.py --fonts
```

The first regenerates logos, fonts, tokens, plates and ornaments. The second reassembles `index.html` from `src/`.
