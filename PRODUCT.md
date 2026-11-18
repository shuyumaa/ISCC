# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: single-file static HTML/CSS/JS (no build step) — chosen for a brand design-system showcase that must open directly and be shared as one artifact.

## Users

- Tournament organizers and student broadcast teams of the International Schools CS2 Championships (ISCC), building overlays, posters, and social assets. (inferred from brief)
- Designers/developers implementing the ISCC identity across web, broadcast, and merch. (inferred from brief)

## Product Purpose

A brand design system for "International Schools CS2 Championships" — a Counter-Strike 2 tournament brand for international schools, with the production value and visual drama of a major esports championship (user reference: LoL Championship / Worlds). Success: a coherent identity system someone can lift tokens, type, components, and motion rules from and produce broadcast-grade assets. (purpose confirmed by brief; success criteria inferred)

## Positioning

A scholastic world championship: international-school prestige (crests, seasons, nations) fused with CS2 tactical broadcast language (HUD, scorebugs, map vetoes, killfeed). Neither a generic gaming neon brand nor a school athletics badge alone. (inferred)

## Operating Context

Assets ship to: stream overlays (scorebug, lower thirds, stingers), event key art, team cards, brackets, social posts, merch. Dark arena/broadcast viewing scene dominates. (inferred)

## Capabilities and Constraints

- Deliverable is a VISUAL CONCEPT presentation (user correction: the interactive brand-lab version was rejected as "too AI"; simplicity is key). Behance-case-study style, like the LoL Worlds 2025 Championship Visual Concept reference.
- Must include a finished color theme and a usable mark system. The logo itself is designed by the user with an image-generation model (user decision; it supersedes the logo A/B/C pick). The system ships a logo slot instead: one CSS variable feeds every placement on the page, OBS overlays take `logo=<url>`, After Effects templates read one replaceable precomp, and the Mark plate loads a file (keying and trimming opaque image-model output) and carries a copyable brief. The final mark must still be exported as pure-path SVG (no text, font-family or currentColor). Three provisional directions exist only as kit files.
- A production kit exists in `kit/`: logos (provisional), fonts, tokens, rendered plates, ornaments, an A4 landscape promotion poster (both arenas, print PDF and PNG), eleven OBS browser-source overlays driven by URL parameters and `ISCC.update`, and After Effects builder scripts for 62 template comps. The AE builders have been validated against a mock runtime only and are unverified inside After Effects.
- Bilingual EN/Chinese throughout (user request): premium literary Chinese slogan in the LoL Worlds register (百炼成徽, couplet 金杯为证,万国同场), polished English copy, header language toggle with persistence; Chinese logotype and seal ship as outlined pure-path SVG like every other mark.
- Finish language and dual arena (user request): color beams, metallic textures, and glass in the LoL Worlds / buck.co register; less prose, more visual specimens; a persisted light theme alongside the dark arena. Beams/metal/glass are presentation finishes — downloadable marks stay flat pure-path SVG.
- No real teams, schools, results, or sponsors exist yet; demonstration content must be authored concept material (fictional teams Kestrels and Lanterns, a fictional map), labelled concept, and free of Valve or other third-party IP.

## Brand Commitments

- Name: International Schools CS2 Championships (ISCC) / 国际学校CS2锦标赛. (confirmed)
- Reference pinned by user: "like LOL Championship" — major-esports championship prestige and broadcast drama. (confirmed)
- User wants the result to feel crafted, not generic-AI ("load impeccable so it becomes less AI"). (confirmed)
- Chinese copy must read 高级 (elevated, literary) in the Worlds slogan tradition; English copy equally polished. (confirmed)

## Evidence on Hand

- No final logo: it is pending from the user's image-model work. Three provisional directions and a placeholder crosshair exist in `kit/logos/` only.
- No photography, no real match data, no real teams or schools, no event dates (the poster reads "Dates TBC"), no sponsor list.
- Authored evidence on hand: the concept page (`index.html`), the kit (`kit/`), and broadcast research with adopted rules (`docs/broadcast-research.md`, secondary sources only; HUD dimensions are ISCC's own, not measurements of any broadcaster).
- Future work must not fabricate claims of real events or partners.

## Product Principles

1. Championship first: every element should survive on a grand-final broadcast frame.
2. Scholastic identity is the differentiator — schools, nations, seasons, crests — never generic esports neon alone.
3. The system is usable: tokens, scales, and components are copyable/exportable, not just pretty pictures.
4. Ideas stay plural until the organizer picks: present distinct directions, not one safe compromise.