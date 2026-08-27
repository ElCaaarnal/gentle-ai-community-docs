# Archive Report: version-facts-single-source (issue #30)

**Change**: `version-facts-single-source`
**Issue**: #30 (partly addressed — see Carried Forward)
**Branch**: `refactor/version-facts-single-source` @ `2390471`
**PR**: #32, open against `main` at archive time
**Archived**: 2026-08-27 → `openspec/changes/archive/2026-08-27-version-facts-single-source/`
**Artifact store**: hybrid (OpenSpec filesystem + Engram)
**Delivery strategy**: single-pr, 400-line review budget

This report is the terminal record of the cycle. It states the change AT CLOSE
(`2390471`), not at any intermediate snapshot.

## Verdict at close

Independent verification ran at `d581915`: **PASS WITH WARNINGS** — 0 CRITICAL,
4 WARNING, 3 SUGGESTION, requirements 2/2, scenarios 9/9, validated by
`gentle-ai sdd-verify-validate --requirements 2 --scenarios 9` →
`{"valid": true, "verdict": "pass_with_warnings"}`. It superseded a prior `fail`
report (CRITICAL-1, requirements 1/2, scenarios 6/8).

All four WARNINGs were documentation drift, none functional, and all four were
remediated in `2390471` — the commit after the verified one. The archive
therefore closes with **zero open verification warnings**, which is a later state
than `verify-report` (Engram #3967) describes:

| Verify warning (at `d581915`) | State at close (`2390471`) |
|---|---|
| 1. `tasks.md:73` still specified the superseded bare-path guard | Fixed. `tasks.md:73` now reads ``rg -n "from .[^'\"]*data/versions" tests/`` with an explanatory line recording what it superseded. |
| 2. Task 5.6 and "Notes for apply" still contracted "zero changes under `tests/`" | Fixed. `tasks.md:74-75` now contracts zero `.png` changes and byte-identical built HTML, and records the deliberate +17 lines in `tests/docs.spec.ts`. |
| 3. Engram `tasks` (#3965) and `apply` (#3966) stale vs `d581915` | Corrected by Engram **#3968**, a separate observation. Those two observations could not be edited in place, so #3968 is the authoritative correction and MUST be read alongside them. |
| 4. Both spec deltas cited pre-edit line numbers | Fixed in `2390471` and **re-confirmed against the working tree during this archive phase** before merging — see Evidence Re-Confirmation. |

CRITICAL count is 0; no CRITICAL was ever overridden. No stale-checkbox
reconciliation was needed: the persisted `tasks.md` shows 21/21 `[x]` and zero
`- [ ]` entries.

## Evidence Re-Confirmation (performed by this archive phase)

The corrected citations were re-read against the actual files before they were
written into the living specs. A living spec that points at the wrong line sends
the next reader to the wrong place, so none was copied forward on trust.
All eight checks passed; no citation required further correction.

| Citation in the merged requirement | Verified content at that location |
|---|---|
| `DocumentationContentEn.astro:8` | `<div class="meta">` hero chips binding `{releases.stable.version}` and `{releases.prerelease.version}` |
| `DocumentationContentEn.astro:1403` | Stable channel row: `<code>{releases.stable.version}</code> <span class="pill">{releases.stable.released}</span>`, `@latest` left literal |
| `DocumentationContentEn.astro:1404` | Prerelease row binding version, `released`, and `<code>{prereleaseInstall}</code>` |
| `DocumentationContentEs.astro:10` | Hero chips bound; `Estable` / `Última RC` labels remain authored Spanish |
| `DocumentationContentEs.astro:1426-1427` | Stable and Prerelease rows bound identically to EN; `Desarrollo`/`@main` row untouched |
| `src/data/versions.ts` | 10 lines: `ReleaseFact`, module-local `goModulePath`, exported `releases` (`as const satisfies`), exported `prereleaseInstall` |
| `tests/docs.spec.ts:247-250` | `const bound = { stable: {...}, prerelease: {...} };` — authored by hand, exactly at 247-250 |
| `tests/docs.spec.ts:273-284` | Double-entry comment (273-276), `channels` locator (277), region loop (278-281), and the three channel-table assertions (282-284) |
| `tests/docs.spec.ts:279` (named failure line) | `await expect(region).toContainText(bound.stable.version);` — the first assertion inside the `.hero .meta` / channel-table region loop, consistent with the mutation evidence naming locator `.hero .meta` |

## Specs Merged

Both deltas were pure `## ADDED Requirements` against capabilities that already
existed. Neither contained MODIFIED, REMOVED, or RENAMED blocks, so nothing was
dropped, replaced, or rewritten. `rules.archive` in `openspec/config.yaml`
("Warn before merging destructive deltas") had nothing to warn about:
`git diff --numstat` on `openspec/specs/` reports **zero deletions**.

| Domain | Action | Details |
|--------|--------|---------|
| `docs-content-presentation` | Updated | +1 ADDED requirement, **Single-source channel version facts** (5 scenarios), 42 lines added / 0 removed. Inserted at the end of `## Requirements`, before `## Known Issues`. The 8 pre-existing requirements are untouched. |
| `docs-browser-verification` | Updated | +1 ADDED requirement, **Independent version literals** (4 scenarios), 36 lines added / 0 removed. Appended after `Focused visual evidence`. The 2 pre-existing requirements are untouched. |

Source of truth now updated:
- `openspec/specs/docs-content-presentation/spec.md` (128 → 170 lines)
- `openspec/specs/docs-browser-verification/spec.md` (39 → 75 lines)

Mechanical-copy readbacks — all four `diff` runs empty (exit 0):
1. Merged block at `docs-content-presentation/spec.md:121-161` vs the delta block — identical.
2. Merged block at `docs-browser-verification/spec.md:41-75` vs the delta block — identical.
3. New content spec minus the inserted range vs its pristine pre-merge copy — identical.
4. New browser spec minus the inserted range vs its pristine pre-merge copy — identical.

Archive move readback: `diff -r` of the pre-move recursive snapshot against
`openspec/changes/archive/2026-08-27-version-facts-single-source/` — empty, exit 0.

## Archive Contents

- `proposal.md`
- `exploration.md`
- `design.md`
- `specs/docs-content-presentation/spec.md`
- `specs/docs-browser-verification/spec.md`
- `tasks.md` (21/21 complete, zero unchecked)
- `verify-report.md`
- `archive-report.md` (this file — additive, not present in the pre-move snapshot)

## What Shipped

One locale-invariant typed module, `src/data/versions.ts`, holds four recorded
facts (stable version/date, prerelease version/date) and derives one install
string. Both locale content components bind it at 7 sites each. Every
substitution is a tag-hugging replacement of a complete text node, which is what
makes render-transparency structural rather than hoped for.

Byte identity held at `d581915`: `dist/index.html` = `1b63e55b…4d42b5a` and
`dist/es/index.html` = `8a80205c…c2652ab`, both equal to the pre-change
baselines. Zero PNG regenerated, so the Linux `workflow_dispatch update_snapshots`
ritual stayed unnecessary. `npm run check` 0/0/0 (16 files); `npm run build`
exit 0; `npx playwright test` 28 passed.

The suite grew by 17 lines in `tests/docs.spec.ts`. That is the CRITICAL-1
remediation, not a regression. The original "zero changes under `tests/`"
criterion conflated render transparency (still intact and independently
verified) with suite size. The delta had claimed a double-entry property the
suite did not have: `tests/docs.spec.ts:271` asserted each literal appears
somewhere in `main`, but `v2.4.0` occurs 10× per locale and only 2 of those are
bound, so drifting all four facts left the literal on the page and the assertion
passed. Assertions are now scoped to the two bound regions (`.hero .meta` and
`h2#versiones ~ .tblwrap`) and proved by mutation: drift fails at line 279 and
names the received value, while the page-wide loop at 271 still passes — which
is exactly the scenario "Page-wide assertion is insufficient" now recorded in
the living `docs-browser-verification` spec.

## Carried Forward (open after this change)

1. **Issue #30 is only PARTLY addressed. Do not close it as fully resolved.**
   This change lowers the *cost* of a release edit — four live facts now live in
   one file. It does **not** detect drift. The scheduled staleness checker
   (`check:versions`) was deliberately deferred at proposal time with its own
   unresolved decisions (API rate limits, pagination, failure semantics).
2. **The no-import guard is not wired into CI.** ``rg -n "from .[^'\"]*data/versions" tests/``
   runs in the verify phase only; `.github/workflows/docs-browser.yml` does not
   run it, so a future PR could add the import and land. Accepted residual risk,
   confirmed still open, recorded accurately in both `design.md` (Open Questions)
   and `tasks.md`.
3. **Known limitation of that guard**: it misses a dynamic
   `await import('../src/data/versions')`, which the superseded bare-path form
   caught. Suggested closure of both directions:
   ``rg -n "(from|import\()\s*['\"][^'\"]*data/versions" tests/``. Low priority
   while the guard is not in CI.
4. **`openspec/config.yaml` is stale.** It still declares
   `test_runner.available: false` and `test_command: null` though Playwright
   1.61.0 has landed, and `rules.verify.test_command` is `npm run check`. It was
   worked around in-band all cycle by the authoritative command set recorded in
   `tasks.md` and passed explicitly to the verify phase. **Open follow-up; not
   fixed here** — deliberately, because bundling a `"test"` script into
   `package.json` would make the runner look configured while the config still
   declares it absent.
5. **Named follow-ups from the proposal**: extracting shared `<VersionChips>` /
   `<ChannelTable>` components, and normalizing the ES `{<>…</>}` wrapper.

## Artifact Traceability (Engram observation IDs)

| Artifact | Engram ID | Topic |
|---|---|---|
| exploration | #3961 | `sdd/version-facts-single-source/explore` |
| proposal | #3962 | `sdd/version-facts-single-source/proposal` |
| spec deltas | #3963 | `sdd/version-facts-single-source/spec` |
| design | #3964 | `sdd/version-facts-single-source/design` |
| tasks | #3965 | `sdd/version-facts-single-source/tasks` |
| apply progress | #3966 | `sdd/version-facts-single-source/apply` |
| verify report | #3967 | `sdd/version-facts-single-source/verify` |
| post-verify correction | #3968 | (untitled bugfix — corrects #3965 and #3966) |
| archive report | this file | `sdd/version-facts-single-source/archive` |

**Stale-snapshot notes for future readers** — these Engram observations describe
earlier states and must not be read as the final one:
- #3965 (tasks) and #3966 (apply) predate CRITICAL-1. **Always read #3968 with
  them.** The canonical `tasks.md` in this archive folder is correct as of
  `2390471`; the Engram copies are not byte-equivalent to it.
- #3963 (spec) is a pre-remediation summary: it records the
  `docs-browser-verification` delta as 3 scenarios with evidence at
  `tests/docs.spec.ts:245,267`, and the content delta at `En:5,1400-1401` /
  `Es:9,1425-1426`. The delta that was actually merged into the living specs has
  **4** browser scenarios (the fourth being "Page-wide assertion is
  insufficient") and the corrected citations verified above. The merged living
  specs, not #3963, are the source of truth.
- #3967 (verify) is accurate for `d581915` and lists 4 warnings. All four closed
  in `2390471`, as tabulated above.

## Cycle Status

Planned, implemented, independently verified (PASS WITH WARNINGS, 0 CRITICAL,
all warnings since closed), specs merged, and archived. Delivery of PR #32
follows ordinary repository policy and is not decided by this report.
