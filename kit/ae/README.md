# ISCC After Effects template kit

ExtendScript (`.jsx`) that **builds** the complete ISCC broadcast template project inside After Effects: transitions, lower thirds, in-game HUD, full screens, ads and social, and reusable ornament elements. Everything is built from native shape layers, text layers, expressions and precomps, so it is fully editable afterwards. No `.aep` / `.mogrt` is shipped; you generate them (see Export).

> **Validation status.** These scripts were validated against a **mock After Effects runtime** (`node tools/ae_mock/run.js`), not inside After Effects. The mock enforces the documented match names, value shapes, keyframe-ease arity, enums and ES3-only syntax, and it parses every expression, but it cannot prove rendering. **On the first real run, enable Preferences > Scripting & Expressions > "Enable JavaScript Debugger", run `ISCC_Build_All.jsx`, and report any error dialog (message + line).**

## 1. Install

1. **Install the fonts** in `kit/fonts/ttf/` (system install, restart After Effects): Big Shoulders Display Black + ExtraBold, Archivo Regular + SemiBold + Bold, Noto Serif SC Black, Noto Sans SC Regular + SemiBold. They are addressed by PostScript name. The library reads `kit/fonts/postscript-names.json` automatically; the defaults live in `ISCC.CFG.fonts` at the top of `ISCC_Lib.jsxinc` if you need to change one.
2. Keep the folder layout (`kit/ae`, `kit/plates`, `kit/logos`, `kit/fonts`). The scripts look for `../plates/*.png` and `../logos/**/mark-gold-2048*.png` relative to the script. Missing files are fine: every import is wrapped in try/catch and falls back to a labelled placeholder plate and the four-bar crosshair-gap placeholder mark (22x70 bars on a 240 grid).
3. In After Effects, open a **new empty project** and choose File > Scripts > Run Script File... > `kit/ae/ISCC_Build_All.jsx`.
4. The build runs as one undo group (Cmd/Ctrl+Z removes everything) and ends with an alert summarising how many comps were built. Expect a minute or two for the first run: roughly 60 comps, 1,300 layers.

Each family also runs on its own: `ISCC_Transitions.jsx`, `ISCC_LowerThirds.jsx`, `ISCC_InGame.jsx`, `ISCC_FullScreens.jsx`, `ISCC_Ads.jsx`, `ISCC_Elements.jsx` (each `#include`s `ISCC_Lib.jsxinc`). Run a family twice and you get duplicate comps; use a fresh project.

Expressions require the **JavaScript expression engine** (Project Settings > Expressions; the default since CC 2019). The tabular timers and the exact easing use function declarations inside expressions.

## 2. The things you will actually change

| I want to... | Do this |
|---|---|
| **Swap the logo once** | Open the precomp `LOGO (replace me)` (folder `00 CONTROL`). Drop your mark above the placeholder, disable layer `PLACEHOLDER MARK`. Every template references this one precomp. If `kit/logos/**/mark-gold-2048*.png` exists it is imported into it automatically (the `placeholder` folder is preferred). |
| **Change teams / names / scores** | Text layers are normal editable text (also exposed in Essential Graphics). Scores, clocks, health, money, bomb time, countdowns and veto states are **Slider controls on the `CONTROL` null** of each comp (Effect Controls). |
| **Switch language** | On the comp's `CONTROL` null tick `Lang CN` to show the 中文 layers and hide the EN layers (every `... EN` / `... CN` pair is switched by expression on opacity; keyframed fades keep working). |
| **Side colour (CT / T)** | `Side Colour` colour control on `CONTROL`: Legacy Blue (CT) or Cup Gold (T). Slabs, bars and band fills are expression-linked to it. In-game comps also have `Team A Colour` / `Team B Colour`. |
| **Change fps** | Edit `ISCC.CFG.fps = 60;` in `ISCC_Build_All.jsx` (60, 50 or 30). Frame-based staggers (2-4 frames) follow it. |
| **Change fonts** | `ISCC.CFG.fonts` in `ISCC_Lib.jsxinc`, or `kit/fonts/postscript-names.json`. |
| **Change easing** | `ISCC.CFG.easeOutInfluence` (16) / `easeInInfluence` (70) = cubic-bezier(.16,1,.3,1) as KeyframeEase. `ISCC.exprEase()` is the exact-curve expression version (binary-solves the bezier). |

