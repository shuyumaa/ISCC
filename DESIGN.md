---
name: ISCC — International Schools CS2 Championships
description: One cup, every nation — a championship identity in one metal and five colors, presented as plates under broadcast light, in two arenas.
colors:
  cup-gold: "#C9A44C"
  gold-light: "#E4CF9A"
  legacy-blue: "#15294E"
  arena-black: "#0B0D10"
  parchment: "#EFE9DA"
  engraving-silver: "#9AA3B2"
  hairline-gold: "rgba(201,164,76,.28)"
  plate-edge: "rgba(154,163,178,.16)"
  arena-deep: "#0E1420"
  arena-deep-2: "#101A2E"
  beam-stage: "#07090D"
  porcelain: "#F2EEE3"
  porcelain-plate: "#FAF7EF"
  porcelain-deep: "#E5DCC4"
  porcelain-deep-2: "#D9DFEA"
  porcelain-stage: "#E9E1CD"
  ink: "#14161C"
  ink-mut: "#5B6470"
  ink-gold: "#7A5D22"
  glass-dark: "rgba(11,13,16,.62)"
  glass-light: "rgba(250,247,239,.68)"
  glass-edge-dark: "rgba(239,233,218,.16)"
  glass-edge-light: "rgba(20,22,28,.12)"
typography:
  display:
    fontFamily: "'Big Shoulders Display', sans-serif"
    fontSize: "clamp(38px, 5.4vw, 68px)"
    fontWeight: 900
    lineHeight: 0.98
    letterSpacing: "0.02em"
  headline:
    fontFamily: "'Big Shoulders Display', sans-serif"
    fontSize: "24px"
    fontWeight: 800
    letterSpacing: "0.08em"
  lead:
    fontFamily: "'Archivo', sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.7
  body:
    fontFamily: "'Archivo', sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'Archivo', sans-serif"
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0.22em"
  cn-display:
    fontFamily: "'Noto Serif SC', serif"
    fontSize: "clamp(38px, 5.4vw, 68px)"
    fontWeight: 900
    lineHeight: 1.16
    letterSpacing: "0.08em"
  cn-body:
    fontFamily: "'Noto Sans SC', sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.95
rounded:
  plate: "0px"
  glass: "14px"
spacing:
  xs: "10px"
  sm: "14px"
  md: "26px"
  lg: "48px"
  section: "104px"
components:
  button-solid:
    backgroundColor: "{colors.cup-gold}"
    textColor: "{colors.arena-black}"
    rounded: "{rounded.plate}"
    padding: "10px 16px"
  button-solid-hover:
    backgroundColor: "{colors.gold-light}"
    textColor: "{colors.arena-black}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.cup-gold}"
    rounded: "{rounded.plate}"
    padding: "10px 16px"
  button-ghost-hover:
    backgroundColor: "{colors.cup-gold}"
    textColor: "{colors.arena-black}"
  swatch-meta:
    backgroundColor: "{colors.arena-black}"
    textColor: "{colors.parchment}"
    padding: "16px 16px 18px"
  toast:
    backgroundColor: "{colors.parchment}"
    textColor: "{colors.arena-black}"
    padding: "12px 22px"
  lang-toggle:
    backgroundColor: "transparent"
    textColor: "{colors.cup-gold}"
    rounded: "{rounded.plate}"
    padding: "10px 16px"
  glass-card:
    backgroundColor: "{colors.glass-dark}"
    textColor: "{colors.parchment}"
    rounded: "{rounded.glass}"
    padding: "28px"
---

# Design System: ISCC — International Schools CS2 Championships

## Overview

**Creative North Star: "The Museum Plate, Relit"**

