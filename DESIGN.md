---
name: ISCC — International Schools CS2 Championships
description: One cup, every nation — a school championship shown as a broadcast, in five hues, two arenas and two tongues, with CT blue and T gold on opposite sides of everything.
colors:
  cup-gold: "#C9A44C"
  gold-light: "#E4CF9A"
  legacy-blue: "#15294E"
  ct-lit: "#4868A4"
  arena-black: "#0B0D10"
  beam-stage: "#07090D"
  parchment: "#EFE9DA"
  engraving-silver: "#9AA3B2"
  hairline-gold: "rgba(201,164,76,.28)"
  plate-edge: "rgba(154,163,178,.16)"
  glass-dark: "rgba(11,13,16,.62)"
  glass-edge-dark: "rgba(239,233,218,.16)"
  porcelain: "#F2EEE3"
  porcelain-plate: "#FAF7EF"
  porcelain-stage: "#E9E1CD"
  ink: "#14161C"
  ink-muted: "#5B6470"
  ink-gold: "#7A5D22"
  hairline-gold-light: "rgba(122,93,34,.35)"
  plate-edge-light: "rgba(20,22,28,.14)"
  glass-light: "rgba(250,247,239,.68)"
  glass-edge-light: "rgba(20,22,28,.12)"
typography:
  display:
    fontFamily: "'Big Shoulders Display', sans-serif"
    fontSize: "clamp(44px, min(6.6vw, 11.4vh), 96px)"
    fontWeight: 900
    lineHeight: 0.9
    letterSpacing: "0.01em"
  cn-display:
    fontFamily: "'Noto Serif SC', serif"
    fontSize: "0.8em"
    fontWeight: 900
    lineHeight: 1.125
    letterSpacing: "0.06em"
  slogan:
    fontFamily: "'Noto Serif SC', serif"
    fontSize: "clamp(64px, 13.2vw, 236px)"
    fontWeight: 900
    lineHeight: 1
  headline:
    fontFamily: "'Big Shoulders Display', sans-serif"
    fontSize: "clamp(28px, 3.2vw, 46px)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.04em"
  lead:
    fontFamily: "'Archivo', sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "'Archivo', sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  cn-body:
    fontFamily: "'Noto Sans SC', sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: "'Archivo', sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.24em"
    fontFeature: "tnum"
rounded:
  plate: "0px"
  glass: "14px"
spacing:
  gutter: "clamp(16px, 4vw, 56px)"
  xs: "8px"
  sm: "14px"
  md: "22px"
  lg: "28px"
  xl: "44px"
  plate-top: "92px"
  bar: "60px"
  hud-margin: "48px"
components:
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.cup-gold}"
    typography: "{typography.label}"
    rounded: "{rounded.plate}"
    padding: "0 16px"
    height: "40px"
  button-ghost-hover:
    backgroundColor: "{colors.cup-gold}"
    textColor: "{colors.arena-black}"
  button-ghost-active:
    backgroundColor: "{colors.gold-light}"
    textColor: "{colors.arena-black}"
  button-solid:
    backgroundColor: "{colors.cup-gold}"
    textColor: "{colors.arena-black}"
    typography: "{typography.label}"
    rounded: "{rounded.plate}"
    padding: "0 16px"
    height: "40px"
  button-solid-hover:
    backgroundColor: "{colors.gold-light}"
    textColor: "{colors.arena-black}"
  button-square:
    backgroundColor: "transparent"
    textColor: "{colors.cup-gold}"
    rounded: "{rounded.plate}"
    width: "40px"
    height: "40px"
  nav-bar:
    backgroundColor: "{colors.arena-black}"
    textColor: "{colors.parchment}"
    height: "60px"
    padding: "0 clamp(16px, 4vw, 56px)"
  radar:
    backgroundColor: "{colors.beam-stage}"
    textColor: "{colors.parchment}"
    rounded: "{rounded.plate}"
    width: "264px"
  glass-ticket:
    backgroundColor: "{colors.glass-dark}"
    textColor: "{colors.parchment}"
    rounded: "{rounded.glass}"
    padding: "26px 28px 24px"
    width: "340px"
  swatch:
    backgroundColor: "{colors.arena-black}"
    textColor: "{colors.parchment}"
    rounded: "{rounded.plate}"
    padding: "22px"
  toast:
    backgroundColor: "{colors.parchment}"
    textColor: "{colors.arena-black}"
    typography: "{typography.label}"
    rounded: "{rounded.plate}"
    padding: "12px 22px"
  hud-scoreboard:
    backgroundColor: "{colors.arena-black}"
    textColor: "{colors.parchment}"
    rounded: "{rounded.plate}"
    width: "1020px"
    height: "70px"
  poster:
    backgroundColor: "{colors.beam-stage}"
    textColor: "{colors.parchment}"
    rounded: "{rounded.plate}"