## 3. Brand rules baked in

Palette only: Cup Gold #C9A44C, Gold Light #E4CF9A, Legacy Blue #15294E (lit #4868A4), Arena Black #0B0D10 (stage #07090D), Parchment #EFE9DA, Engraving Silver #9AA3B2. Square corners only, no drop shadows, no glow effects; depth by tone, 2 px hairlines and light bands. One easing everywhere (expo-out). Entrances 0.5-1.1 s, exits 0.3-0.45 s, 2-4 frame stagger, diagonal bands at 18 degrees. Display type Big Shoulders Display Black/ExtraBold, body Archivo SemiBold uppercase tracked 200-260, Chinese Noto Serif SC Black / Noto Sans SC. Demo data is fictional: KESTRELS (KES, CT) vs LANTERNS (LAN, T). No real schools, teams, sponsors, Valve/CS2 marks or weapon art. The sponsor strip is explicitly a placeholder.

Every comp contains: a `CONTROL` null, guide layers (`GUIDE action-safe 93%`, `GUIDE title-safe 90%`), comp markers (`IN`, `HOLD`, `CUT` where relevant, `OUT`) and an authored in and out animation. Comps are named `ISCC_<Family>_<Name>` where Family is `Trans`, `LT`, `InGame`, `Full`, `Ad`, `Social`, `Elem`.

## 4. Comps

Alpha = transparent background (no background solid), ready to overlay. "no" = has its own `STAGE` background.

