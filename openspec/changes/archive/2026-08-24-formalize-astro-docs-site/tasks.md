# Tasks: Formalize the Astro Documentation Site

This is a retroactive conformance checklist, not an implementation plan. The site already exists,
builds, and checks clean. Each task confirms one spec requirement against its cited
`file:line` evidence and states the check that proves it. No task modifies source.

## Verification Provenance

A checked box in this file does not mean every task was proven the same way. Three evidence classes
back this checklist and they are **not** interchangeable. Read this table before trusting a checkmark.

| Class | Tasks | How it was proven | Reproducible without a human? |
|-------|-------|-------------------|-------------------------------|
| Runtime (automated) | 1.1, 1.2 | `npm run check` and `npm run build` executed; both exited clean | Yes |
| Static trace | 2.1–2.4, 3.1, 3.2, 4.1, 4.4, 4.5, 5.1, 5.4–5.6, 6.2, 6.3 | Cited `file:line` read and compared against the requirement text | Yes |
| Manual browser QA | 3.3–3.7, 4.2, 4.3, 5.2, 5.3 | Exercised in a browser against `npm run preview` and attested as passing by maintainer `ElCaaarnal` on 2026-08-24 | **No** |

The nine manual-QA tasks rest on a maintainer's attestation, not on a machine-checkable artifact.
No automated test covers them, so a future change can regress any of them silently. An attempt to
prove them via the Chrome DevTools Protocol was made and abandoned; it produced no evidence and
none of its output backs any checkmark here.

Visual parity was originally listed here as task 6.1 and has been **removed from this change's
scope**, not silently satisfied. It cannot be established in this tree: no saved reference
screenshots exist to diff against — `public/` contains only `banner.png`. Closing it requires
first creating a reference baseline, which adds binary artifacts and redefines the requirement
from "compare against the prototype" to "establish a baseline". That is a separate decision with
its own scope, tracked as the follow-up change `establish-visual-regression-baseline`.

An unsatisfiable task must not gate a contract. Removing it is a scope correction, authorized by
maintainer `ElCaaarnal` on 2026-08-24; it is not evidence that visual parity holds.

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 0 code lines; this file ~100 markdown lines |
| 400-line budget risk | High (cumulative artifact volume; proposal+4 specs+design already ~402 lines) |
| Chained PRs recommended | No — `size:exception` already accepted by the maintainer for this change |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Land proposal + 4 specs + design + tasks as one retroactive contract | PR 1 (size:exception) | `npm run check` | `npm run build` then `npm run preview`; no visual diff available — reference screenshots at 1440x1000/768x1000 no longer exist in this tree | Delete `openspec/changes/formalize-astro-docs-site/`; no source file touched |

## Phase 1: Build Baseline

- [x] 1.1 Run `npm run check`; confirm zero type errors (tsconfig.json:2, package.json:7-10).
- [x] 1.2 Run `npm run build`; confirm static output completes without error.

## Phase 2: docs-site-shell Conformance

- [x] 2.1 Static Single-Route Composition — `src/pages/index.astro:1-20`, only file under `src/pages/`. Check: read file; confirm layout+chrome+sidebar+content order.
- [x] 2.2 Document Head Metadata — `src/layouts/BaseLayout.astro:14-22`. Check: read lines; confirm charset, viewport, title/description props, color-scheme, Open Graph.
- [x] 2.3 External Font and Diagram Script Loading — `src/layouts/BaseLayout.astro:23-26`. Check: read lines; confirm Google Fonts stylesheet + Mermaid CDN script tag.
- [x] 2.4 Strict TypeScript Build — `tsconfig.json:2`, `package.json:7-10`. Check: confirm `astro/tsconfigs/strict` extended and `check`/`build` scripts present.

## Phase 3: docs-navigation Conformance

