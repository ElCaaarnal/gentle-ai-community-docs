# Exploration: version-facts-single-source (issue #30)

Builds on pre-proposal findings (Engram #3960). Findings 1-3 confirmed with two refinements and one correction, plus one new constraint that was not previously known.

## Current State

- `src/i18n/site.ts` (43 lines) is the ONLY shared typed data module. `Record<Locale, SiteCopy>` of localized chrome copy, plus a `navigation` const using `as const satisfies Record<Locale, readonly NavigationGroup[]>` (line 26). That `as const satisfies` idiom is the repo's typed-data precedent.
- `DocumentationPage.astro` imports `site`, picks `copy = site[locale]`, passes `copy` as a prop to `InterfaceChrome` and `Sidebar`, serializes 4 fields into `data-site-copy`, and renders `{locale === 'en' ? <DocumentationContentEn /> : <DocumentationContentEs />}` with NO props.
- Live version surface confirmed:
  - EN `DocumentationContentEn.astro` (1475 lines): hero chips line 5, channel table rows 1400-1402.
  - ES `DocumentationContentEs.astro` (1501 lines): hero chips line 9, channel table rows 1425-1427.
- Build: `astro.config.mjs` has `site`, `i18n`, and the sitemap integration only. No fetch. `tsconfig.json` extends `astro/tsconfigs/strict` (2 lines).
- Tests: `playwright.config.ts` has 2 projects (chromium-desktop 1440x900, chromium-narrow 390x844) x 14 tests = 28. `tests/docs.spec.ts:245` pins the `versions` array; `:267` asserts each literal is in `main` on both routes.
- CI `.github/workflows/docs-browser.yml`: PR path filter, push to main, plus `workflow_dispatch` with `update_snapshots` that uploads regenerated `*-linux.png`. No `schedule:` trigger exists.

## Corrections and Refinements to the Established Findings

1. **CORRECTION to the premise "both locale files are plain HTML with ZERO data binding, no frontmatter script."** Half wrong. `DocumentationContentEs.astro` ALREADY has an empty frontmatter fence (lines 1-2) and its ENTIRE body is already a JSX fragment expression: `{<>` at line 4, `</>}` at line 1501. `DocumentationContentEn.astro` has neither — it starts directly at `<section class="hero">`. The two files do not start from the same authoring mode. ES is already in expression mode, so binding there is not a new paradigm; EN needs a new frontmatter fence. No documented reason for the asymmetry exists in the archive or Engram (likely legacy from the WU2 Spanish component rename, Engram #3757). Do NOT normalize it in this change.

2. **REFINEMENT to "six values."** Precisely: FOUR recorded facts (`stable.version`, `stable.date`, `prerelease.version`, `prerelease.date`) plus ONE derived string. Stable installs with `@latest` and development with `@main` — both version-independent constants. Only the prerelease row embeds the version (`...@v2.5.0-rc.1`). Hero chips carry version only, never dates. So the derivation surface is one template literal, not two.

3. **REFINEMENT to line alignment.** EN is 1475 lines, ES is 1501. "Structurally aligned" means shared canonical heading IDs, not line numbers. Any plan that pairs edits by line number is wrong.

4. **NEW CONSTRAINT, not in the pre-proposal findings.** `.hero` is pixel-snapshot tested: `tests/docs.spec.ts:336` runs `toHaveScreenshot('hero-en.png' | 'hero-es.png')` on chromium-desktop, with four committed baselines (`hero-{en,es}-chromium-desktop-{darwin,linux}.png`). The version chips are INSIDE that crop. `openspec/specs/docs-browser-verification/spec.md:25` contracts it ("Focused visual evidence"). Any hero edit that alters rendered bytes forces regenerating all four PNGs, and the Linux pair can only be produced through the `workflow_dispatch update_snapshots` CI path — the two most recent commits on main are exactly that ritual. This is the dominant execution risk of the change.

5. **Observation, out of scope.** ES channel table line 1426 labels the row `Prerelease` in English while translating `Estable` and `Desarrollo`. ES prose uses "prerelease" as a loanword too, so it is plausibly deliberate. Not this change's business.

6. **Stale config.** `openspec/config.yaml` still declares "no automated test runner, browser harness, coverage tool, linter, or formatter is configured", `test_runner.available: false`, `test_command: null`. Playwright has landed since. sdd-verify will read this.

## Q1 — Module shape and location

| Approach | Pros | Cons | Effort |
|---|---|---|---|
| A. Extend `site.ts` | One shared module already exists | `site.ts` is `Record<Locale, ...>`; version facts are locale-invariant, so this forces duplicating each version string under `en` and `es` — it RECREATES the drift being removed | Low |
| B. New `src/data/versions.ts`, locale-invariant | Data separated from copy; matches the `as const satisfies` precedent; zero config; trivially importable by a future CI checker | Introduces a second data directory | Low |
| C. JSON + `resolveJsonModule` | Machine-writable by a bot | Loses literal types and `satisfies`; needs tsconfig change | Low |
| D. Astro content collection + Zod | Runtime schema validation | Needs `src/content.config.ts`, a collection dir, and async `getEntry` in frontmatter — enormous for 4 values | High |

**Recommendation: B.** `src/data/versions.ts` as a sibling of `src/i18n/`. Locale-invariant data is a different concern from localized copy, and the directory name says so. Shape:

```ts
export type ReleaseFact = { readonly version: string; readonly released: string };
export const goModulePath = 'github.com/gentleman-programming/gentle-ai/v2/cmd/gentle-ai';
export const releases = {
  stable:     { version: 'v2.4.0',      released: '2026-08-17' },
  prerelease: { version: 'v2.5.0-rc.1', released: '2026-08-26' },
} as const satisfies Record<'stable' | 'prerelease', ReleaseFact>;
export const prereleaseInstall = `go install ${goModulePath}@${releases.prerelease.version}`;
```

Type-checks under `astro/tsconfigs/strict` with no config change (TS 5.9 supports `as const satisfies`). Keys map 1:1 to GitHub release semantics (tag name, published date) so a later staleness checker is a pure comparison and needs no module rewrite.

## Q2 — How the two components consume it

| Approach | Pros | Cons | Effort |
|---|---|---|---|
| A. Direct import in each content component's frontmatter | Smallest diff (~2 template lines/file + a 3-line fence in EN); ES fence already exists; no new interfaces | First interpolation in the EN file | Low |
| B. Prop-threaded from `DocumentationPage.astro` | Mirrors the `copy` prop precedent used by Sidebar/InterfaceChrome | Props parameterize per-call-site VARIANCE; version facts do not vary by call site. Adds two `Props` interfaces, a call-site change, and an extra hop for zero variance | Medium |
| C. Extract shared `<VersionChips>` / `<ChannelTable>` components | Deduplicates the table markup and the `go install` module string too | Moves markup out of the two files that the parity tests and the hero baseline observe; largest diff; highest screenshot risk; expands scope past the established chips+table position | Medium |

**Recommendation: A.** The Sidebar/InterfaceChrome precedent is real but does not transfer, because that precedent exists to select `site[locale]` per route. Version facts are module-global constants with nothing to select. Direct import also yields the minimum diff, which directly serves the frozen hero baselines and the 400-line budget. C is a reasonable FOLLOW-UP once the data module is proven, not part of this change.

Verified enabler: neither locale file contains any literal `{` or `}` anywhere except the ES wrapper itself (ripgrep, both files). So introducing `{expr}` cannot collide with existing prose or code-block content in either file. This is the reason A is safe rather than merely small.

## Q3 — Scope of the scheduled staleness check

**Recommendation: DEFER to a named follow-up. Do not include `check:versions` or a scheduled workflow in this change.**

Arguments to include it now: without a detector, a single source only makes the edit cheaper, not the drift visible, and issue #30's real pain is forgetting. The `scripts/generate-banner.mjs` + npm-script precedent already exists.

Arguments to defer, which win:
- It is a different capability with its own unresolved decisions: unauthenticated GitHub API rate limits, releases-API pagination, distinguishing stable from prerelease in the response, whether a failure files an issue or reddens main, and token/permissions. None of those are answered, and none of them are answered BY this change.
- `docs-browser-verification` and the existing workflow are PR/push-triggered. A `schedule:` job is a new workflow file with a new failure surface that nobody is on call for.
- The core change is ~40-70 changed lines. The checker plus its workflow plus its failure semantics plausibly doubles it and, worse, doubles the REVIEW surface with an unrelated concern under a 400-line budget.
- Sequencing: the checker consumes the module's API. Landing the module first makes the checker's contract obvious and unarguable.
- Deferring also keeps the spec delta to two ADDED requirements instead of also needing a build/CI-network requirement.

`single-pr` delivery is a delivery strategy, not a scope mandate; deferring is fully compatible with it.

## Q4 — Locale-specific labels

Labels in play: hero `Stable`/`Estable`, `Latest RC`/`Última RC`; table headers `Channel|Version|Installation` / `Canal|Versión|Instalación`; row labels `Stable|Prerelease|Development` / `Estable|Prerelease|Desarrollo`.

| Approach | Pros | Cons |
|---|---|---|
| A. Move labels into `site.ts` | Consistent with "all localized copy lives in site.ts" | Widens `SiteCopy`, a type consumed by three components, for strings that have never drifted; grows the diff without touching issue #30 |
| B. Labels inside the version module, keyed by locale | Colocated with what they label | Creates a SECOND locale dictionary; breaks the data-vs-copy separation that justifies the module's existence |
| C. Leave labels as literal authored text in each locale file; interpolate only the values | Minimum diff; the label stays authored where a translator reads it; strongest expression of "no sentence is produced by concatenation" | The two locale files keep their own label text (which is what a translator wants anyway) |

**Recommendation: C.** These labels are copy, correctly identified — and copy that does not drift. `site.ts` earns its existence by holding strings the SHELL needs at runtime (Sidebar, InterfaceChrome, the serialized `data-site-copy`); body-prose labels have never lived there and nothing in this change requires moving them. Move exactly what drifts. Result: `<span class="chip">Stable <b>{releases.stable.version}</b></span>` — the label is authored, only the datum is bound. If C is ever extracted into a shared component (Q2 option C follow-up), A becomes the right answer at that point, not before.

## Spec Delta — explicit answer: YES, a small one

The five capability specs describe mechanisms, and this change introduces a NEW mechanism plus a deliberate NON-dependency. Both are mechanism, not content inventory. Spec the mechanism; never spec the version values.

1. `docs-content-presentation` — ADDED **Single-source channel version facts**: both locales MUST render the stable and prerelease version, their release dates, and the prerelease install pin from ONE locale-invariant typed module; version narrative prose MUST NOT be generated by concatenation; delta pills and historical version references are out of the mechanism's reach.
2. `docs-browser-verification` — ADDED **Independent version literals**: the browser suite MUST assert version literals as hardcoded expectations and MUST NOT import the version module, preserving double-entry verification (Finding 2).

No delta for `docs-site-shell` — the module type-checks under the existing "Strict TypeScript Build" requirement. No delta for `docs-navigation` or `docs-search`. No build-network requirement is needed BECAUSE the checker is deferred (Q3).

## Risks

1. **Hero pixel baselines (highest).** Four committed PNGs; Linux pair regenerable only via `workflow_dispatch update_snapshots`. Mitigation and acceptance criterion: the change MUST produce byte-identical rendered HTML in the hero region. Verify by diffing `dist/index.html` and `dist/es/index.html` against a pre-change build. Target outcome: ZERO changes to `tests/` and ZERO changes to `*.png`.
2. **Whitespace divergence between the two files.** EN is parsed in Astro's HTML-ish template mode, ES inside a JSX fragment expression. The same textual edit can produce different whitespace in the two locales, and `compressHTML` already broke this repo once (Mermaid, Engram #3861/#3862). Diff both built files, not just one.
3. **Partial drift is not solved.** After this change, someone can update the module and still leave the warn-box prose, the closing paragraph, the 14 delta pills, and the retirement prose arguing about a superseded RC. The change makes 4 facts authoritative; it does not make the prose consistent. Say so in the proposal rather than implying the problem is closed.
4. **Scope creep pressure toward normalizing the ES `{<>...</>}` wrapper.** It is unexplained and tempting. Touching it rewrites 1501 lines, destroys the review budget, and risks every snapshot. Explicitly out of scope.

## Effort

Core change ~40-70 changed lines (one new ~12-line module, a 3-line frontmatter fence in EN, one fence line filled in ES, 2 template lines edited per locale file, 2 delta spec files). Comfortably inside the 400-line budget with room for the spec deltas.

## Ready for Proposal

Yes. All four open questions have evidence-backed recommendations. The proposal should carry the corrected premise (ES is already an expression-mode component), the hero-baseline byte-identity acceptance criterion, and the explicit deferral of `check:versions`.
