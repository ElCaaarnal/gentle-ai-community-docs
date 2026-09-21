# Update Gentle AI documentation to v3.4.0

## Goal

Update the bilingual community documentation site to accurately describe the Gentle AI v3.4.0 release snapshot without mixing in later `main` behavior.

## Authority

- Repository tag: https://github.com/Gentleman-Programming/gentle-ai/tree/v3.4.0
- Release: https://github.com/Gentleman-Programming/gentle-ai/releases/tag/v3.4.0
- User decision: pin content to the v3.4.0 snapshot.

## Scope

- `src/data/versions.ts`
- `src/components/DocumentationContentEn.astro`
- `src/components/DocumentationContentEs.astro`
- Focused tests only if existing coverage requires or supports release-content assertions.

## Non-goals

- Documenting behavior introduced after v3.4.0.
- Redesigning the site or changing stable heading IDs/navigation structure, except the version-specific upgrade heading moving from `actualizar-a-v2-5-0` to `actualizar-a-v3-4-0`.
- Publishing, pushing, or opening a pull request.

## Tasks

- [x] 1. Establish the exact v3.4.0 content delta from authoritative tag and release evidence.
  - Evidence: GitHub release metadata confirms publication on 2026-09-19, eight assets, provider contract 1.2.0, module path `/v3`, host-mediated Pi reviewer roles, pre-authority context bounds, `review assess` routing, six fixes, and RTK retirement as the breaking change. Current docs still identify v2.5.0, `/v2`, contract 1.1.0, a retired FINALIZE continuation, and `opencode models --refresh`.
  - Commit: not created; commits require explicit user authorization.
- [x] 2. Update version metadata and English/Spanish documentation with matching v3.4.0 facts.
  - Evidence: updated stable metadata, `/v3` installation paths, release assets and provider contract, release highlights/fixes/breaking change, stop-code guidance, OpenCode discovery, and tag-pinned official links in both locales. `git diff --check` passed.
  - Commit: not created; commits require explicit user authorization.
- [x] 3. Verify type checks, unit tests, production build, browser tests, bilingual parity, and stale-version removal.
  - Evidence: `npm run check` passed (30 files); `npm run test:unit` passed (49 tests); `npm run build` passed (2 pages, 192 indexed sections, 96 per locale); `npx playwright test` passed (55 tests); `git diff --check` passed. Independent verification confirmed current facts, locale parity, stale-string removal, and intended scope.
  - Platform note: Darwin hero baselines were regenerated and pass locally. Linux baselines could not be regenerated on macOS and remain pending Linux/CI visual verification.
  - Commit: deferred until the user-authorized final work unit.
- [x] 4. Complete cumulative v3.0–v3.3 workflow coverage and matching browser assertions.
  - Cover durable ODD task continuity, configured TDD, work-unit commit/review slicing, and OpenCode V2 version-aware behavior.
  - Evidence: updated both locales and added section-scoped bilingual Playwright assertions; focused browser test and `git diff --check` passed.
  - Commit: deferred to the final cohesive documentation work unit.
- [x] 5. Re-run independent verification for the completed candidate.
  - Evidence: `npm run check` passed with zero diagnostics; 49 unit tests passed; build passed with 96 indexed sections per locale; 57 Playwright tests passed; `git diff --check` passed. Independent verification confirmed bilingual parity, strengthened cumulative-v3 assertions, intended scope, and a 310-line reviewable work unit.
  - Platform note: Darwin visual checks pass; Linux screenshot pixels remain pending Linux CI.
  - Commit: deferred to task 6 as the cohesive documentation work unit.
- [x] 6. Create one reviewable work-unit commit and push the feature branch.
  - Evidence: committed the cohesive documentation candidate as `e8761e0` (`docs(site): update Gentle AI guide to v3.4.0`) and pushed `docs/gentle-ai-v3.4.0` to `origin`.
  - Review note: committed-range native review lineage `review-ac67d6592932b4ee` could not admit its reviewer group because frozen PNG changes were exposed only as binary-difference notices. No review approval was claimed; push proceeded under the user's explicit delivery authorization after all local functional checks passed.

## Decisions

- 2026-09-19: v3.4.0 is the governing snapshot; later `main` behavior is excluded.
- 2026-09-21: before push, complete the missing cumulative v3.0–v3.3 user-facing workflow coverage; do not add a full historical changelog.

## Verification

All configured local checks pass. Linux-specific screenshot baselines remain pending validation on a Linux runner; no Linux baseline was guessed or copied from Darwin.

Native review lineage `review-1e0cc85f7a43d845` remains open without a verdict: two provider-offered reliability captures were rejected without consuming the slot because the immutable reviewer context exposed changed PNG snapshots only as binary-difference notices. No approval was acknowledged.
