# ISCC OBS overlays

Standalone 1920x1080 pages with a transparent background, for OBS Browser Sources. Fictional data only
(KESTRELS / LANTERNS). Shared code: `iscc-overlay.css`, `iscc-overlay.js`. The only external links are
`../tokens/iscc-tokens.css` and `../fonts/iscc-fonts.css` (relative; keep the folder layout of `kit/`).

## OBS setup

1. Add a **Browser** source. Check *Local file* and pick the page (or serve the `kit/` folder and use the URL).
2. Width **1920**, Height **1080**. Leave *Custom CSS* empty: the page already sets `background: transparent`.
3. Append URL parameters after the file name, e.g. `scoreboard.html?ct=KES&cs=7&ts=6&clock=1:55`
   (with *Local file* use the *URL* field instead, `file:///.../scoreboard.html?...`).
4. Enable *Refresh browser when scene becomes active* for entrance animations (lower third, stinger, round win,
   veto): each activation replays the entrance. For always-on pages (scoreboard, rows) leave it off and push changes live.
5. Disable *Shutdown source when not visible* if you push state through `postMessage`/`ISCC.update` (state is kept
   only while the page is loaded).
6. Review outside OBS with `?bg=checker` (mid-grey checkerboard) or `?bg=%23222` (any CSS colour), and `?fit=1` to
   scale the 1920x1080 stage into a smaller browser window.

## Parameters common to every page

| Parameter | Values | Meaning |
|---|---|---|
| `theme` | `dark` (default), `light` | colour theme (`body[data-theme]`) |
| `lang` | `en` (default), `zh` | bilingual labels (`body[data-lang]`) |
| `bg` | `checker`, any CSS colour | review background; omit for real transparency |
| `fit` | `1` | scale the stage to the window |
| `logo` | URL | event mark used by the `logo-slot` mask (default: placeholder cross) |
| `ct`, `t` | tag (3 letters) | team tags, default `KES` / `LAN` (first letter becomes the monogram) |
| `ctName`, `tName` | text | team names (`KESTRELS`, `LANTERNS`); `ctZh`, `tZh` Chinese names (`红隼`, `灯笼`) |
| `ctSchool`, `tSchool` (+`Zh`) | text | school lines (matchup) |
| `cs`, `ts` | integer | round score (default 7 : 6) |
| `ctMaps`, `tMaps`, `bo` | integers | series map wins and best-of (default 1, 0, 3) |
| `round` | integer | round number (default 14) |
| `clock` | `m:ss` | round clock text (default `1:55`) |
| `demo` | `1` | scripted ~20 s show loop (`full-hud.html`, also `scoreboard.html`) |

## Pages

| Page | Parameters (besides the common ones) | Notes |
|---|---|---|
| `scoreboard.html` | `hist` (string of `c`/`t`, up to 24, default `ctccttctcttcc`), `planted=1`, `bomb` (0..1 remaining), `defuse` (0..1), `result` | top centre: team plates, round score, event mark, BO map pips, clock, `MR12 · ROUND n`, 24 history pips. `planted=1` turns the clock gold and shows the draining bomb bar; `defuse` fills the CT bar. |
| `player-rows.html` | none (set through `ISCC.update({players})`) | five rows per team: CT left, T right. Health number and bar, armor tick, class tag, money, K/D, up to 4 utility pips, dead state, observed marker. |
| `killfeed.html` | `ttl` (ms, default 5000) | rows arrive through `ISCC.update({kill:{...}})`; max 5; rows slide in and expire. |
| `lower-third.html` | `name`, `line`, `side` (`ct`, `t`, `cast`), `k`, `d`, `adr`, `dur` (seconds, auto-hide) | stats row is shown only if `k`/`d`/`adr` are given. Example: `?name=ember&line=Northgate%20Academy&side=t&k=17&d=11&adr=81.4`. |
| `map-veto.html` | `veto` = `MAP:type:TAG,...` (`type` = `ban`, `pick`, `decider`), `current` | default: QUAD, ARCHIVE, CLOISTER, ATRIUM, REFECTORY, OBSERVATORY, BOATHOUSE. Ban cards are hollow, picks filled. |
| `round-win.html` | `side` (`ct`/`t`), `round`, `method` (`defused`, `detonated`, `elimination`, `time`), `winner`, `dur` | banner under the scoreboard position. |
| `stinger.html` | `side` (`ct`/`t`), `autoplay=1`, `loop=1` | parallelogram band at -18 degrees, four thinner trailing bands, winner tag in huge caps; ~2.2 s. Nothing is drawn until it plays. Trigger live with `ISCC.update({stinger:{side:'t'}})`. |
| `matchup.html` | `title`, `titleZh`, `stage`, `stageZh`, `when` (`19:00`), `map`, `mapZh` | full-screen TEAM vs TEAM. |
| `starting-soon.html` | `mins` / `secs`, or `until` (ISO date or epoch ms), `title`, `when` | countdown with a draining hairline bar; default 5:00 if no time is given. |
| `break.html` | `mins` / `secs` or `until`, `stage`, `when` | intermission with "back in" timer and up-next card. |
| `full-hud.html` | `demo=1` | radar frame, scoreboard, killfeed, rows, focus panel, freeze-time economy and veto strip, lower third, banner, stinger. Without `demo` it renders a static mid-round frame and waits for `ISCC.update`. |

