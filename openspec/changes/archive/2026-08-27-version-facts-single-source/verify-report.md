```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:da099157373e36889ff12aa96d32f029c977493e84bccc98ac7518b455a1f3da
verdict: pass_with_warnings
blockers: 0
critical_findings: 0
requirements: 2/2
scenarios: 9/9
test_command: npx playwright test
test_exit_code: 0
test_output_hash: sha256:21fac98d97306ce0b0272f7813b2b7987dad0c1e2d1187187c890232003134c2
build_command: npm run build
build_exit_code: 0
build_output_hash: sha256:132d1fd3ace63a3c1b55a59cffd39e23cd8eb937be5b7ce7c42c28fd23b8f136
```

## Verification Report

**Change**: version-facts-single-source (GitHub issue #30)
**Mode**: Standard (Strict TDD ceremony not applied as originally contracted; see WARNING-2)
**Branch**: `refactor/version-facts-single-source` @ `d581915`
**Base**: merge-base with `main`; source commits `101a7f3` (binding) and `d581915` (assertion remediation)
**Supersedes**: the `fail` report at this path (verdict `fail`, CRITICAL-1, requirements 1/2, scenarios 6/8)

This is a re-verification. Every gate was re-executed against the working tree at `d581915`.
Nothing is restated from the apply report or from the prior verification.

### Disposition of CRITICAL-1 — CLOSED

The prior report failed this change because the `docs-browser-verification` delta claimed a
double-entry property the suite did not have. The only version assertion was the page-wide loop
at `tests/docs.spec.ts:271`, which asserts each authored literal appears somewhere in `main`.
The same identifiers also occur in authored prose that the sibling requirement deliberately
preserves, so all four recorded facts could drift and the assertion still passed.

The remediation was re-proved by independent mutation in a throwaway worktree, not accepted on
report. All four recorded facts in `src/data/versions.ts` were drifted to `v9.9.9` /
`v9.9.9-rc.9` / `2099-01-01` / `2099-01-02`, and the version-policy test was re-run:

```
Error: expect(locator).toContainText(expected) failed
Locator: locator('.hero .meta')
Expected substring: "v2.4.0"
Received string:    "Stable v9.9.9Latest RC v9.9.9-rc.9Go 1.25.10+License MIT16 supported agents"
  at tests/docs.spec.ts:279:28
```

Which assertion fails is the point, and it is now the correct one:

| Assertion | Line | Behaviour under full drift |
|---|---|---|
| Page-wide literal loop over `main` | 271 | **Still passes** — execution reached line 279, so the loop completed |
| Region-scoped `.hero .meta` | 279 | **Fails and names the received value** |
| Region-scoped channel table | 282-284 | Would also fail (proven separately below) |

The root-cause arithmetic is confirmed by literal counts in the built output: `v2.4.0` occurs
**10 times** per locale in the clean build and **8 times** in the mutated build. Exactly 2 of 10
occurrences are bound; the other 8 are authored prose. That 8-versus-2 split is precisely why a
page-wide search cannot detect drift, and it reproduces the original finding independently.

The test aborts at line 279, so the channel-table assertions were verified by extracting the
`.tblwrap` element text from both built locales:

| Build | Locale | `v2.4.0` | `2026-08-17` | `2026-08-26` | `gentle-ai@v2.5.0-rc.1` |
|---|---|---|---|---|---|
| Clean | EN / ES | present | present | present | present |
| Mutated | EN / ES | absent | absent | absent | absent |

All five region-scoped assertions are drift-sensitive, in both locales. CRITICAL-1 is genuinely
closed — the suite now has the property the spec claims, rather than the spec claiming a property
the suite lacked.

### No-import guard — verified in both directions

A guard proved in only one direction is the same defect class as CRITICAL-1, so both were probed.
Guard: `rg -n "from .[^'\"]*data/versions" tests/`.

| Probe | Expected | Result |
|---|---|---|
| `import { releases } from '../src/data/versions';` | match | matched |
| `import {releases} from "../src/data/versions";` (double quotes) | match | matched |
| `import { releases } from '../../src/data/versions.ts';` (deeper path, extension) | match | matched |
| `export { releases } from '../src/data/versions';` (re-export) | match | matched |
| `// Double-entry against src/data/versions.ts.` (explanatory comment) | no match | no match |
| `const v = await import('../src/data/versions');` (dynamic) | match | **no match** — see SUGGESTION-1 |

Against the real tree the guard returns no matches (exit 1). Independently, the suite's complete
import list is a single line: `import { expect, test } from '@playwright/test';` — no version
module import and nothing derived from it.

### Completeness

| Metric | Value |
|--------|-------|
| Tasks marked complete | 21/21 |
| Tasks whose text still matches code state | 19/21 (see WARNING-1, WARNING-2) |
| Requirements verified | 2/2 |
| Scenarios verified | 9/9 |
| CRITICAL | 0 |
| WARNING | 4 |
| SUGGESTION | 3 |

### Execution Evidence

| Gate | Command | Result |
|---|---|---|
| Type check | `npm run check` | 16 files — **0 errors / 0 warnings / 0 hints** |
| Build | `npm run build` | exit 0, 2 pages |
| Browser suite | `npx playwright test` | **28 passed** (30.9s), exit 0 |
| No-import guard | `rg -n "from .[^'\"]*data/versions" tests/` | no matches (exit 1) |
| Snapshot regeneration | `git status --porcelain -- '*.png'` | 0 changed |

The 30.9s suite duration matches the apply-phase baseline of 32.8s. Port 4321 was confirmed free
before the run and every Playwright invocation was sequential, so the earlier port-contention
contamination (implausible durations, unrelated Mermaid/heading failures) did not recur. No run
reported in this document is contaminated.

`openspec/config.yaml` remains stale (`test_runner.available: false`, `test_command: null`). The
authoritative command set from `tasks.md` was used instead, as that file directs.

### Render Transparency — the criterion that did NOT change

The acceptance criterion of zero changes under `tests/` was deliberately retired, but its
*purpose* was render transparency. That purpose is intact and was re-derived, not restated:

| File | Pre-change baseline SHA-256 | Rebuilt at `d581915` | Result |
|---|---|---|---|
| `dist/index.html` | `1b63e55b...4d42b5a` | `1b63e55b...4d42b5a` | **identical** |
| `dist/es/index.html` | `8a80205c...c2652ab` | `8a80205c...c2652ab` | **identical** |

Zero `.png` files regenerated; the Linux `workflow_dispatch` baseline ritual remains unnecessary.
The tag-hugging invariant that makes this structural was re-scanned: 7 bound expressions per
locale (14 total), **0 violations** of the `>{expr}<` rule in either file.

### Spec Compliance Matrix

**docs-content-presentation — Single-source channel version facts (5 scenarios)**

| # | Scenario | Status | Runtime evidence |
|---|---|---|---|
| 1 | A release update edits one file | ✅ PASS | Mutating only `src/data/versions.ts` changed hero chips and channel table in **both** locales; no locale component was edited |
| 2 | Prerelease install pin follows the recorded fact | ✅ PASS | Mutated build renders `gentle-ai@v9.9.9-rc.9` in both locales; `@latest` and `@main` unchanged |
| 3 | Labels stay authored, only the datum binds | ✅ PASS | `Stable`/`Latest RC`/`Channel` and `Estable`/`Última RC`/`Canal` survive mutation unchanged; each binding is a complete text node, no concatenated sentence |
| 4 | Binding does not disturb the hero baseline | ✅ PASS | Byte identity on both built files; 0 snapshots regenerated |
| 5 | Out-of-reach surfaces are untouched | ✅ PASS | Across clean vs mutated builds: `v2.4.0-rc.8` 1→1, `v2.2.0` 1→1, `v1.47.0` 1→1, `class="pill"` 24→24 per locale |

**docs-browser-verification — Independent version literals (4 scenarios)**

| # | Scenario | Status | Runtime evidence |
|---|---|---|---|
| 1 | Drift between source and expectation fails | ✅ PASS | Fails at `tests/docs.spec.ts:279` and names the received value |
| 2 | Page-wide assertion is insufficient | ✅ PASS | Under full drift the page-wide loop at line 271 passed while the region-scoped assertion failed — the trap is demonstrated, not merely asserted |
| 3 | A release update requires a second, human entry | ✅ PASS | Biconditional proved: fails with drift, and passes (1 passed, 4.5s) **only after** the authored `bound` literals were updated to match |
| 4 | The suite does not read the version module | ✅ PASS | Guard returns no matches; sole import is `@playwright/test` |

All 9 scenarios are covered by an assertion that was observed failing when the behaviour is
absent, not merely passing when present.

### Assertion Quality

The added assertions were audited for the trivial patterns that make a test worthless.

| Check | Result |
|---|---|
| Tautologies | None |
| Assertions not exercising production code | None — all run against the built site |
| Ghost loops over possibly-empty collections | None — `for (const region of [...])` iterates a 2-element array literal, and each `toContainText` fails on a non-matching locator rather than vacuously passing |
| Type-only assertions used alone | None |
| Self-referential expectations | None — `bound` is hand-authored and provably not imported |
| Implementation-detail coupling | Locators use `.hero .meta` and `h2#versiones ~ .tblwrap`; these are structural selectors, accepted as the only way to scope a region |

**Assertion quality**: all assertions verify real behaviour. The mutation run is the proof — an
assertion that cannot fail cannot produce the line-279 failure observed above.

### Issues

#### CRITICAL

None. The prior CRITICAL-1 is closed and independently re-proved.

#### WARNING

**WARNING-1 — `tasks.md` task 5.5 still specifies the superseded guard.**
Line 26 of `tasks.md` was updated to the narrowed guard, but task 5.5 at line 73 still reads
`rg -n "data/versions" tests/` — no matches, and is marked `[x]`. That command now returns a
match (`tests/docs.spec.ts:273`, the explanatory comment). The task's literal text contradicts
the code state and the file contradicts itself. The requirement is satisfied by the narrowed
guard, so this is a documentation defect, not a functional one.

**WARNING-2 — `tasks.md` task 5.6 and the apply notes still contract zero changes under `tests/`.**
Task 5.6 asserts "zero changes under `tests/`" and is marked `[x]`; the "Notes for apply" section
repeats "the contract is ZERO changes under `tests/`". `tests/docs.spec.ts` gained 17 lines in
`d581915`. This growth is intentional and correct — it is the remediation of CRITICAL-1 — but the
task text was not updated to match, so a reader of `tasks.md` alone would conclude the change
regressed. The underlying purpose of that criterion (render transparency) is separately verified
above and holds.

**WARNING-3 — Engram artifacts are stale relative to `d581915`.**
`sdd/version-facts-single-source/tasks` and `sdd/version-facts-single-source/apply` still describe
the bare-path guard and state `tests/**` UNCHANGED, with the apply artifact's "Static No-Import
Guard" section citing the superseded command as passing. Archive would carry these forward as
fact. They should be refreshed before archive.

**WARNING-4 — Spec delta evidence citations point at pre-edit line numbers.**
`docs-content-presentation/spec.md:11` cites `DocumentationContentEn.astro:5,1400-1401` and
`DocumentationContentEs.astro:9,1425-1426`; the actual post-edit bindings are EN `8,1403,1404`
and ES `10,1426,1427` — off by the inserted frontmatter fence. `docs-browser-verification/spec.md:13`
cites `tests/docs.spec.ts:270-283` for "authored `bound` facts", but the `bound` object is at
247-250, outside that range. The cited failure line 279 is exactly correct. These deltas merge
into `openspec/specs/` at archive, so the wrong pointers would become canonical.

#### SUGGESTION

**SUGGESTION-1 — The narrowed guard no longer catches a dynamic import.**
`const v = await import('../src/data/versions')` evades the `from`-anchored pattern; the previous
bare-path guard caught it. Narrowing removed one false positive and introduced one false negative.
A pattern such as `rg -n "(from|import\()\s*['\"][^'\"]*data/versions" tests/` would close both.
Low priority while the guard is not enforced anywhere (see SUGGESTION-2).

**SUGGESTION-2 — The guard is still not wired into CI.**
Carried forward from design Open Questions and accurately recorded as accepted residual risk in
the apply artifact. `.github/workflows/docs-browser.yml` does not run it, so a future PR could add
the import and land. Confirmed still open; the accepted-residual description remains accurate.

**SUGGESTION-3 — Issue #30 is only partly addressed.**
The single-source mechanism is delivered; the staleness checker is deferred and out of scope, as
`spec` records (it would have required a build-network requirement). The issue should not be
closed as fully resolved on merge. `openspec/config.yaml` also remains stale, deliberately.

### Verdict

**PASS WITH WARNINGS**

The change satisfies both requirements and all 9 scenarios under runtime evidence. CRITICAL-1 is
genuinely closed: the region-scoped assertions detect drift that the page-wide loop provably
cannot, the guard was proved in both directions, and render transparency survives with byte
identity on both built files and zero regenerated snapshots.

The four warnings are all documentation drift — `tasks.md`, the Engram artifacts, and the spec
delta evidence lines describe a state the code has moved past. None blocks archive on correctness
grounds, but WARNING-3 and WARNING-4 propagate into canonical specs and stored memory if archived
unchanged, and are best corrected first.