---

# Design System: ISCC — International Schools CS2 Championships

## Overview

**Creative North Star: "The Broadcast, Not the Style Guide"**

The championship is shown the way a viewer meets it: on air. Light, smoke, metal and a live observer HUD carry the argument, and the tokens, marks and overlays are what you lift off the frame afterwards. The page is ten plates, each sized to one viewport on desktop, each a single screenshot: cover, mark, light, smoke, metal, live, color, type, posters, footer. Prose is one line per plate. The specimens are the case.

Counter-Strike supplies the grammar and the school championship supplies the dignity. The two brand hues are the two sides: **CT is Legacy Blue, T is Cup Gold**, everywhere two things oppose (beams, scoreboard halves, player rails, stinger bands, poster rails, veto cells). Smoke is the glass material. A grenade lineup diagram and an authored spray pattern are the ornament. An authored fictional tactical map is the section navigator. The crosshair, four bars and a gap, is the construction of the mark: whatever the final logo is, it lives in the gap.

The system runs in two arenas (dark Arena Black, light Porcelain) and two tongues (EN, 中文), both persisted and applied before first paint. The five hues never change between arenas; only ground, ink, secondary ink and the text-safe gold swap. Everything is invented concept material and says so.

**Key Characteristics:**

- Five hues at 70/20/10 (arena / depth / metal); CT blue and T gold as the two sides of every opposition.
- Rendered materials, not CSS diagrams: WebGL god-ray beams, WebGL light-marched smoke, a raymarched cup in four finishes, reeded and moss glass through SVG displacement, zero-mean film grain under everything.
- Square plates; glass alone is rounded (14px).
- No drop shadows: depth is light, tone and material.
- Headings left-set, never under a kicker; one centred line, the cover slogan, split by the cup.
- One easing, `cubic-bezier(.16,1,.3,1)`; reduced motion yields static final frames, never blank ones.
- A logo slot instead of a logo: one CSS variable feeds every placement until the user's own mark arrives.

## Colors

Five brand hues taken from the cup and the arena at night, one lit tint of the CT blue for light and side markers, and a fixed pair of ground/ink sets for the two arenas. No sixth hue enters a composition.

### Primary

- **Cup Gold** (`cup-gold`): the metal and the T side. Logo slot fill, rules, solid buttons, hover fills, arc lines, spray dots, T rails, bomb bar, the season reversal (gold veto poster, gold arena test). Held to about 10% of a composition.
- **Gold Light** (`gold-light`): the metal catching light. Solid-button hover and active state, tracer glow, the arc's flying head. Never a field, except its own swatch.

### Secondary

- **Legacy Blue** (`legacy-blue`): the arena at depth and the CT side. The 20% plate, the team poster, the blue-steel finish, the CT field in the arena test, the lead stinger band, CT side marker in the light arena.
- **CT Lit** (`ct-lit`): Legacy Blue as light. Beam shafts from the left, CT side markers and player rails in the dark arena, the trailing stinger band. A tint of the second hue, not a sixth.

### Neutral

- **Arena Black** (`arena-black`): dark-arena ground and plate, the 70% field. Slightly cool, never pure black.
- **Beam Stage** (`beam-stage`): the deeper black behind every rendered plate (cover, rig, smoke, mark stage, radar, key poster).
- **Parchment** (`parchment`): dark-arena ink; warm off-white, never pure white.
- **Engraving Silver** (`engraving-silver`): dark-arena secondary ink: labels, captions, hex values, dead-player names.
- **Porcelain / Porcelain Plate / Porcelain Stage** (`porcelain`, `porcelain-plate`, `porcelain-stage`): light-arena ground, raised plate, and rendered-plate stage.
- **Ink / Ink Muted** (`ink`, `ink-muted`): light-arena primary and secondary ink.
- **Ink Gold** (`ink-gold`): the text-safe gold of the light arena. Cup Gold stays the graphic metal; Ink Gold carries gold words on Porcelain.
- **Hairlines and edges** (`hairline-gold`, `plate-edge` and their light pairs): 1px boundaries. Gold hairline on buttons and the radar; silver edge on plates, bar and rules.
- **Glass** (`glass-dark`, `glass-light` with their edges): the smoke-glass field over rendered light.