The identity is still a trophy in a case — but the case now sits under broadcast light. The plate discipline survives (one object, one hairline, generous air, engraved label), and three finishes are added on top of it, in the language of a championship key art and a motion-design studio: **beams** (rigged light that converges on the cup), **metal** (the cup's gold rendered as four physical finishes), and **glass** (frosted overlay panels floating over light). Nothing is decorated for its own sake: every beam, sheen, and frost layer is a specimen of how the brand will look on air, on foil, and on a stream overlay.

The world is derived from the Summoner's Cup discipline of LoL Worlds — one core object (a school championship cup whose bowl is a crosshair), a palette taken from the object's metal and the arena around it, custom condensed lettering cut as pure vector paths — and from the finish-forward language of studios like BUCK: saturated light fields, physical materials, kinetic but controlled motion, and type used as a graphic object. Prose is deliberately scarce; the specimens carry the argument.

The system runs in **two arenas**: the dark arena (Arena Black ground, parchment ink) and the light arena (Porcelain ground, Ink black). The five brand hues never change; only the ground, the ink, and the text-safe gold swap. The Chinese slogan 百炼成徽 and the couplet 金杯为证,万国同场 remain the public voice in both arenas and both tongues.

**Key Characteristics:**

- One object, one metal: the crosshair-bowl cup emblem is the only illustration; gold is the only accent hue.
- Three finishes over the plate: beam rigs (screen-blended light in the dark arena, multiply-blended in the light), metal gradients with a travelling specular sweep, and frosted glass with an inner top highlight.
- Plates stay square; glass alone carries a 14px radius, because glass is a material, not a plate.
- Font-independent lettering: eight marks — including the Chinese logotype and the four-character seal — are authored or outlined SVG paths, never typed text.
- Two tongues, one voice: EN/中文 toggle swaps every string; cover, posters, color names, and finish names stay bilingual in both states.
- Two arenas, one geometry: the theme toggle swaps ground/ink tokens only; marks, stages, posters, and grids never move.
- Depth by light and tone, never by drop shadow: beams, tonal stages, and inset hairlines do all the work.

## Colors

Five brand hues taken from the cup and the arena, two hairline tints, and a fixed set of arena/finish tokens for the two themes. No sixth hue ever enters a composition.

### Primary

- **Cup Gold** (#C9A44C): the metal. Emblem, marks on dark stages, rules, solid buttons, the season reversal poster, beam cores. Held to roughly 10% of any composition.
- **Gold Light** (#E4CF9A): the metal catching light. Solid-control hover, emphasized words in display titles on dark, beam specular cores. Never a field color.

### Secondary

- **Legacy Blue** (#15294E): the arena at night. Depth stages, the blue poster, blue steel finish, and the cool beams in every rig.

### Neutral

- **Arena Black** (#0B0D10): dark-arena ground, default mark stage, sheet artboard. Slightly cool, never pure black.
- **Parchment** (#EFE9DA): dark-arena ink and the parchment stage; warm off-white, never pure white.
- **Engraving Silver** (#9AA3B2): dark-arena secondary text, captions, hex values, plate edges at 16%.

### Arena & Finish Tokens

- **Dark arena:** ground Arena Black; plate Arena Black; ink Parchment; secondary Engraving Silver; text-safe gold Cup Gold; hairline rgba(201,164,76,.28); edge rgba(154,163,178,.16); beam stage #07090D; glass field #0E1420 → #101A2E; glass rgba(11,13,16,.62) with edge rgba(239,233,218,.16).
- **Light arena:** ground Porcelain #F2EEE3; plate #FAF7EF; ink #14161C; secondary #5B6470; text-safe gold #7A5D22 (Cup Gold stays the graphic metal); hairline rgba(122,93,34,.35); edge rgba(20,22,28,.14); beam stage #E9E1CD; glass field #E5DCC4 → #D9DFEA; glass rgba(250,247,239,.68) with edge rgba(20,22,28,.12).
- **Beam hues:** gold rgba(201,164,76,.5), blue rgba(72,104,164,.42), silver rgba(154,163,178,.3) in the dark arena; gold rgba(176,138,62,.55), blue rgba(30,58,110,.36), warm silver rgba(140,120,80,.25) in the light. Beams are light, not paint: they blend (screen dark / multiply light) and never carry text.

### Named Rules

**The One Metal Rule.** Gold is metal, not paint: it marks the cup, the lettering, the rules, and the light — never a background field, except the single season reversal where the whole poster becomes the metal.

**The Five Color Rule.** Every composition uses only the five brand hues and their tints. Arena and finish tokens are grounds and light, not new hues; a new hue is a new identity.

**The Two Arenas Rule.** The theme toggle swaps ground, ink, secondary, and text-safe gold only. Mark stages, posters, metal finishes, and the sheet keep their fixed inks in both arenas — they are artwork, not interface.

## Typography

**Display Font:** Big Shoulders Display (variable 700–900 woff2 embedded as base64; ships offline).
**Body Font:** Archivo (variable 400–700 woff2 embedded likewise).
**Chinese Display Font:** Noto Serif SC 900 (subset woff2 embedded, 136 glyphs covering every string on the page).
**Chinese Body Font:** Noto Sans SC 400/600 (subset woff2 embedded likewise).
**Logotype:** custom authored SVG paths on a 100-unit grid; the Chinese logotype and seal are Noto Serif SC 900 glyphs converted to outlines. Not fonts, never substituted by one.

**Character:** broadcast gothic beside museum engraving; in Chinese, heavy Song answers the gothic. With prose cut to a line per section, type now works mostly as specimen: five rows show the two tongues at their true sizes instead of describing them.

### Hierarchy

- **Display** (900, clamp(38px, 5.4vw, 68px), 0.98, uppercase): section titles and poster headlines; the only voice allowed to shout.
- **CN Display** (Noto Serif SC 900, same clamp, 1.16, 0.08em): the ZH state of every display title; poster C and the cover slogan are CN Display in both states.
- **Headline** (800, 24px, uppercase, 0.08em): mark names; ZH sets CN Display at 0.14em.
- **Lead / Body** (Archivo 400, 17/15px): one-line section statements and type specimens only; max 62ch.
- **Label** (600, 11px floor, 0.2–0.4em tracking, uppercase): metadata, captions, buttons, hex values, poster lines, rig readout. Chinese labels keep tracking in Noto Sans SC 600.

### Named Rules

**The Path Lettering Rule.** The ISCC logotype, the "26" numerals, the emblem, the Chinese logotype, and the seal are pure-path SVG with no `<text>`, no font-family, no currentColor dependency in exports.

**The Two Tongues Rule.** Every string exists in English and Chinese; the toggle swaps them with no layout shift in marks, stages, or poster geometry. Cover, posters, color names, and finish names are bilingual in both states.

**The Tracked Caps Rule.** Micro-text is uppercase Archivo 600 at 0.2–0.4em, in silver or gold — engraved, not whispered. Tabular numerals wherever digits align (rig readout, hex, MR12, scale test).

## Layout

A single 1240px column, 24px side padding, sections at 104px vertical. Order: cover → beam rig → metal finishes → glass field → eight marks → color → type → posters → footer. Mark rows are a 1fr/300px grid (stage left, name + actions right); the marks head pairs the title with a 320px construction plate; metal is four plates in a row (two-up below 960px, one below 560px); glass is three cards (one column below 960px); color is five plates (two-up below 960px, one below 560px) plus a 70/20/10 ratio bar; posters are three 3:4 plates (single column below 960px). The cover foot joins the flow below 640px width or 740px height; vertical Chinese flanks appear only at 1200px and wider. The beam stage is 16:7 (4:3 below 560px) and never transfers its min-height into width.

## Elevation & Depth

No drop shadows anywhere. Depth comes from three devices, each a material:

- **Beams:** masked, blended gradient rays converging on the cup at the stage floor; a radial floor glow; a slow ±2° rig drift. The pointer steers the rig (±13°) with a 0.7s damped follow and a live tabular readout.
- **Metal:** multi-stop specular gradients (polished, brushed, black chrome, blue steel) with a 1.1s travelling sheen on hover; brushed grain is a 4px SVG pattern, not a CSS repeating gradient.
- **Glass:** translucent field-color plates with 18px backdrop blur + saturate, a 1px edge, and an inset top highlight — an edge of light, not a shadow.

Plates still lift 4–6px on hover with cubic-bezier(.16,1,.3,1). Scroll reveals remain a 24px slide with no opacity fade, so ink keeps full contrast at every frame. The cover entrance is the one authored opacity sequence. `prefers-reduced-motion` stops drift, sheen travel, and reveals.

### Named Rules

**The Flat Plate Rule.** A surface declares its boundary once — a hairline, a tonal stage, or a material's own light. Lift is motion; it is never a shadow.

**The Light Stays Behind Ink Rule.** Beams, glows, and sheens live in background layers or behind content. No positioned light layer may sit above text; footer and caption plates carry a solid ground so readout text always measures against a token, not against light.

## Shapes

Square corners (0px) for plates, stages, buttons, posters, toast. **Glass alone is rounded at 14px** — the single exception, because frost is a material with a meniscus, not a plate. Circles appear only as authored geometry (bowl, reticle, season ring, palette dots). Hairlines are 1px; the grain overlay is a 140px fractal-noise SVG at 5% in the page background, below all content.

## Components

### Buttons

- Square, 1px hairline border on ghost; solid = Cup Gold field / Arena Black text; hover inverts or shifts to Gold Light. Theme toggle is a 40px square ghost with a 15px stroke sun/moon icon showing the current arena. Focus: 2px gold outline, 3px offset. Icons are stroke SVG, never glyphs.

### Swatch Plate

- Chip with inset hairline edge above a meta plate (ground token): display name, always-visible Chinese name (鎏金 玄黑 藏蓝 素绢 刻银), tabular hex. Click copies hex; hover lifts 4px. No role prose — the ratio bar below carries the proportion rule visually (70 arena / 20 depth / 10 metal).

### Mark Stage

- min-height 300px flat field in one of four fixed tones, 36px air, mark at true proportion; name + SVG/Copy actions beside it, no description prose. Eight stages; the sheet button exports all eight on one 1160×1020 black artboard. Variant row and 16→96px scale test follow.

### Beam Rig

- 16:7 stage in the arena's beam-stage token; five masked rays (gold, blue, silver) converging at bottom center on a 74px cup; floor glow; tracked readout top-right (`RIG / 灯架` + degrees). Pointer steers; leaving resets to 0.0°. Caption row below states the interaction in both tongues.

### Metal Finish Plate

- 4:3.4 field in one of four finishes, mark centered at 46% width in the finish's contrasting ink (black on golds, parchment on chrome/steel); travelling specular sweep on hover; caption row below pairs EN finish name with its Chinese (抛光 拉丝 玄铬 蓝钢) and hue name.

### Glass Card

- 14px radius, glass token field, 18px backdrop blur, 1px glass edge, inset top highlight; three specimens: lockup (emblem + logotype + season line), palette (five dots + hex stack), ticket (GRAND FINAL / MR12 / couplet / seal / admit line). Cards lift 4px on hover. The field behind them drifts its radial light over 26s.

### Navigation

- Fixed 68px glass header (arena header token + 14px blur), hairline bottom rule; gold logotype + tracked context left; theme, language, and sheet actions right. Both toggles persist in localStorage (`iscc-theme`, `iscc-lang`) and swap `body[data-theme]` / `body[data-lang]`, `html[lang]`, title, and the theme-color meta.

### Toast

- Ink-on-ground inversion (parchment/black in dark arena, black/parchment in light), tracked caps, fixed bottom center, rises 16px, holds 1.8s. The system's single confirmation surface.

### Poster Plate

- 3:4, three movements (black arena / gold reversal / legacy blue), fixed inks in both arenas. Eight 10×1px crop legs at 35% of the field's own ink. Poster lines are 11px tracked caps in full-strength ink; poster A carries the couplet under its headline, B swaps language with the toggle, C is Chinese-first.

## Do's and Don'ts

### Do:

- **Do** keep gold at or under 10% of any composition, except the season reversal.
- **Do** ship every mark as pure-path SVG; verify no `<text>`, font-family, or currentColor survives export.
- **Do** keep beams and sheens behind ink, and give any plate that overlaps light a solid ground.
- **Do** set micro-labels at 11px minimum, uppercase, 0.2–0.4em tracked, in silver or gold.
- **Do** honor prefers-reduced-motion for drift, sheen, reveals, and the cover entrance.
- **Do** keep both tongues and both arenas in the same geometry: toggles change tokens and strings, never grids or marks.

### Don't:

- **Don't** add a sixth hue, gradient text, or a drop shadow — depth is light, tone, or material.
- **Don't** round anything except glass (14px); plates, buttons, posters stay square.
- **Don't** set the logotype or numerals in a font, or substitute installed faces for the embedded subsets.
- **Don't** place a kicker above a heading, number sections for decoration, or write prose where a specimen can speak.
- **Don't** state event facts (schools, nations, dates) as truth; the footer labels all content as concept.