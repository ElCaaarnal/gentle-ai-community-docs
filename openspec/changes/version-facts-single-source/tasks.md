# Tasks: Single-Source Channel Version Facts

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 35-45 (`additions + deletions`) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Authoritative verification command set

`openspec/config.yaml` is stale (`test_runner.available: false`, `test_command: null`) though Playwright landed. This list outranks it:

- `npm run check` — expect 0 errors, 0 warnings, 0 hints
- `npm run build`
- `npx playwright test` — expect 28 passed
- `rg -n "data/versions" tests/` — expect NO matches (static no-import guard)

Do NOT add a `"test"` script to `package.json`.

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | `src/data/versions.ts` exists and type-checks | PR 1 | `npm run check` | N/A — no runtime surface until bound | Delete the one new file |
| 2 | Both locale components bind the module | PR 1 | `npm run build` + hash both HTML outputs | `npx playwright test` (28) | Restore literals in the two `.astro` files |

## Phase 1: Baseline Evidence (must precede every edit)

This change is behaviour-preserving: the assertion is byte identity, so the baseline must exist before the code that has to satisfy it. Do not invent new tests.

- [ ] 1.1 Confirm the working base is clean and on the change branch; no edits yet.
- [ ] 1.2 Prove build determinism: run `npm run build` twice, hashing `dist/index.html` and `dist/es/index.html` each run with `shasum -a 256`. If the two runs disagree, STOP and report — the diff would be meaningless.
- [ ] 1.3 Save the two baseline hashes AND copies of both built files to a scratch path outside the repo.
- [ ] 1.4 Record the baseline `npx playwright test` count (expect 28 passed).

## Phase 2: Foundation

- [ ] 2.1 Create `src/data/versions.ts` with `ReleaseFact`, module-local `goModulePath`, exported `releases` (`as const satisfies Record<'stable'|'prerelease', ReleaseFact>`), and exported `prereleaseInstall`. Do not export `goModulePath`.
- [ ] 2.2 Run `npm run check` — 0 errors / 0 warnings / 0 hints.

## Phase 3: Bind EN (parallel-safe with Phase 4)

- [ ] 3.1 `DocumentationContentEn.astro`: add a three-line frontmatter fence importing `{ prereleaseInstall, releases }` from `../data/versions`, directly above `<section class="hero">` with NO blank line between `---` and `<section`. This is the only new parse-mode surface and the expected failure shape for Phase 5.
- [ ] 3.2 Line 5: bind both chips — `<b>{releases.stable.version}</b>`, `<b>{releases.prerelease.version}</b>`.
- [ ] 3.3 Line 1400: bind `<code>{releases.stable.version}</code>` and `<span class="pill">{releases.stable.released}</span>`. Leave the `@latest` command literal.
- [ ] 3.4 Line 1401: bind version, `released`, and `<code>{prereleaseInstall}</code>`. Leave line 1402 (`@main`) untouched.

## Phase 4: Bind ES (parallel-safe with Phase 3)

- [ ] 4.1 `DocumentationContentEs.astro`: put the same import BETWEEN the existing `---` lines 1-2. Do not touch `{<>` (line 4) or `</>}` (line 1501).
- [ ] 4.2 Line 9: bind both chips; keep `Estable` / `Última RC` authored.
- [ ] 4.3 Lines 1425-1426: bind exactly as EN; keep `Prerelease` / `Desarrollo` authored and line 1427 untouched.
- [ ] 4.4 Re-read all six edited lines: every `{expr}` must be immediately preceded by `>` and followed by `<`, no whitespace. Never split a partial text node.

## Phase 5: Verification

- [ ] 5.1 `npm run check` — 0 / 0 / 0.
- [ ] 5.2 `npm run build`, re-hash both files. BOTH hashes MUST equal the Phase 1.3 baseline (spec `docs-content-presentation` scenario 4).
- [ ] 5.3 On any mismatch: `diff` against the saved copies to localize (whitespace at the EN fence boundary is the likely cause). Restore transparency or report a blocker — NEVER regenerate the four hero PNGs.
- [ ] 5.4 `npx playwright test` — 28 passed, no `.png` regeneration.
- [ ] 5.5 `rg -n "data/versions" tests/` — no matches (`docs-browser-verification` scenario 3).
- [ ] 5.6 `git status` / `git diff --stat`: zero changes under `tests/`, zero `.png` changes, total ~35-45 lines.
- [ ] 5.7 Confirm out-of-reach surfaces are untouched: 14 delta pills, retirement prose, historical versions, warn box, closing paragraph (scenario 5).