### Named Rules

**The Two Sides Rule.** Where two things oppose, blue is CT and sits left or first; gold is T and sits right or second. Beams come blue from the left and gold from the right; rails, scoreboard halves and stinger bands follow. Side is never told by colour alone: position, monogram letter and tag text travel with it.

**The Five Hue Rule.** Only the five hues and their tints. CT Lit, the arena grounds and the hairlines are light and ground, not new hues. A sixth hue is a new identity.

**The No Red, No Green Rule.** The HUD never uses red or green. Loss is shown by emptiness: a dead player's bar empties and turns hollow, the name drops to secondary ink and stays legible, never dimmed by opacity.

**The Two Arenas Rule.** The theme switch swaps ground, plate, stage, ink, secondary ink, text-safe gold, hairlines and glass only. Artwork keeps fixed inks in both arenas: the arena-test tiles, the swatches, the posters, the 70/20/10 plate.

## Typography

**Display Font:** Big Shoulders Display (embedded subset, 700–900).
**Body Font:** Archivo (embedded subset, 400–700).
**Chinese Display Font:** Noto Serif SC 900 (embedded subset).
**Chinese Body Font:** Noto Sans SC 400/600 (embedded subset).

**Character:** Broadcast gothic beside heavy Song. The condensed gothic shouts the way a scorebug does; the Song gives the Chinese line the literary weight of a championship slogan. All four families are SIL OFL and ship offline.

### Hierarchy

- **Slogan** (Noto Serif SC 900, clamp(64px, 13.2vw, 236px), 1): 百炼成徽 on the cover only, split in two by the cup.
- **Display** (900, clamp(44px, min(6.6vw, 11.4vh), 96px), 0.9, uppercase, 0.01em): one plate heading each, two short lines, `text-wrap: balance`.
- **CN Display** (Noto Serif SC 900, 0.8em of the display, 1.125, 0.06em): the 中文 state of every heading.
- **Specimen type** (900, viewport-sized up to 400–760px): GRAND FINAL, 万国同场, the ISCC fragment, the cropped 26, GG. Type as a graphic object, `aria-hidden`.
- **Headline** (800, clamp(28px, 3.2vw, 46px), uppercase, 0.04em): finish names, swatch names, ticket map name.
- **Lead / Body** (Archivo 400, 17px/1.6 and 15px/1.6; Noto Sans SC 400 at 16–18px/1.8): one line per plate, max 46ch for leads.
- **Label** (Archivo 600, 11px, 0.24em, uppercase, tabular numerals): buttons, captions, readouts, radar labels, poster lines. Chinese labels keep tracking at 0.14–0.3em in Noto Sans SC.

### Named Rules

**The Tracked Caps Rule.** Micro-text is Archivo 600 at an 11px floor, uppercase, tracked 0.16–0.26em, in secondary ink or gold. The HUD scales its micro label but clamps it with `max(11px, …)`.

**The Fixed Digits Rule.** Digits that change sit in fixed-width boxes: tabular Archivo for readouts and hex, fixed `.56em` digit cells for Big Shoulders scores and clocks (the face has no tabular figures). Nothing moves when a number ticks.

**The Two Tongues Rule.** Every string exists in English and Chinese, swapped by one toggle with no layout shift; Chinese HUD labels sit in fixed-height nowrap boxes. The cover slogan, couplet and 金杯为证 stay Chinese in both states; "Earn your crest." stays English in both.

## Layout

Ten full-bleed plates in one scroll, each sized to one viewport at 901px and wider (`100svh` minus the 60px bar; plates open 92px from their top). The page gutter is `clamp(16px, 4vw, 56px)`. Compositions are asymmetric two-column splits (mark 1.12/0.88, smoke 4/8, metal 7/5) and full-bleed stages (cover, rig, ratio plate, type specimens); none is a centred heading over an equal grid. The color plate is the ratio itself: a 70 / 20 / 10 column split of Arena Black, Legacy Blue and Cup Gold. The posters plate is a four-up wall with staggered drops (0, 8%, 20%, 32%). The live plate fits a 16:9 HUD frame to the viewport height with the heading and kit list beneath it.