| Comp | Size | Dur (s) | Alpha | Purpose | Controls |
|---|---|---|---|---|---|
| `ISCC_Elem_Beam_Band_Blue` | 1920×1080 | 4 | yes | Loopable diagonal light-beam band, blue (from the left). | Side Colour; loop with loopOut (seamless at 4 s) |
| `ISCC_Elem_Beam_Band_Gold` | 1920×1080 | 4 | yes | Loopable diagonal light-beam band, gold (from the right). | Side Colour; loop with loopOut (seamless at 4 s) |
| `ISCC_Elem_Tracer_Single` | 1920×1080 | 1.6 | yes | Single bullet tracer: bright head, fading tail via three trimmed strokes, impact ring. | Edit path vertices / colours; Side Colour |
| `ISCC_Elem_Utility_Arc` | 1920×1080 | 2.6 | yes | Grenade utility arc: dotted parabola trims in, landing ring scales in. | Edit arc end points (shape path); Side Colour |
| `ISCC_Elem_Spray_Column_Fire` | 1920×1080 | 4 | yes | Spray-pattern dot column: 30 dots firing in sequence (2 f apart), scaled 4x. | Edit dot colour / scale in the spray builder |
| `ISCC_Elem_Crosshair_Gap_Idle` | 1920×1080 | 4 | yes | Four-bar crosshair with a breathing gap, seamless 4 s loop. | Progress slider unused; edit bar colour |
| `ISCC_Elem_Grain_Overlay` | 1920×1080 | 10 | yes | Film-grain overlay: fractal-noise solid, Overlay blend, 7 % opacity. Drop above any scene. | Opacity / Contrast / Scale on layer GRAIN |
| `ISCC_Elem_Crop_Marks` | 1920×1080 | 5 | yes | Crop marks, margin frame and centre ticks (hairlines, 2 px). | Edit margin in the builder |
| `ISCC_Elem_Ratio_Bar_70_20_10` | 1920×1080 | 5 | yes | Brand proportion bar: 70 Arena Black / 20 Legacy Blue / 10 Cup Gold. | Lang CN |
| `ISCC_Elem_Timer_Digits` | 1920×1080 | 60 | yes | Tabular timer: five fixed cells (mm:ss) counting down from slider Seconds. | Slider Seconds (start value, default 60); edit colour |
| `ISCC_Trans_Stinger_CT` | 1920×1080 | 2.2 | yes | Diagonal beam-band stinger, CT blue from the left; fully covers at CUT (1.0 s), logo rides the band. | Side Colour (band tint); Lang CN; logo = LOGO precomp |
| `ISCC_Trans_Stinger_T` | 1920×1080 | 2.2 | yes | Diagonal beam-band stinger, T gold from the right; fully covers at CUT (1.0 s), logo rides the band. | Side Colour (band tint); Lang CN; logo = LOGO precomp |
| `ISCC_Trans_Stinger_Neutral` | 1920×1080 | 2.2 | yes | Neutral stinger (blue from left, gold light from right); full cover at CUT (1.0 s). | Side Colour (band tint); Lang CN; logo = LOGO precomp |
| `ISCC_Trans_Stinger_Tracer` | 1920×1080 | 1.8 | yes | Four bullet-tracer streaks slash across, the last one wipes the frame (CUT 0.85 s). | Side Colour (edge light); Lang CN |
| `ISCC_Trans_Stinger_Smoke` | 1920×1080 | 2.4 | yes | Soft-edged matte wipe: Fractal Noise luma matte drives brightness up (cover) and down (clear). CUT 1.1 s. | Lang CN; edit noise: Contrast / Evolution on SMOKE MATTE layers |
| `ISCC_Trans_Wipe_Left` | 1920×1080 | 1.5 | yes | Simple band wipe travelling right-to-left (cut 0.78 s). | Side Colour (lead band); Lang CN |
| `ISCC_Trans_Wipe_Right` | 1920×1080 | 1.5 | yes | Simple band wipe travelling left-to-right (cut 0.78 s). | Side Colour (lead band); Lang CN |
| `ISCC_Trans_Replay_In` | 1920×1080 | 1.8 | yes | Replay bumper: REPLAY slab slides in from the left, rewind chevrons, exits right. | Side Colour (accent bar); Lang CN |
| `ISCC_Trans_Replay_Out` | 1920×1080 | 1.8 | yes | Back-to-live bumper: LIVE slab from the right, forward chevrons. | Side Colour (accent bar); Lang CN |
| `ISCC_Trans_RoundWin_CT` | 1920×1080 | 3.6 | yes | ROUND WIN banner for CT (Legacy Blue slab). IN 0, HOLD 0.9, OUT 3.0. | Side Colour; Slider Score A / Score B; Lang CN; edit team text |
| `ISCC_Trans_RoundWin_T` | 1920×1080 | 3.6 | yes | ROUND WIN banner for T (Cup Gold slab). IN 0, HOLD 0.9, OUT 3.0. | Side Colour; Slider Score A / Score B; Lang CN; edit team text |
| `ISCC_Trans_MapChange` | 1920×1080 | 3.2 | yes | Next map slides through the frame; previous map ghosts out. IN 0, HOLD 1.2, OUT 2.6. | Side Colour; edit map names (text layers); Lang CN |
| `ISCC_Trans_Segment_Bumper_2s` | 1920×1080 | 2 | yes | 2 s segment bumper: gold slab, segment title, logo. IN 0, OUT 1.5. | Side Colour; edit SEGMENT text; Lang CN |
| `ISCC_Trans_Logo_Sting_3s` | 1920×1080 | 3 | yes | Crosshair bars converge, the gap opens, the logo resolves, voice line. HOLD 2.2, OUT 2.65. | Lang CN; logo = LOGO precomp |
| `ISCC_LT_Player` | 1920×1080 | 7 | yes | Player lower third: handle, school/role, three stats. IN 0, HOLD 0.9, OUT 6.4. | Side Colour (CT blue / T gold); edit text via Essential Graphics; Lang CN |
| `ISCC_LT_Caster_Single` | 1920×1080 | 6 | yes | Single caster lower third. IN 0, HOLD 0.8, OUT 5.4. | Side Colour; edit text; Lang CN |
| `ISCC_LT_Caster_Duo` | 1920×1080 | 6 | yes | Two casters side by side, shared hairline. IN 0, HOLD 0.9, OUT 5.4. | Side Colour; edit text; Lang CN |
| `ISCC_LT_Title` | 1920×1080 | 6 | yes | Generic two-line title (headline + sub line). IN 0, HOLD 0.9, OUT 5.4. | Side Colour; edit text; Lang CN |
| `ISCC_LT_Topic_Bar` | 1920×1080 | 8 | yes | Analyst-desk topic bar, full width. IN 0, HOLD 0.8, OUT 7.4. | Side Colour (label slab); edit topic text; Lang CN |
| `ISCC_LT_Social_Handle` | 1920×1080 | 5 | yes | Social handle tag (platform placeholder). IN 0, HOLD 0.7, OUT 4.5. | Side Colour; edit handle; Lang CN |
| `ISCC_InGame_Scorebug` | 1920×1080 | 12 | yes | Top-centre scorebug: team slabs, scores, round, clock, map line. IN 0, HOLD 0.9, OUT 11.3. | Sliders: Score A / Score B / Round / Seconds (clock); Team A/B Colour; Lang CN |
| `ISCC_InGame_Bomb_Timer_Bar` | 1920×1080 | 44 | yes | Bomb timer: 40 s drain bar (slider-driven), tick marks, last-5 s blink. IN 0, HOLD 0.8, OUT 41.5. | Slider Seconds Left (keyed 40 > 0; override by hand); Side Colour |
| `ISCC_InGame_Killfeed_Row` | 1920×1080 | 6 | yes | One killfeed row: killer, tracer glyph, victim, headshot square. IN 0, HOLD 0.6, OUT 5.2. | Side Colour (killer team); edit handles |
| `ISCC_InGame_Player_Row_CT` | 1920×1080 | 8 | yes | Player row (CT): slot, handle, health bar + number, money. Health slider 0-100 (0 = dead). IN 0, OUT 7.4. | Sliders: Health / Money / Slot; Side Colour; edit handle |
| `ISCC_InGame_Player_Row_T` | 1920×1080 | 8 | yes | Player row (T): slot, handle, health bar + number, money. Health slider 0-100 (0 = dead). IN 0, OUT 7.4. | Sliders: Health / Money / Slot; Side Colour; edit handle |
| `ISCC_InGame_Economy_Panel` | 1920×1080 | 8 | yes | Economy panel: bank per team and loss-bonus pips. IN 0, HOLD 0.9, OUT 7.4. | Sliders: Bank A / Bank B / Loss A / Loss B (0-5); Team A/B Colour; Lang CN |
| `ISCC_InGame_Round_History_24` | 1920×1080 | 8 | yes | 24 round pips (MR12), two rows, halftime gap. Two slider bit-masks: bit n set = that team won round n+1. IN 0, OUT 7.4. | Sliders: History A / History B (24-bit masks, e.g. 5460 = alternate rounds); Team A/B Colour; Lang CN |
| `ISCC_InGame_Map_Veto_Strip` | 1920×1080 | 10 | yes | Seven-cell veto strip. Cell sliders: 0 open, 1 ban A, 2 ban B, 3 pick A, 4 pick B, 5 decider. IN 0, OUT 9.4. | Sliders Cell 1..7; Team A/B Colour; edit map names; Lang CN |
| `ISCC_InGame_Series_Score_BO3` | 1920×1080 | 6 | yes | Best-of-three series score: two rows with win pips. IN 0, OUT 5.4. | Sliders Wins A / Wins B (0-2); Team A/B Colour; Lang CN |
| `ISCC_InGame_Focus_Player_Panel` | 1920×1080 | 8 | yes | Observed-player panel: handle, K/A/D, health bar. IN 0, HOLD 0.8, OUT 7.4. | Sliders: Health / Kills / Assists / Deaths; Side Colour; edit handle; Lang CN |
| `ISCC_Full_Matchup_VS` | 1920×1080 | 10 | no | Matchup screen KES vs LAN: names, schools, BO3, map, date/venue slot. IN 0, HOLD 1.4, OUT 9.5. | Team A/B Colour; edit text; Lang CN |
| `ISCC_Full_Starting_Soon` | 1920×1080 | 20 | no | Pre-show screen with live countdown (digits cells). Slider Seconds = start value. IN 0, OUT 19.5. | Slider Seconds (start value, default 300); Lang CN |
| `ISCC_Full_Be_Right_Back` | 1920×1080 | 12 | no | Break screen. IN 0, OUT 11.5. | Side Colour; Lang CN |
| `ISCC_Full_Tech_Pause` | 1920×1080 | 12 | no | Technical pause card with elapsed counter. IN 0, OUT 11.5. | Slider Seconds (elapsed offset); Lang CN |
| `ISCC_Full_Up_Next_Schedule` | 1920×1080 | 14 | no | Schedule: five rows (time, match, stage, status). IN 0, OUT 13.5. | Edit rows; Lang CN |
| `ISCC_Full_Bracket_8` | 1920×1080 | 14 | no | 8-team single elimination bracket: quarter, semi, final, champion. Text slots are editable. IN 0, OUT 13.5. | Team A/B Colour; edit slots; Lang CN |
| `ISCC_Full_Map_Veto_Full` | 1920×1080 | 14 | no | Full-screen veto: seven map cards + log. Cell sliders: 0 open, 1 ban A, 2 ban B, 3 pick A, 4 pick B, 5 decider. IN 0, OUT 13.5. | Sliders Cell 1..7; Team A/B Colour; Lang CN |
| `ISCC_Full_Player_Card` | 1920×1080 | 10 | no | Player card: portrait placeholder solid, handle, bio, 6-stat grid. IN 0, OUT 9.5. | Side Colour; edit text; Lang CN |
| `ISCC_Full_MVP_Card` | 1920×1080 | 10 | no | MVP card: giant MVP, portrait placeholder, rating and key stats. IN 0, OUT 9.5. | Side Colour; edit text; Lang CN |
| `ISCC_Full_Stat_Compare` | 1920×1080 | 10 | no | Head-to-head bars driven by sliders A1-A4 / B1-B4 (0-100). IN 0, OUT 9.5. | Sliders A1..A4, B1..B4; Team A/B Colour; Lang CN |
| `ISCC_Full_Results_Card` | 1920×1080 | 10 | no | Final result: series score and per-map results. IN 0, OUT 9.5. | Sliders Score A / Score B; Team A/B Colour; Lang CN |
| `ISCC_Full_Thanks_GG` | 1920×1080 | 8 | no | End card: 百炼成徽, thank-you line, voice line, logo. IN 0, OUT 7.5. | Side Colour; Lang CN |
| `ISCC_Ad_Promo_15s_16x9` | 1920×1080 | 15 | no | 15 s promo 16:9: beams plate, 百炼成徽 glyph-by-glyph clip rise, voice line, title, date/venue slot, logo end card. HOLD 13.4, OUT 14.6. | Side Colour; Lang CN; logo = LOGO precomp; edit date/venue slot |
| `ISCC_Ad_Promo_15s_9x16` | 1080×1920 | 15 | no | 15 s promo 9:16 (1080x1920): same sequence re-laid for vertical. | Side Colour; Lang CN; logo = LOGO precomp; edit date/venue slot |
| `ISCC_Ad_Promo_15s_1x1` | 1080×1080 | 15 | no | 15 s promo 1:1 (1080x1080): same sequence re-laid for square. | Side Colour; Lang CN; logo = LOGO precomp; edit date/venue slot |
| `ISCC_Ad_EndCard_5s_16x9` | 1920×1080 | 5 | no | 5 s end card: logo, voice line, date/venue slot, beams. HOLD 1.2, OUT 4.5. | Side Colour; Lang CN; edit date/venue |
| `ISCC_Ad_EndCard_5s_9x16` | 1080×1920 | 5 | no | 5 s end card: logo, voice line, date/venue slot, beams. HOLD 1.2, OUT 4.5. | Side Colour; Lang CN; edit date/venue |
| `ISCC_Ad_EndCard_5s_1x1` | 1080×1080 | 5 | no | 5 s end card: logo, voice line, date/venue slot, beams. HOLD 1.2, OUT 4.5. | Side Colour; Lang CN; edit date/venue |
| `ISCC_Social_MatchResult_1x1` | 1080×1080 | 6 | no | Match result post 1:1: score, teams, map line. HOLD 1.0, OUT 5.4. | Sliders Score A / Score B; Team A/B Colour; Lang CN |
| `ISCC_Social_Lineup_4x5` | 1080×1350 | 6 | no | Lineup post 4:5 (1080x1350): five players. HOLD 1.0, OUT 5.4. | Side Colour; edit handles; Lang CN |
| `ISCC_Social_Countdown_Story_9x16` | 1080×1920 | 10 | no | Story countdown 9:16: days-to-go number from slider Days; keeps clear of story UI zones (top 250 / bottom 340 px). HOLD 1.2, OUT 9.4. | Slider Days; Side Colour; Lang CN |
| `ISCC_Ad_Sponsor_Strip_Placeholder` | 1920×1080 | 8 | yes | Partner strip with five clearly labelled PLACEHOLDER slots (no sponsors invented). Drop logos over the slots. IN 0, HOLD 1.0, OUT 7.4. | Side Colour; Lang CN |

