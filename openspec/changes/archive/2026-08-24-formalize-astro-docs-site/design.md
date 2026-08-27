# Design: Formalize the Astro Documentation Site

**This document records architecture that already exists.** It decides nothing new and authorizes no
change. Every claim below was read from the working tree and cites `file:line`. Requirements live in
`specs/`; the original reasoning lives in `docs-gentle-ai/BRIEF.md`. Neither is restated here.

## Component architecture (as built)

One static route. No `astro.config.*` file exists, so Astro's default static output applies unconfigured.

```
BaseLayout.astro          html/head/body + global.css + external deps; renders <slot>
  └─ index.astro          the only page; passes title/description, composes the body
       ├─ InterfaceChrome overlay/chrome layer, outside the flex column
       └─ .wrap
            ├─ Sidebar    static <aside> nav
            └─ main       DocumentationContent
       └─ <script src="../scripts/site.js">
```

| File | Lines | Owns |
|---|---|---|
| `src/pages/index.astro` | 20 | The only route. Composition order and the two page-level strings (`:9-10`). Loads the client script (`:19`). |
| `src/layouts/BaseLayout.astro` | 31 | Document shell, `Props{title,description}` (`:4-7`), head metadata (`:15-22`), the single `global.css` import (`:2`), all external network deps (`:23-26`). |
| `src/components/InterfaceChrome.astro` | 22 | Every chrome element the script later drives: `#progress`, `#topbar`, `#scrim`, `#toTop`, `#searchOverlay`, `.skip`. Pure markup — no behavior. |
| `src/components/Sidebar.astro` | 52 | 8 group labels and 33 anchor links (`:10-50`), hand-maintained and manually kept parallel to the 33 `h2` sections in the content. |
| `src/components/DocumentationContent.astro` | 1400 | All prose, tables, and diagrams as literal markup. No frontmatter block, no props, no data source. `.tblwrap` wrappers are authored statically (`:25`); code blocks are not. |

The sidebar↔content correspondence is a manual invariant, not an enforced one: adding an `h2` without
adding a `Sidebar.astro` link produces a section the nav cannot reach, and nothing fails the build.

## Client behavior boundary

`src/scripts/site.js` (319 lines) is the only runtime code. Everything else is build-time output.

| Band | Lines | Enhancement |
|---|---|---|
| Mermaid init (top-level, outside the IIFE) | 1-21 | Theme tokens mirrored from the CSS palette by hand |
| Heading ids + `.anchor` links | 37-47 | Slugified, collision-suffixed |
| Sub-nav construction | 50-69 | Built by walking siblings between `h2` boundaries |
| Search index + overlay | 85-195 | Index from live DOM; keyboard-driven modal |
| Code copy controls | 198-212 | Wraps each `pre` in `.codeblock`, appends the button |
| Table cell `data-label` | 215-225 | Feeds the CSS card mode |
| Table scroll hints | 228-242 | Measured, re-run on `resize` |
| Scrollspy + sidebar auto-scroll | 245-292 | rAF-throttled via `onScroll` |
| Progress bar + back-to-top | 295-309 | |
| Mobile drawer | 312-316 | |

**Why a static site needs client JS here.** Most of this band reads facts that do not exist at build
time: scroll offset (`:255`), viewport width (`:285`), and measured overflow (`:230`, `scrollWidth >
clientWidth`), plus clipboard and keyboard input. The derived-DOM work (anchors, sub-nav, `data-label`)
*could* have moved to build time; it did not, because the script was ported intact from the validated
prototype and moving it would have put visual parity at risk for no user-visible gain. The search index
is runtime by intent, not by inertia — building it from the rendered DOM is what keeps it from drifting
away from the content (BRIEF rationale, carried into `specs/docs-search`).

## Styling architecture

`src/styles/global.css` (569 lines), imported once at `BaseLayout.astro:2`. No component-scoped
`<style>` blocks exist anywhere; the whole cascade lives in one file, in source order.

| Band | Lines |
|---|---|
| Token layer — Kanagawa palette, semantic roles, font stacks, `--sidebar`/`--radius` | 6-38 |
| Base resets, links, scrollbars | 39-55 |
| Component bands — layout, sidebar, hero, typography, code, tables, notices, cards, steps, misc | 57-262 |
| Navigation and reading — progress, search overlay, anchors, copy, scroll hints, menu | 264-421 |
| Mobile | 423-489 |
| Appended: accessibility and legibility corrections | 491-533 |
| Appended: tables as cards | 535-569 |

