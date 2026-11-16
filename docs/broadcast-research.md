# ISCC broadcast graphics: research notes and adopted rules

Scope: conventions for esports broadcast graphics (CS2 observer HUD, LoL Esports packages) learned
from public sources, translated into the ISCC identity. Nobody's identity is copied: no logos,
colours, wordmarks, artwork or weapon silhouettes from Valve, BLAST, Riot or any vendor are used.

## Honesty note on sources

Public material is thin. BLAST and Riot do not publish their on-air HUD specifications; what exists is
vendor and agency write-ups. Pixel and percentage figures below marked **(ISCC)** are our own
proportions, chosen to be consistent with the conventions described by those sources and tested at
1920x1080; they are not measurements of any broadcaster's package. Figures from a source are cited.

## Five-line summary

1. A CS2 broadcast HUD is a stack of single-purpose graphics (top scorebug, side player panels,
   radar, killfeed, bomb state, round history, economy, lower thirds), not one big widget.
2. The score, round timer, bomb state, health and alive state outrank all decoration; secondary stats
   (ADR, deep economy, K/D) belong in freeze time, replays or separate graphics.
3. The centre of the frame, especially around the crosshair, stays clear; motion is reserved for
   change (plants, kills, round wins), never an always-on pulse.
4. LoL Esports packages are built as modular systems (a hero mark builds the grid, team colours and
   logos swap late, vendors get templates and guidelines) with a language-specific type pairing.
5. Consistency across overlays comes from a shared grid, one type scale, one motion curve and a
   token layer that every overlay reads; this is what ISCC's `kit/overlays` does.

## Sources