Common controls on every comp (`CONTROL` null): `Side Colour`, `Progress` (reserved), `Lang CN`.

## 5. Export

* **Stingers / transitions / lower thirds / HUD (alpha):** add the comp to the Render Queue (Composition > Add to Render Queue), Output Module: **QuickTime, Apple ProRes 4444** (Channels: RGB + Alpha, Depth: Millions of Colors+), or **PNG Sequence** with RGB + Alpha. Switchers that key on alpha (vMix, OBS, CasparCG, Ross, Tricaster) take ProRes 4444 / PNG sequence. The transitions mark the **CUT** frame with a comp marker: set the switcher's transition point to that time.
* **Full screens / ads (opaque):** H.264 for social, ProRes 422 HQ for broadcast. Vertical and square ads are already 1080x1920 and 1080x1080 (4:5 is 1080x1350).
* **Loops:** `Elem_Beam_Band_*`, `Elem_Crosshair_Gap_Idle` are seamless at 4 s.
* **Frame rate:** comps are built at the configured fps; render at the same rate.

### Motion Graphics Templates (.mogrt)

Key text and colour properties are already added to Essential Graphics (guarded; AE 15.1+). To publish: open the comp, Window > Essential Graphics, check the properties listed, then **Export Motion Graphics Template...** (to Local Drive or Creative Cloud). A comp's `Side Colour` and `Lang CN` are exposed first, then up to 12 text layers (max 14 properties per comp; add more by hand). Text driven by sliders/expressions (scores, clocks) is controlled through the `CONTROL` sliders: drag those into Essential Graphics yourself if you need them in Premiere.