Below 900px, splits stack, the poster wall becomes a horizontal snap strip at 78vw per poster, the lineup diagram and moss pane drop out, and the HUD switches tier. The HUD frame is authored at 1920 with a 48px margin on an 8px grid and scales by one design pixel (`--p`) through three tiers: L 1920, M 1280, S 480 (4:5 portrait).

Spray rules separate the mark from the light, and the type from the posters: 30 authored dots that fire on scroll.

## Elevation & Depth

No drop shadows anywhere. Depth is rendered light, tonal stages and materials, and the only `box-shadow` values in the build are 1px inset hairlines and the glass's inset top/bottom edge light.

- **Beams** (WebGL): blue shafts from the left, gold from the right, converging on the cup low-centre; drifting haze and dust. The pointer steers the rig and the readout reports ±13°; a click flashes the rig with a 700ms cooldown. In the dark arena light adds onto Beam Stage; in the light arena light multiplies onto Porcelain, and where shafts overlap the paper lifts to a pale core instead of burning to white.
- **Smoke** (WebGL): drifting fbm volume, light-marched toward a key light, punched open by tracer fire. Tracers follow the authored spray pattern from a 30-round magazine at 96ms per round, reloading after 1.4s; each hit opens a hole with a ring that heals.
- **Cup** (WebGL): raymarched lathe form on a transparent canvas in four finishes: polished and brushed Cup Gold, black chrome, blue steel. The pointer turns it on the metal plate.
- **Glass**: smoke-glass field (`glass-*`) with `backdrop-filter` through SVG displacement: reeded (`#reed`, vertical flutes plus a 7px rib overlay) and moss (`#moss`). A noise layer and an inset edge highlight; it lifts 6px on hover.
- **Grain**: zero-mean film grain in every shader, plus a fixed fractal-noise overlay beneath all content.
- **Fallback**: without WebGL, beam and smoke hosts paint conic and radial gradients in the same hues on the stage token.

### Named Rules

**The Flat Plate Rule.** A surface declares its boundary once: a 1px hairline, a tonal stage, or its own material light. Lift is motion (6px), never a shadow.

**The Light Behind Ink Rule.** Light sits behind reading text. Smoke may sit over artwork (the 金杯为证 specimen, the map, display type under the smoke plate), never over reading text; readouts that sit on rendered plates (round counter, cover foot, gap dimension) carry a solid stage ground.

## Shapes

Square corners (0px) on plates, stages, buttons, bar, radar, toast, swatches, HUD panels and posters. **Glass alone is rounded at 14px**, because frost is a material, not a plate. Circles appear only as authored geometry: construction rings, landing rings, ripple ellipses, T markers on the map. Hairlines are 1px. Side markers are 22×5px bars; spray dots are 5px squares; radar pins are 8px squares that rotate 45° when current. The crosshair (four bars, a 236-unit gap on a 600-unit field) is the master geometry for the mark plate and the slot's default glyph.

## Components

### Buttons

Engraved, not inflated.

- **Shape:** square (0px), 40px tall, 1px gold hairline border.
- **Ghost (default):** transparent, Cup Gold (Ink Gold in the light arena) label in tracked caps, 15px stroke icon left with a 10px gap.
- **Hover / Active:** fills with Cup Gold and Arena Black label; active shifts to Gold Light. 0.3s on the system ease.
- **Solid:** Cup Gold field, Arena Black label; hover Gold Light. Used once per plate at most (Load your logo).
- **Square:** 40×40 for the arena toggle, showing the current arena's sun or moon.
- **Focus:** 2px Cup Gold outline at 3px offset, everywhere.
- **Icons:** stroke SVG at 1.8 width, square caps. Never glyphs.

### Navigation

- **Bar:** fixed, 60px, ground at 72% with a 14px blur, 1px edge rule below. Left: logo slot at 22px, ISCC in display 26px, a tracked context label behind a 1px divider. Right: Map, arena and language buttons. Below 560px the map button collapses to a square and the context label hides.
- **Radar:** the Map button opens an authored tactical map (264px square, Beam Stage field, gold hairline border) with a pin per plate, labelled in both tongues. It wipes open by clip-path, closes on outside click or Escape, and the current plate's pin turns gold and rotates. A jump plays the page stinger.