- LHM, "How to Design a CS2 Tournament HUD": https://lhm.gg/blog/how-to-design-cs2-tournament-hud
- LHM, professional CS2 broadcast HUD feature page: https://lhm.gg/features/ultra-hud/cs2
- BLAST.tv, Fall Final 2023 innovations (graphics refresh, prediction overlay, "evolution not
  revolution", energetic palette, powerful motion language): https://blast.tv/article/blast-fall-final-2023-innovations
- Studio Dumbar / DEPT, LoL MSI 24 identity (bold type, "Aberration" motion element, guidelines and
  templates for outside vendors): https://studiodumbar.com/work/msi-24
- Tendril, Riot Worlds 2022 toolkit (hero mark builds the grid, colours/logos swappable late,
  "reconfiguration" motion behaviour): https://www.stashmedia.tv/tendril-ramps-up-riot-worlds-2022-with-branding-toolkit/
- Koto, LoL APAC (LCP): lane-based modular system, language-specific type (Latin plus CJK), revised
  look-alike characters for legibility, countdown sequences: https://gamesbeat.com/how-koto-created-a-new-brand-for-league-of-legends-tournaments-in-asia-pacific/
- wTVision, Riot Brazil circuit case study (lower thirds, tickers, wipes, live data feed rendered into
  a received graphic package): https://www.wtvision.com/files/case_studies/riot_games_en.pdf
- Title-safe reference: 5% of height margin (54 px at 1920x1080) used by a brand system, with a
  graphic-safe and a narrower type-safe area: https://brand-qa2.canadiantire.ca/en/ctr/design-system/omni-channel/motion/margins-and-safe-space.html
- Full-frame overlays authored at 1920x1080: https://support.socialive.us/support/solutions/articles/67000696654-creating-graphic-overlays-to-enhance-and-brand-recorded-content
- SVG, "Designing the Modern Scorebug" (trend toward cleaner, more minimal scorebugs): https://www.sportsvideo.org/2026/06/09/designing-the-modern-scorebug-how-broadcast-graphics-teams-are-rethinking-the-most-important-element-on-screen/

ESL and PGL publish no overlay specifications that we could find; none are cited.

## Component anatomy (relative to 1920x1080)

Frame margin: 48 px (4.4% of height, inside the 5% title-safe guidance) on every edge. **(ISCC)**

| Component | Placement | Size (ISCC) | Notes |
|---|---|---|---|
| Scoreboard | top centre, 1040 wide | bar 64 px tall; centre tab 34 px; history strip 6 px bars | Score is the anchor; team plate, tag, name, round score; series and clock in the tab. Per LHM the score sits top-centre and CT/T must be told apart by more than colour (we use position plus monogram letter plus tag). |
| Player rows | left edge (CT) and right edge (T), 360 x 58 px, 6 px gap | health number 28 px, handle 20 px, micro 15 px | Source warns against cramming every stat into one strip; we keep two lines and drop K/D and utility below 1100 px. Edge stacks keep the bottom and centre free for the focus panel. Dead state must be obvious: hollow bar, collapsed tone. |
| Focus panel | bottom centre, 640 x 112 | health 64 px display, ammo 28 px | One observed player; large health and armor, ammo, round-kill pips. |
| Radar | top-left, 288 square | label strip 24 px | Optional per LHM; kept small, hairline frame, host injects the SVG. |
| Killfeed | top-right, 400 wide rows 38 px, max 5 | 20 px names | Shows only what changed; rows expire. |
| Bomb / defuse | scoreboard lower edge, 3 px bars | tab clock turns to bomb readout | Viewers must tell carried / planted / defusing; bomb bar and defuse bar are separate marks. |
| Round history | under the tab, 24 pips in two halves | 16 x 6 px | MR12 halves with a divider. |
| Economy | under the history, freeze time only | 600 wide | Deep stats shown only when nothing else is happening. |
| Map veto recap | bottom centre, freeze time only | 7 cells 148 x 64 | Ban cells hollow, picks filled, decider gold-edged. |
| Lower third | bottom left, 560 x 150 | name 54 px display | A few seconds, mid-round; stays out of the centre. |
| Round-win banner + stinger | stinger band 6-34% of height, banner beneath | tag 22% of frame height | Band at -18 degrees with thinner trailing bands; score updates after the band clears the scoreboard. |

Type scale (three sizes): display 64/46/34 (Big Shoulders, fixed-width digit boxes because it has no
tabular figures), body 20, micro 15 px at 1920 (Archivo 600 uppercase, tracked .24em; 11 px floor).

## Motion conventions

- Reserve motion for change (LHM): plants, kills, deaths, round end. The always-on HUD does not pulse.
- One easing, `cubic-bezier(.16,1,.3,1)`; entrances 500-700 ms, exits 200-420 ms (exits faster).
- A single outward entrance when the frame first appears (scoreboard drops, rails slide in from their
  edges), then the shell persists; only round state resets between rounds.
- Round-win: band sweeps in, holds for the winner tag, exits; only then does the score change.

## Rules ISCC adopts

1. One graphic, one job; compose the HUD from independent overlays (also what OBS needs).
2. Hierarchy: score, clock/bomb state, health, alive state first; everything else smaller or freeze-only.
3. Keep the centre clear: nothing floating in the middle 40% x 50% of the frame outside events.
4. 48 px margins on a 1920x1080 canvas; everything is on an 8 px baseline grid.
5. CT/T distinguished by more than colour: side, monogram letter, tag text and marker shape.
6. Three type sizes per overlay; data in Archivo tnum or fixed-width digit boxes, never in display type
   with proportional figures.
7. Dead players: hollow bar and neutral ink, name stays at 4.5:1 or better; never red, never dimmed by opacity.
8. Motion only on change; exits faster than entrances; one easing curve.
9. Deep stats (economy, veto, K/D) in freeze time or on separate graphics.
10. Late-binding identity: team names, tags, colours and scores come from parameters, not artwork
    (Tendril's swappable colours/logos; our URL parameters and `ISCC.update`).
11. Language-specific type: Chinese in Noto Serif/Sans SC in fixed-height nowrap boxes so switching
    language moves nothing (Koto's Latin + CJK pairing).
12. Tokens are the single source of colour and type for every overlay (templates plus guidelines for
    vendors, per Studio Dumbar).
13. Weapons are text class tags and kill icons are abstract glyphs: no weapon or character art.
14. Test at 1080p and 720p and over a busy backdrop (LHM): our overlays are checked on a checkerboard.
15. Stingers cross the scoreboard only at round end and state changes happen after the band clears.