## 6. Requirements and API notes

* Target **After Effects 2022 (22.0)+**. Written to also run on 2020 (17.x) where noted below.
* `Layer.setTrackMatte()` is **AE 23.0+**; the scripts use it when present and fall back to `trackMatteType` (matte layer moved directly above, then hidden) on 22 and earlier. The mock test runs both paths.
* `CompItem.markerProperty`, `addToMotionGraphicsTemplateAs` (15.1+), `canAddToMotionGraphicsTemplate`, `openInEssentialGraphics`, `motionGraphicsTemplateName` are all guarded with `typeof` / try-catch; if absent the comps still build.
* ES3 only (no `let/const`, arrow functions, template strings, `Array.map/forEach`, `JSON`); enforced by the test.

### Not verified against documentation or a real After Effects

* Fractal Noise parameters (`Contrast`, `Scale`, `Evolution`, `Brightness`) are looked up by **English display name**: the docs list effect match names but not their parameter match names. A localised AE would fail here (Grain_Overlay, Stinger_Smoke).
* Adding dashes to a stroke through `ADBE Vector Stroke Dashes` > `addProperty("ADBE Vector Stroke Dash 1" / "Gap 1")` (match names verified, add behaviour assumed).
* `setTemporalEaseAtKey` array arity: 1 element for Position (spatial), 3 for Scale, 1 for scalars. The helper retries with one element if the first call throws; a failure is logged, not fatal.
* That assigning `layer.parent` does not shift the child (children are parented while the parent is at rest).
* Text: `TextDocument.autoLeading` / `leading` / `tracking` / `resetCharStyle` behaviour on all supported versions.
* Essential Graphics: AE may refuse some properties (expression-driven text); refusals are skipped silently.
* `$.fileName` inside `#include`d files resolving to the running script (used to find `../plates`, `../logos`, `../fonts`).

## 7. Re-running the acceptance test

`cd tools/ae_mock && npm install && node run.js` (needs Node 18+ and the `acorn` package). It executes every builder against the mock, in several scenarios (assets missing, AE 22 + fake assets, real `kit/plates` + `kit/logos` on disk, and each of the six family scripts standalone), and fails on any thrown error, unknown match name, non-ES3 syntax, unparsable expression, expression that references a missing layer/effect, off-palette colour, font not in `ISCC.CFG.fonts`, keyframe past a comp's end, zero-layer comp, missing IN/OUT marker, or fewer than 45 comps.