### Logo Slot

- One CSS variable, `--logo`, on `body`; every `.logo-slot` placement masks `currentColor` through it, so the mark takes each placement's ink. The default is the four-bar crosshair. Placements: bar, mark stage (36%), four arena-test tiles, 16/32/64 ladder, key, team, veto and CN posters, footer, the HUD scoreboard centre, and every OBS overlay.

### Swatch

- A flat block of the hue itself with the name in headline type, the Chinese name, a tabular hex and a ratio tag; click copies the hex and toasts. Hover grows the bottom padding (or the flex share in the neutral row) instead of lifting.

### Finish List

- Four ruled rows (Polished, Brushed, Black chrome, Blue steel) in headline type with a tracked caption; the pressed row turns gold and indents 18px. Drives the cup's finish.

### Glass Ticket

- 14px reeded glass over the smoke plate: GRAND FINAL label, MR12 in 92px display, ATRIUM 中庭, and the ticket number behind a glass-edge rule.

### Observer HUD (signature)

- A stack of single-purpose graphics on a 16:9 frame over the tactical map: scoreboard (team halves with side rule, monogram, tag, score; centre logo slot; tab with map-win pips, clock and state label; 24-pip round history), CT and T player rows on the left and right edges, radar, killfeed (max 5, rows expire), focus panel, bomb and defuse bars, freeze-time economy and veto strip, lower third, round-win banner and stinger.
- A deterministic 20s loop derived from elapsed time: freeze, live, kills, plant at 9.5s, defuse, round win, reset. The shell enters once, then persists; motion only marks change; exits run faster than entrances.
- Reduced motion paints one static mid-round frame.

### Poster

- 3:4 plates sized in container units: key art (rendered beams, logo slot, vertical 百炼成徽, GRAND FINAL 26), team (Legacy Blue, ghosted KES tag, spray texture, roster), veto (the gold reversal; bans struck, picks plain, decider ruled), CN (Arena Black, lineup arc, vertical couplet). Fixed inks in both arenas.

### Toast

- Ink-on-ground inversion, tracked caps, fixed bottom centre; rises 16px and holds 1.8s. The single confirmation surface.

### Motion

- **Cover entrance:** per-glyph clip rise on 百炼成徽 (1.1s, staggered 0.25–0.67s), a 1.6s slide on the cropped 26, a 0.9s wipe on "Earn your crest." at 1s.
- **Page stinger:** four diagonal bands at −18° (Legacy Blue, Cup Gold, a parchment sliver, a CT Lit sliver) cross the screen in 0.95–1.1s on navigator jumps; the scroll happens under the bands at 260ms.
- **Scroll-drawn:** the lineup arc draws with tick marks and a flying head, the bounce and landing ring appear on arrival; spray rules fire dot by dot; the type specimens slide against each other by 9%.
- **Easing:** `cubic-bezier(.16,1,.3,1)` for everything.
- **Reduced motion:** all animation and transition off, the stinger removed, arcs and sprays shown complete, shaders render a static frame, the rig caption reads "Static frame".

## Logo Brief

The final mark is designed by the user with an image-generation model. The system ships the slot, not the mark. Three provisional directions (A Face-off, B The Crest, C Counterlight) exist only as kit files in `kit/logos/` and are not part of the system.

### Slot contract

- **Accepted files:** SVG, PNG, WebP, JPEG, loaded with the Mark plate's button or by drop onto the mark stage.
- **Keying:** if all four corners are opaque, the corner colour is averaged and every pixel's alpha is set from its distance to that colour, so an image model's flat background drops out. Files that already carry transparency are left as they are.
- **Trimming:** the visible shape is cropped to its bounds (alpha above 24/255), centred on a square, and stored as a PNG at up to 512px.
- **Storage and reset:** saved in `localStorage` (`iscc-logo`) and restored on load; Reset returns the crosshair. An empty file is refused with a toast.
- **Rendering:** the image is a mask. Only its silhouette is used; each placement fills it with its own ink (Cup Gold on the stage, black on the reversal, parchment on CT blue). A mark that depends on internal colour will not survive the slot.
- **Elsewhere:** OBS overlays take `logo=<url>`; After Effects templates reference the precomp `LOGO (replace me)`.

### Prompt shipped on the Mark plate