**Responsive strategy: desktop-first `max-width` queries** at 900px (primary layout switch), 760px (table
card mode, `:539`) and 420px (`:481`), with one deliberate `min-width:901px` exception at `:68` that
confines `margin-inline:auto` to desktop.

**Convention: corrections are appended, not merged.** The last two bands override earlier declarations by
source order rather than editing them in place — `:root` is re-declared at `:495` to replace `--muted`
from `:29`. This is intentional and traceable when the override is a single deliberate block. It is the
same mechanism that produced the debt below when it was applied three times to one breakpoint.

## External dependencies (contracted as-is)

All three are declared in `BaseLayout.astro:23-26` and are **accepted as they stand**. They are recorded
here as a constraint of the current build, not as a problem this change solves.

| Dependency | Line | Failure mode without network |
|---|---|---|
| `fonts.googleapis.com` stylesheet — Inter, Zen Kaku Gothic New, JetBrains Mono | `:25` | Falls back to the system stacks at `global.css:32-34`; layout survives, typography does not |
| `fonts.gstatic.com` font files (preconnected `:23-24`) | `:25` | Same |
| `cdn.jsdelivr.net` Mermaid 11 | `:26` | `site.js:2` guards on `window.mermaid`, so the script does not throw — the two diagrams simply never render |

## Verification architecture

**There is no automated test runner.** `package.json:6-11` declares exactly four scripts — `dev`, `check`,
`build`, `preview` — and `package.json:15-18` declares no test dependency. No test file exists anywhere in
the tree. The complete verification surface is:

1. `npm run check` — `astro check` under `astro/tsconfigs/strict` (`tsconfig.json:2`). Note that `site.js`
   is untyped plain JavaScript, so this check gives the entire runtime behavior band no real coverage.
2. `npm run build` — static output produced without error.
3. Visual reference parity — **no longer available.** At implementation time, rendered output was
   compared against saved prototype screenshots at 1440x1000 and 768x1000 and found byte-identical.
   Those reference screenshots do not exist in this tree, so this gate cannot be run today and the
   comparison cannot be reproduced.

Nothing else exists. Any statement that this site is "tested" means only these three things — and the
third is a historical, non-reproducible fact, not a currently-checkable one.

## Known structural debt — recorded, not resolved

Three separate `@media(max-width:900px)` blocks declare overlapping rules for the same elements:

| Block | Overlapping declarations |
|---|---|
| `global.css:256-262` | `aside` (static, full width, bottom border), `main{padding:0 20px 90px}` |
| `global.css:407-418` | `aside` (fixed, 290px, translated off-canvas, border-right restored, `border-bottom:0`), `main{padding-top:8px}`, `#toTop{right:16px;bottom:16px}` |
| `global.css:426-479` | `main{padding-top:52px}`, `aside{top:0;padding-top:20px}`, `#toTop{bottom:16px;right:16px}` |

`aside` positioning, `main` padding, and `#toTop` offsets are each declared in two or three of these
blocks at equal specificity. The winner is decided purely by source order, so the rendered result is
correct but not *stated* anywhere — reading any single block gives a wrong answer about what `aside` or
`main` actually does below 900px. This is debt inherited from the prototype rebuild (BRIEF item #16).
**It is recorded, not fixed,** because this retroactive change authorizes no refactor and the debt is a
source-clarity problem, not a rendering defect: the cascade already resolves correctly, only the
authoring is unclear. Consolidating it is a separate change with its own visual re-verification.

## Threat matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or
process-integration boundary. This change writes markdown only.

## Migration / rollout

None. No source file is modified. Rollback is deleting the artifacts.

## Non-goals (explicit)

- Vercel deployment and any hosting or infrastructure work.
- The 18 pending design decisions in `docs-gentle-ai/BRIEF.md`.
- The deferred `/favicon.ico` 404 (`public/` holds `banner.png` only).
- Accessibility, device, and content-lifecycle items under the brief's out-of-scope section.
- Fixing the 900px cascade debt, the untyped runtime band, or the manual sidebar↔content invariant.

## Open questions

- [ ] The sidebar↔content correspondence has no build-time enforcement. Worth a check, or accepted as manual?
- [ ] Does consolidating the three 900px blocks warrant its own change, or does it wait for the BRIEF breakpoint decision?
