# Tasks: Bilingual Documentation Feedback Remediation

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 1,600–2,200 authored; generated snapshots/image excluded from count, included in identity |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 foundation → PRs 2–9 content → PR 10 integration/SEO/visual/runtime → PR 11 browser |
| Delivery strategy | auto-chain |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Work Units

| Unit | Goal/base | Likely PR | Test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Shell/IDs/threats; PR #1 base = feature/tracker branch | PR 1 | `npm run check` | `npm run build` + inspect `/`, `/es/` | Revert config/shell/routes/harness |
| 2 | Getting Started parity delivered; PR #2 base = PR #1 branch | PR 2 | `npm run check` | Playwright smoke for changed anchors | Revert Getting Started tranche |
| 3 | Ecosystem parity correction (Engram, SDD, OpenSpec, Strict TDD, skills); PR #3 base = PR #2 branch; excludes agent/RDD | PR 3 | `npm run check` | Playwright smoke for ecosystem anchors | Revert ecosystem tranche |
| 4 | Personas/agent behavior; PR #4 base = PR #3 branch | PR 4 | `npm run check` | Playwright smoke for anchors | Revert personas-through-states tranche |
| 5 | RDD parity; PR #5 base = PR #4 branch | PR 5 | `npm run check` | Playwright smoke for anchors | Revert RDD tranche |
| 6 | Workflows (`flujo-organico`, `flujo-sdd`); PR #6 base = PR #5 branch | PR 6 | Focused Chromium workflow parity | Static `/` and `/es/` workflow assertions | Revert workflows tranche |
| 7 | Agents; PR #7 base = PR #6 branch | PR 7 | Focused Chromium agent/Pi parity | Static `/` and `/es/` agent/Pi ID and localization assertions | Revert agents tranche |
| 8 | CLI, backups, and release verification; PR #8 base = PR #7 branch | PR 8 | `npm run check` | Playwright smoke for anchors | Revert operations tranche |
| 9 | Version policy and reference; PR #9 base = PR #8 branch | PR 9 | `npm run check` | Playwright smoke for anchors | Revert version-policy/reference tranche |
| 10 | Integration/SEO/visual/runtime/component rename; PR #10 base = PR #9 branch | PR 10 | `npm run check` | `npm run build` + inspect sitemap/head/assets | Revert integration, SEO, assets, styles, runtime, and rename |
| 11 | Browser matrix/snapshots/CI/docs; PR #11 base = PR #10 branch; only tracker/integration branch ultimately targets main | PR 11 | `npm run check && npm run build && npx playwright test` | Chromium 1440×900/390×844 matrix | Revert tests/snapshots/CI/README |

## Phase 1: Foundation / RED Tests

- [x] 1.1 Add pinned Astro sitemap/Sharp/Playwright tooling to `package.json`, `package-lock.json`, and `playwright.config.ts`.
- [x] 1.2 RED: in `tests/docs.spec.ts`, add no-JS base-link, valid H2/H3 switch, and unknown/encoded-hash fallback tests; assert no redirect, valid hash/focus, and usable alternate route/main.
- [x] 1.3 Create `astro.config.mjs`, `src/i18n/site.ts`, `src/components/DocumentationPage.astro`, `src/pages/index.astro`, and `src/pages/es/index.astro`; localize `BaseLayout.astro`, `Sidebar.astro`, and `InterfaceChrome.astro`.

## Phase 2: Behavior / Content Parity

> Correction: WU2 delivered only Getting Started. WU3 owns the omitted ecosystem tranche; WU4 owns personas through public states; WU5 owns RDD; WU6 owns workflows; WU7 owns agents; WU8 owns CLI, backups, and release verification; WU9 owns version policy and reference; WU10 owns integration/SEO/visual/runtime/component rename; and WU11 owns browser evidence. The chain therefore grows from six units to eleven. Tasks 2.1 and 2.2 remain open until their complete acceptance criteria are met.

- [x] 2.1 Rename `src/components/DocumentationContent.astro` to `DocumentationContentEs.astro`; create `DocumentationContentEn.astro` with matching structure/IDs, literals, diagrams, and semantics. Evidence: WU10 direct locale rendering and full Chromium suite passed.
- [x] 2.2 GREEN: update `src/scripts/site.js` for serialized strings, valid-fragment focus, locale-local search, scrollspy, feedback, and tables. Evidence: valid/unknown fragment controls and full Chromium suite passed.
- [x] 2.3 Translate/parity-check `DocumentationContentEn.astro`/`DocumentationContentEs.astro` in tranches A (start/ecosystem), B (agent/RDD), and C (flows/reference); preserve neutral prose and exact literals. Evidence: WU2–WU9 completed every content tranche; the focused and full Chromium suites pass with canonical IDs, localized content, literals, formulas, versions, dates, glossary order, and official links.
  - [x] 2.3a Start and ecosystem parity.
  - [x] 2.3b Personas and RDD parity.
  - [x] 2.3c Workflows parity for `flujo-organico` and `flujo-sdd`.
  - [x] 2.3d Agent, operations, and reference parity. Evidence: WU7, WU8, and WU9 completed the final content scopes; WU9 focused and full Chromium evidence passes.

### Granular work-unit tracking

- [x] WU7 Agents parity: localized the agents, delegation models, OpenCode profiles, and Pi sections with canonical IDs, exact technical literals, focused Chromium evidence, and full Chromium evidence.
- [x] WU8 Operations parity: localized CLI, backups, and release verification with canonical IDs, exact technical literals, focused Chromium evidence, and full Chromium evidence.
- [x] WU9 Version policy and reference parity: localized `versiones`, `glosario`, and `docs` through the end of documentation content; preserved canonical IDs, versions, dates, the `original_changed_lines` formula, glossary order, and official links; focused and full Chromium evidence passed.

## Phase 3: SEO / Visual Integration

- [x] 3.1 Add absolute canonical, reciprocal `en`/`es`/`x-default`, localized OG metadata, sitemap, and route guidance in `BaseLayout.astro`, `astro.config.mjs`, and `README.md`.
- [x] 3.2 Create `assets/banner-source.webp` and `scripts/generate-banner.mjs`; update deterministic `public/banner.webp` and `src/styles/global.css` for banner, callout, H2, hover, and table treatments.

## Phase 4: Browser Verification

- [x] 4.1 Complete `tests/docs.spec.ts` for both locales/viewports: parity, search match/empty/no-match, scrollspy, focus, tables, head/sitemap, and hero/narrow-table snapshots in `tests/docs.spec.ts-snapshots/`.
- [x] 4.2 Create `.github/workflows/docs-browser.yml`; run `npm run check`, `npm run build`, and the Chromium matrix; record locale/viewport/behavior failures and confirm deterministic assets.