> Flat vector emblem for a school esports championship. One solid shape, one colour: gold #C9A44C on black #0B0D10. Idea: a crosshair of four bars whose centre gap holds a trophy cup. Heavy condensed geometry, optical curves, visible stroke contrast. No gradients, no lettering, no 3D, no shadows, no weapons, no game logos. Legible at 16 px. Square canvas, centred, wide margin.

### Craft bar for the final mark

- **Optical overshoot:** round and pointed forms run past the bar edges so they read the same size as the flats.
- **Stroke contrast:** visible thick–thin contrast, consistent in direction, matching the condensed gothic.
- **Ink traps:** cut into tight joins so they stay open at small sizes.
- **Export:** redraw the image-model output as pure-path SVG: no `<text>`, no `font-family`, no `currentColor`, no embedded raster, one fill.
- **Tests:** 16, 32 and 96px on all four fields: Arena Black, Porcelain, the Cup Gold reversal and the CT Legacy Blue field. The Mark plate shows the four fields and a 16/32/64 ladder.

## Distribution: the Kit

`kit/` lets people make ISCC material without opening the concept page. Everything in it is concept material.

- **logos/:** the three provisional directions and the placeholder crosshair as pure-path SVG and PNG, plus a sheet.
- **fonts/:** the four OFL families as TTF and woff2 with one stylesheet.
- **tokens/:** colour, type, spacing and motion tokens as CSS, JSON and SCSS; `.ase` and `.gpl` swatches.
- **plates/:** 4K rendered beam plates in both arenas and three ratios, transparent smoke plates, transparent cup renders in the four finishes.
- **ornaments/:** spray, utility arcs, tactical map, crop marks, grain tile, 70/20/10 bar.
- **poster/:** the A4 landscape promotion poster in both arenas (HTML with an editable date, print PDF with and without 3mm bleed, 300dpi PNG), baked from `kit/poster/a4-landscape.src.html` by `tools/poster_build.py`.
- **overlays/:** eleven transparent 1920×1080 OBS browser-source pages driven by URL parameters and `ISCC.update`, reading the same tokens as the page HUD.
- **ae/:** ExtendScript builders for 62 After Effects template comps. They have been validated against a mock runtime only, not inside After Effects.

Broadcast rules adopted for the HUD and overlays are in `docs/broadcast-research.md`.

### A4 poster composition

- Rendered rays converge on the cup at the centre and fade into the floor (mask 58–84% of the height).
- The cup stands on a liquid floor at 161mm: its mirrored reflection (turbulence-displaced, 0.36 opacity in the dark arena, 0.22 in the light), five ripple rings and a thin sheen line.
- CT and T rails, 2.2mm, at the left and right edges; a ghost 26 behind at about 5% ink.
- Reduced copy, nothing else: the name (EN plus 国际学校CS2锦标赛) top left; 百炼 | 成徽 split by an 88mm gap that the cup fills; "Earn your crest." bottom left in gold; one date line bottom right (Grand Final 总决赛 over the date); a single fine-print Valve disclaimer.

## Do's and Don'ts

### Do:

- **Do** keep the 70/20/10 ratio: Arena Black field, Legacy Blue depth, Cup Gold at about 10%.
- **Do** put CT blue on the left or first and T gold on the right or second, and back colour with position, monogram and tag.
- **Do** show loss by emptiness: hollow bars, secondary ink, legible names.
- **Do** keep light behind reading ink; smoke may cover artwork, never reading text.
- **Do** set labels at an 11px floor in tracked Archivo caps with tabular figures.
- **Do** run every motion on `cubic-bezier(.16,1,.3,1)` and give reduced motion a complete static frame.
- **Do** route every logo placement through the slot (`--logo`, `.logo-slot`, `logo=`, the AE precomp).
- **Do** label everything concept and invent every team, school, player, map and result.

### Don't:

- **Don't** add a sixth hue, red or green in the HUD, gradient text, or a drop shadow.
- **Don't** round anything except glass (14px).
- **Don't** place a kicker or eyebrow above a heading, or write "N things, one thing" headlines in either language.
- **Don't** centre plate headings over equal grids; headings are left-set.
- **Don't** use Valve or other third-party IP: no game logos, weapons, skins, agents or map art.
- **Don't** set the mark or logotype in a font, or ship it with text, `font-family` or `currentColor`.