## Live updates

Every page exposes a global and listens for `postMessage`:

```js
window.ISCC.update({ cs: 8, ts: 6, clock: '1:12', round: 15 });
window.postMessage({ iscc: { planted: true, bomb: 0.62, clock: '0:25' } }, '*');
```

`update(patch)` merges the patch into the state and re-renders. Keys:

| Key | Type | Effect |
|---|---|---|
| any common parameter (`ct`, `ctName`, `cs`, `ts`, `round`, `clock`, `ctMaps`, `theme`, `lang`, ...) | as in the table | persistent state |
| `planted`, `bomb`, `defuse` | bool, 0..1, 0..1 | bomb readout and the two thin bars |
| `result` | `null`, string or `{en, zh}` | label after the round is decided (replaces "BOMB PLANTED") |
| `hist` | string | round history, `c` = CT-side team won, `t` = T-side team won |
| `players` | `{ct:[...], t:[...]}` | each player `{name, hp, armor, wpn, money, k, d, util (0-4), obs}`; `hp <= 0` = dead |
| `focus` | `{name, side, hp, armor, mag, res, kills}` | focused-player panel (`full-hud`) |
| `kill` | `{a, as, v, vs, mods:['hs','smoke','flash'], wpn}` | one-off event: add a killfeed row |
| `lowerThird` | `{name, line, side, k, d, adr}` or `null` | show / hide the lower third |
| `roundWin` | `{side, method, round, winner}` or `null` | show / hide the banner |
| `stinger` | `{side, tag}` or `true` | one-off event: play the stinger |
| `veto` | `[{map, type, by}]`, `current` | map veto |
| `eco` | `{m:[ct,t], e:[ct,t], loss:[n,n]}` or `null` | freeze-time economy (and veto strip, in `full-hud`) |

All user-supplied strings (URL parameters, `update` payloads) are written with `textContent`; markup in them is
shown literally, never parsed.

Weapon text is a class tag (`RIFLE`, `SNIPER`, `SMG`, `PISTOL`, `SHOTGUN`); kill icons are abstract glyphs
(bar, four ticks for headshot, cloud for through-smoke, burst for flash-assist).

## Notes

- Fonts and tokens come from `../fonts/iscc-fonts.css` and `../tokens/iscc-tokens.css`. The Chinese font subset is
  GB2312 level 1; the glyph for 隼 (in the default `红隼`) is not in that subset, so supply `ctZh` with covered
  characters or extend the subset.
- `prefers-reduced-motion: reduce` removes entrance animations.
- `iscc-overlay.css` is generated from `src/hud.css` (1920 tier) plus an overlay section at the end; the overlay
  runtime is separate from `src/hud.js` and is driven by state, not by elapsed time (except `demo=1`).
