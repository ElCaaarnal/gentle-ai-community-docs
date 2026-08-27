# Proposal: Formalize the Astro Documentation Site

## Intent

The Astro static documentation site already exists in the working tree, written by direct implementation without an SDD contract. `astro check` and `astro build` currently pass. Desktop 1440x1000 and mobile 768x1000 renders were verified byte-identical to the validated prototype references at implementation time; those reference screenshots no longer exist in the tree, so that parity is not reproducible or re-checkable today. It has **no stated requirements**.

This change is unusual and we state it plainly: **implementation preceded the contract**. The proposal authorizes no new work. It documents an existing artifact.

It is still worth doing. Without a contract, nothing can be verified against intent, "correct" means only "matches a screenshot someone took once", and every future change starts with no baseline. The 18 open design decisions in `docs-gentle-ai/BRIEF.md` cannot be reasoned about until the current behavior is written down.

## Scope

### In Scope

- Formal intent, scope, and approach for the existing Astro static documentation site.
- The architecture already realized: `src/pages/index.astro` (single static route), `src/layouts/BaseLayout.astro`, `src/components/{InterfaceChrome,Sidebar,DocumentationContent}.astro`, `src/scripts/site.js`, `src/styles/global.css`, `public/banner.png`, `package.json` (Astro 7.2.4), `tsconfig.json` (`astro/tsconfigs/strict`).
- The client behavior in `site.js`: heading anchors, sub-navigation, runtime DOM search index, scrollspy, code copy, table labeling, mobile drawer, scroll progress.
- Naming the verification evidence that already exists and can still be re-run: `npm run check` and `npm run build`. Visual reference parity was verified at implementation time, but its reference screenshots are no longer in the tree, so it is not re-checkable today — see Intent.

### Out of Scope

- Vercel deployment and any infrastructure work.
- The 18 pending design decisions from BRIEF.md (mobile table treatment, light theme, typography, breakpoints, hero width, section order, search ranking, banner optimization, and the rest).
- The `/favicon.ico` 404 (deferred by the user).
- Accessibility, device, and content-lifecycle items under "Fuera del alcance del prototipo" in BRIEF.md.
- Any new feature, redesign, or refactor.

## Capabilities

### New Capabilities

- `docs-site-shell`: static single-route composition, document head, font and Mermaid loading, strict TypeScript build.
- `docs-navigation`: sidebar sections, contextual sub-index, scrollspy, mobile drawer, scroll progress, back to top.
- `docs-search`: runtime DOM-built index, accent-insensitive matching, keyboard-driven overlay.
- `docs-content-presentation`: 33 `h2` sections, 36 tables, 2 Mermaid diagrams, code copy controls, responsive rules.

### Modified Capabilities

- None.

## Approach

Retroactive contract. Read the implementation as it stands, write specs that describe what it **does**, and mark anything undecided as an open decision rather than inventing a requirement.

Sustained decisions from BRIEF.md that the implementation genuinely realizes, carried forward with their original rationale:

| Decision | Rationale (BRIEF.md) |
|---|---|
| Static output | Content and experience need no server behavior |
| Content derived from the 17 read sources | Explicit request: invent nothing |
| Canonical Kanagawa palette | Hex values are verifiable, not reconstructed |
| Pink accent from Kanagawa; `#FA2E8D` only in the hero | Keeps the brand without breaking a low-saturation system |
| Navigation appears and disappears by context | Direct translation of Gentle AI's stated principle |
| Search index built at runtime from the DOM | Cannot drift out of sync with content |
| Accent-insensitive search (NFD + diacritic strip) | "instalacion" must find "Instalación" |
| Versions from the releases API with a verification date | A version number without a date is a future lie |
| Measure limited to running text only | Tables, code, and diagrams are data, not prose |
| Fixed mobile top bar instead of a floating button | The floating button covered the first heading on anchor jump |
| Diagrams with `min-width` and scroll | Shrunk diagrams reached ~4px text |
| Card breakpoint at 760px, not 900px | At 768 the table still reads well |

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `openspec/changes/formalize-astro-docs-site/` | New | Proposal, specs, design, tasks |
| `openspec/specs/` | New | Four capability specs |
| `src/`, `public/`, `package.json`, `tsconfig.json` | Unchanged | Described, not modified |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Specs describe intended behavior instead of actual behavior | Med | Every requirement must cite a file and line already read |
| Writing specs surfaces a real defect and tempts a code fix | Med | Record it as a finding; a code change requires a new change, not this one |
| `/favicon.ico` returns 404 — known, deferred by the user | Confirmed | Recorded as a known deferred issue; out of scope here |
| Three contradictory `@media(max-width:900px)` blocks survive in `global.css` (lines 256, 407, 426) — BRIEF debt #16 carried over | Confirmed | Spec the observed cascade result; flag as debt, do not restructure |
| Three network dependencies (2x Google Fonts, 1x Mermaid CDN) are contracted as-is | Confirmed | Document as a stated constraint, not a requirement to change |
| Artifact volume across four specs plus design and tasks may approach the 400-line review budget | Med | Keep specs terse; slice into chained PRs if the forecast is high |

## Changed-Line Estimate

**Artifact-only: ~250-400 added markdown lines. Zero code lines.**

If any phase concludes code must change, that is a scope breach: stop and raise it, do not fold it in silently.

## Rollback Plan

Delete `openspec/changes/formalize-astro-docs-site/` and any `openspec/specs/` files this change created. No source file is touched, so rollback cannot affect the running site.

## Dependencies

- `docs-gentle-ai/BRIEF.md` — the only formal input crossing over from exploration mode.
- `docs-gentle-ai/index.html` — validated visual and behavioral prototype; evidence and reference, not a code base.
- The existing uncommitted implementation in `src/`, `public/`, `package.json`, `tsconfig.json`.

## Success Criteria

- [ ] Every capability spec describes behavior traceable to a file already in the working tree.
- [ ] No source file is modified by this change.
- [ ] The 18 pending decisions are named as open, not silently resolved.
- [ ] `npm run check` and `npm run build` still pass at verify time, unchanged.
- [ ] A future contributor can read the specs and know what "correct" means without opening a screenshot.

## Proposal question round

Interactive mode. As a phase executor I have no direct channel to the user, so these go to the orchestrator for a user round. The scope decision itself is settled; these shape the specs.

1. **Contract fidelity**: should the specs describe behavior at the level of *observable outcome* ("the active section is highlighted in the sidebar") or also pin *mechanism* ("via `getBoundingClientRect().top + scrollY`, not `IntersectionObserver`")? Mechanism-level pinning preserves hard-won BRIEF findings but makes future refactors spec-breaking.
2. **Arbitrary numbers**: BRIEF items 9-15 are values chosen by eye (breakpoints, 70ch measure, 130-char snippets, 700px threshold). Do we contract them as requirements, or record them as observed values explicitly marked provisional?
3. **Known debt**: should the three contradictory `@media(max-width:900px)` blocks be specified by their *cascade outcome* (honest but locks in the accident), or flagged as unspecified debt with a follow-up change?
4. **Spec granularity**: four capabilities, or fewer? Four gives clean boundaries but multiplies artifact volume against the 400-line review budget.

### Assumptions made in the absence of answers

- Specs describe observable outcomes; mechanism appears as rationale, not requirement.
- Eye-chosen numbers are recorded as observed and provisional.
- Cascade debt is specified by outcome and flagged.
- Four capabilities as listed above.
