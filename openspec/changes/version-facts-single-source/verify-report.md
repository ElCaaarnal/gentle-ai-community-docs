```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:0a51cb549ac8986f134e33532bd78b6aba50a344d4ac84e35d40eb21397604d6
verdict: fail
blockers: 1
critical_findings: 1
requirements: 1/2
scenarios: 6/8
test_command: npx playwright test
test_exit_code: 0
test_output_hash: sha256:7b30a4e98d51a17bb30688f605e89f7ddbe55754d4f01c282733e103ba600391
build_command: npm run build
build_exit_code: 0
build_output_hash: sha256:41a603629d187b1ff3b864c8dbf52f6ea8998b0e5b01ff5cf3ab8d0e5beb7e04
```

## Verification Report

**Change**: version-facts-single-source (GitHub issue #30)
**Version**: N/A
**Mode**: Standard (Strict TDD ceremony deliberately not applied — the contract is zero changes under `tests/`; Phase 1 baseline capture is the test-first analogue)
**Branch**: `refactor/version-facts-single-source` @ `acc7872`
**Base**: `b9da430` (merge-base with `main`); source change is `101a7f3`

Every gate below was re-executed by this phase. Nothing is restated from the apply report.

### Completeness

| Metric | Value |
|--------|-------|
| Tasks total | 21 |
| Tasks complete | 21 |
| Tasks incomplete | 0 |

`rg -c '^- \[x\] ' tasks.md` = 21, `rg -c '^- \[ \] ' tasks.md` = 0. Task state matches code state: the 21 checkboxes describe exactly the two `.astro` edits, the new module, and the five verification gates, and each was independently reproduced below.

### Build & Tests Execution

**Type check**: PASS — `npm run check`, exit 0

```text
Result (16 files):
- 0 errors
- 0 warnings
- 0 hints
```

**Build**: PASS — `npm run build`, exit 0, 2 pages built.

**Tests**: PASS — `npx playwright test`, exit 0

```text
28 passed (34.2s)
```

`git status --porcelain` was empty after the run: zero `.png` regenerated.

**Coverage**: Not available — no coverage tool configured. Not a failure.

### Byte-Identity Gate — PASS (independently re-derived)

The apply report asserted these hashes. This phase did not accept them; it rebuilt the pre-change tree from scratch in a detached worktree at `101a7f3^` and re-derived the baseline.

| Build | `dist/index.html` | `dist/es/index.html` |
|-------|-------------------|----------------------|
| Pre-change tree (`e7dceae`, no `src/data/`), rebuilt by verify | `1b63e55b…d42b5a` | `8a80205c…c652ab` |
| Post-change HEAD, run 1 | `1b63e55b…d42b5a` | `8a80205c…c652ab` |
| Post-change HEAD, run 2 (determinism) | `1b63e55b…d42b5a` | `8a80205c…c652ab` |

Full digests: `1b63e55b057bd3409677d58d1bd2768eca973b34590a07c7ca78600074d42b5a` and `8a80205c9e1b589b0ca7e497106a364276e46171edea3256cd828ecfe2c652ab`. These match the baselines recorded before any edit. Determinism was re-proved at HEAD by two consecutive builds. Render-transparency holds in both locales.

### Binding Completeness — PASS

`rg -o '\{(releases\.[a-z]+\.[a-z]+|prereleaseInstall)\}'` returns **7** for each locale component, **14** total. All fourteen enumerated:

| Locale | Line | Expressions |
|--------|------|-------------|
| EN | 8 | `releases.stable.version`, `releases.prerelease.version` |
| EN | 1403 | `releases.stable.version`, `releases.stable.released` |
| EN | 1404 | `releases.prerelease.version`, `releases.prerelease.released`, `prereleaseInstall` |
| ES | 10 | `releases.stable.version`, `releases.prerelease.version` |
| ES | 1426 | `releases.stable.version`, `releases.stable.released` |
| ES | 1427 | `releases.prerelease.version`, `releases.prerelease.released`, `prereleaseInstall` |

No fifth-of-seven omission: the count is exact per locale and the mutation experiment below confirmed all seven sites per locale actually move.

### Tag-Hugging Invariant — PASS

Every one of the 14 expressions renders as `>{expr}<`. A scan for any expression not immediately preceded by `>` or not immediately followed by `<` returned no matches (exit 1). No whitespace exists at the new text-node boundaries for Astro's default `compressHTML: true` to collapse, which is the structural reason byte identity holds across both parse modes.

### Zero Collateral — PASS

| Check | Result |
|-------|--------|
| `git diff --stat b9da430..HEAD -- tests/` | empty — `tests/` untouched across the whole branch |
| `git diff --name-only b9da430..HEAD -- '*.png'` | empty — zero snapshots regenerated |
| Authored source delta | 3 files, +20/-6 = **26 lines** |
| `rg -n "data/versions" tests/` | no matches, exit 1 |

The source diff is confined to the two frontmatter fences plus the six target lines. `@latest` and `@main` command strings are untouched literals in both locales.

### Behavioral Evidence — mutation experiment

Static inspection cannot prove "a release update edits one file". This phase checked out the implementation commit into a throwaway worktree, changed the four recorded facts (`v2.4.0`→`v2.9.9`, `2026-08-17`→`2026-09-30`, `v2.5.0-rc.1`→`v2.9.0-rc.7`, `2026-08-26`→`2026-10-01`), rebuilt, and diffed against the unmutated build. The worktree was removed afterwards; the repository was never modified and is clean.

Result: **exactly 7 tokens changed per locale, in exactly 2 regions per file** (hero `<div class="meta">` and the channel table). Labels `Stable`/`Estable`, `Latest RC`/`Última RC`, `Prerelease`, `Development`/`Desarrollo`, `Channel`/`Canal` were byte-unchanged. `@latest` and `@main` were byte-unchanged. The prerelease install command repinned to `@v2.9.0-rc.7`. Delta pills stayed at 24 per locale. Old-literal occurrence counts dropped by exactly the bound-site count (`v2.4.0` 10→8, `v2.5.0-rc.1` 19→16, `2026-08-17` 2→1, `2026-08-26` 5→4), leaving all authored historical prose intact.

### Spec Compliance Matrix

| Requirement | Scenario | Evidence | Result |
|-------------|----------|----------|--------|
| Single-source channel version facts | A release update edits one file | Mutation experiment: one edit to `src/data/versions.ts`, both locales' hero chips and channel table re-render, no locale component edited | ✅ COMPLIANT |
| Single-source channel version facts | The prerelease install pin follows the recorded fact | Mutation experiment: pin became `…@v2.9.0-rc.7` in both locales; `@latest` and `@main` byte-unchanged | ✅ COMPLIANT |
| Single-source channel version facts | Labels stay authored, only the datum binds | Token-level diff: every label byte-unchanged in both locales; only the datum moved | ✅ COMPLIANT |
| Single-source channel version facts | Binding does not disturb the hero baseline | Independently re-derived baseline; both files byte-identical; `npx playwright test` 28 passed with zero `.png` regenerated | ✅ COMPLIANT |
| Single-source channel version facts | Out-of-reach surfaces are untouched | Only 2 regions and 7 tokens per locale changed under mutation; 24 delta pills, retirement prose and historical references intact | ✅ COMPLIANT |
| Independent version literals | Drift between source and expectation fails | `tests/docs.spec.ts:243` **passed against a fully drifted build** — see CRITICAL-1 | ❌ FAILING |
| Independent version literals | A release update requires a second, human entry | Suite fails on drift only via the hero pixel snapshot; updating the test literals does not make it pass — see CRITICAL-1 | ❌ FAILING |
| Independent version literals | The suite does not read the version module | `rg -n "data/versions" tests/` → no matches, exit 1 | ✅ COMPLIANT |

**Compliance summary**: 6/8 scenarios compliant. Requirements fully satisfied: 1/2.

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| Single-source channel version facts | ✅ Implemented | `src/data/versions.ts` exports `releases` and `prereleaseInstall` only; `goModulePath` is module-local as designed. 14 bindings, byte-identical render. |
| Independent version literals | ⚠️ Partially implemented | Scenario 3 holds. Scenarios 1 and 2 assert a drift-detection property the cited evidence does not deliver. |

### Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| Tag-hugging substitution as the render-transparency mechanism | ✅ Yes | 14/14 sites hug their tags; zero violations; byte identity confirmed |
| `goModulePath` is module-local, not exported | ✅ Yes | `const goModulePath` — not exported |
| Stable and development install commands stay fully literal | ✅ Yes | `@latest` and `@main` byte-unchanged under fact mutation |
| EN frontmatter fence is the only new parse-mode surface | ✅ Yes | 3-line fence with no blank line before `<section class="hero">`; ES import placed between the existing fence lines; `{<>` / `</>}` wrapper untouched |
| Byte-identity protocol (determinism first, then compare) | ✅ Yes | Re-executed independently, including the determinism precondition |
| Never regenerate the four hero PNGs | ✅ Yes | Zero `.png` changed on the branch |

No design deviations found.

### Issues Found

**CRITICAL**

- **CRITICAL-1 — `docs-browser-verification` scenarios 1 and 2 do not hold; the delta would publish a false requirement.**
  The requirement's cited evidence is `tests/docs.spec.ts:245` (literal list) asserted at `:267` via `expect(page.locator('main')).toContainText(literal)`. That assertion only checks that each *test-authored* literal appears somewhere in `main`. It never checks that the *rendered* channel facts appear in the list.
  All four pinned literals also occur in the page as authored historical and narrative prose, which the sibling `docs-content-presentation` requirement deliberately mandates stay authored (`v2.4.0` 10 occurrences, `v2.5.0-rc.1` 19, `2026-08-17` 2, `2026-08-26` 5 — only 1–2 of each are bound). Removing the bound occurrence therefore never empties the page of the literal.
  Reproduced: with all four recorded facts drifted, `npx playwright test -g 'version policy and reference content is localized with exact shared literals'` returned **2 passed**. Scenario 1 ("the assertion for the missing literal fails and names the value") is contradicted by runtime evidence under either reading of "the missing literal".
  Scenario 2 is contradicted differently. The full suite *does* fail on drift — but at `tests/docs.spec.ts:336`, the hero pixel snapshot (`73 pixels (ratio 0.01) are different`, `chromium-desktop` only; `chromium-narrow` is structural since `b9da430`). That failure is owned by the pre-existing "Focused visual evidence" requirement, not by "Independent version literals". Updating the test literals would not make it pass — regenerating the hero PNG baselines would, and the Linux pair is only reachable through `workflow_dispatch update_snapshots`. So "it passes only once a human has updated the test literals to match" is false.
  Causality: `tests/` is byte-identical to the base, so this is **not a regression introduced by the code**. It is a defect in the spec delta this candidate would publish. `Independent version literals` is a genuinely new requirement (no collision in `openspec/specs/`), so archiving would write into the living spec a requirement that the codebase does not satisfy. This is distinct from the accepted "no staleness checker" residual risk, which concerns drift against the real upstream release; this one is an internal double-entry property claimed and cited but not delivered.
  Remedy is a spec correction, not a code change — for example, restate scenarios 1 and 2 to describe what the double-entry actually buys (an independently authored expectation that is not fed by the module), and let the hero snapshot own drift detection; or, if genuine drift detection is wanted, add an assertion that scopes the comparison to the bound sites (`h2#versiones + .tblwrap code`, `.hero .chip b`). The latter enlarges scope beyond this change.

**WARNING**

- **WARNING-1 — `openspec/config.yaml` is stale and would cause severe under-verification.** It declares `testing_capabilities.test_runner.available: false`, `test_command: null`, `workspace_test_command: null`, and `rules.verify.test_command: npm run check`, though Playwright 1.61.0 has landed and 28 browser assertions exist. A verify phase obeying the config would run only `npm run check` and would never execute the browser suite or the byte-identity gate — that is, it would miss the single most important property of this change. This phase used the authoritative command set recorded in `tasks.md` instead. Confirmed still accurate as described in `design.md` Open Questions; fix belongs in a separate change, as designed.
- **WARNING-2 — the `rg` no-import guard is not enforced in CI.** `.github/workflows/docs-browser.yml` does not run it, so a future PR could add `import … from '../src/data/versions'` into `tests/` and land, silently converting the double-entry assertion into a tautology. Confirmed still accurately described as accepted residual risk in `design.md`. Follow-up recommended. CRITICAL-1 raises its weight: the guard is currently the only thing protecting a property whose two behavioral scenarios do not hold.
- **WARNING-3 — branch scope exceeds the change's source scope.** `refactor/version-facts-single-source` also carries `e7dceae`, which modifies `.gitignore` and adds 33 `openspec/` files (archive artifacts, published specs, `config.yaml`). Authored *source* delta is 26 lines, far inside the 400-line budget, but the PR diff a reviewer sees is much larger. Not a defect in this change; flagged so the delivery decision is made knowingly.

**SUGGESTION**

- **SUGGESTION-1** — Only one of the four hero snapshots (`hero-en-chromium-desktop-darwin.png`) actually guards the hero chips against drift; `chromium-narrow` is structural. Single-platform, single-viewport coverage for the surface that CRITICAL-1 leaves unguarded is thin.
- **SUGGESTION-2** — `prereleaseInstall` concatenates `goModulePath` with a recorded fact. This is compliant: the scenario-3 prohibition governs authored narrative sentences, and `design.md` reasons this explicitly as a locale-invariant machine invocation. Recorded here so a future reader does not mistake it for a violation.

### Verdict

**FAIL** — the implementation is exemplary and every code-side gate is green (byte identity independently re-derived, 14/14 bindings, tag-hugging clean, 28 tests passing, zero collateral), but two of the eight spec scenarios are contradicted by runtime evidence, so the `docs-browser-verification` delta must not be archived as written.