- [x] 3.1 Sidebar Section List — `src/components/Sidebar.astro:9-51`. Check: read lines; confirm 8 grouped labels, 33 anchor links.
- [x] 3.2 Heading Anchor Generation — `src/scripts/site.js:28-47`. Check: read lines; confirm slugify + numeric-suffix collision handling.
- [x] 3.3 Contextual Sub-Navigation — `src/scripts/site.js:49-69,254-282`, `global.css:291-295`. Check: `npm run preview`; scroll into a subsectioned `h2`, confirm its sub-nav is the only one visible. [manual QA]
- [x] 3.4 Active Section Highlight (Scrollspy) — `src/scripts/site.js:244-292,304-308`. Check: `npm run preview`; scroll fast and slow, confirm `aria-current` tracks without lag. [manual QA]
- [x] 3.5 Sidebar Auto-Scroll With User Override — `src/scripts/site.js:249-252,284-291`. Check: `npm run preview`; scroll page vs. hover sidebar, confirm auto-scroll suppresses on direct interaction. [manual QA]
- [x] 3.6 Mobile Drawer Navigation — `src/scripts/site.js:311-316`, `InterfaceChrome.astro:2-9`, `global.css:407-415`. Check: narrow viewport in `npm run preview`; open via menu, close via scrim/link. [manual QA]
- [x] 3.7 Scroll Progress and Back-to-Top — `src/scripts/site.js:294-309`. Check: `npm run preview`; scroll page, confirm progress width and back-to-top visibility/behavior. [manual QA]

## Phase 4: docs-search Conformance

- [x] 4.1 Runtime Search Index From Rendered Content — `src/scripts/site.js:85-103`. Check: read lines; confirm index built from DOM `h2`/`h3` at load, not a static file.
- [x] 4.2 Accent-Insensitive Matching — `src/scripts/site.js:28-34,122-135`. Check: `npm run preview`; search "instalacion", confirm "Instalación" section matches. [manual QA]
- [x] 4.3 Keyboard-Driven Search Overlay — `src/scripts/site.js:106-195`, `InterfaceChrome.astro:5-21`, `Sidebar.astro:4-8`. Check: `npm run preview`; open via `/` and Ctrl/Cmd+K, confirm arrow/Tab/Enter/Escape behavior. [manual QA]
- [x] 4.4 Ranked, Snippeted Results — `src/scripts/site.js:122-135,111-121,149`. Check: query matching one title and one body-only section; confirm title ranks first and body result shows highlighted snippet.
- [x] 4.5 No-Results Empty State — `src/scripts/site.js:136-139`. Check: query with no matches; confirm explicit "no results" message renders.

## Phase 5: docs-content-presentation Conformance

- [x] 5.1 Structured Section Content — `src/components/DocumentationContent.astro`. Check: grep counts confirm 33 `<h2 `, 36 `<table>`, 2 `class="mermaid"`.
- [x] 5.2 Code Block Copy Control — `src/scripts/site.js:197-212`. Check: `npm run preview`; activate a code block's copy control, confirm clipboard write and transient "copied" state. [manual QA]
- [x] 5.3 Table Horizontal Scroll Affordance — `src/scripts/site.js:227-235`, `global.css:373-378`. Check: `npm run preview`; confirm scroll-edge hint appears on a wide table and clears at the scroll end. [manual QA]
- [x] 5.4 Card-Mode Tables on Narrow Viewports — `src/scripts/site.js:214-225`, `global.css:539-569`. Check: viewport below 760px; confirm rows become labeled cards.
- [x] 5.5 Readable Measure for Running Text — `global.css:506-509`. Check: wide viewport; confirm paragraph column is narrower than table width.
- [x] 5.6 Diagram Legibility on Narrow Viewports — `global.css:242,467-469`. Check: narrow viewport; confirm Mermaid diagram scrolls horizontally instead of shrinking text.

## Phase 6: Visual Parity and Known-Debt Sign-off

> **Removed from scope:** visual parity comparison at 1440x1000 and 768x1000 was task 6.1. No
> reference screenshots exist in this tree to compare against, so the task is unsatisfiable as
> written. Moved to the follow-up change `establish-visual-regression-baseline`. See
> *Verification Provenance* above.

- [x] 6.2 Confirm the three overlapping `@media(max-width:900px)` blocks (`global.css:256,407,426`) remain recorded as debt in `docs-navigation` Known Issues — no code change.
- [x] 6.3 Confirm `/favicon.ico` 404 remains recorded as deferred in `docs-site-shell` Known Issues — no code change. Corroborated at runtime: the browser console logs a 404 for `:4321/favicon.ico` on load.

## Gap Check

No spec requirement lacks existing implementation evidence. All 22 requirements across the four
capability specs cite `file:line` evidence already present in the working tree. No new code task
is proposed by this change.

## Residual Risk

The project has no automated test runner (`sdd-init/test-exploracion`: Strict TDD Mode disabled,
test command none). Nine behavioral requirements are therefore guarded only by manual QA. Any
future change to `src/scripts/site.js` can break scrollspy, the mobile drawer, the search overlay,
the copy control, or the table scroll affordance without any check failing. Introducing a browser
test harness would close this gap; it is deliberately out of scope for this retroactive change and
should be raised as its own proposal.
