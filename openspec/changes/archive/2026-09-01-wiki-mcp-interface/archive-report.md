# Archive Report: wiki-mcp-interface (issue #34)

**Change**: `wiki-mcp-interface`
**Issue**: #34
**Branch**: `unit-5-get-section-client-test` — candidate uncommitted at archive time
**PR**: none opened
**Archived**: 2026-09-01 → `openspec/changes/archive/2026-09-01-wiki-mcp-interface/`
**Artifact store**: hybrid (OpenSpec filesystem + Engram)
**Delivery strategy**: ask-on-risk, 400-line review budget, feature-branch chain

This report is the terminal record of the cycle. It states the change AT CLOSE.

## Verdict at close

Independent verification round 3: **PASS** — 0 CRITICAL, 0 blockers, 2 WARNING,
2 SUGGESTION. Requirements 30/30 and scenarios 42/42 assessed. Evidence revision
`sha256:272e11edd62ccf6eca1c5c40ee608d82f8201e1094c0357e40cc5a4b3c223ef4`,
validated by `gentle-ai sdd-verify-validate` → `valid=true`, `verdict: pass`.

Native status at close: `verify: all_done`, `archive: ready`, `blockedReasons: []`,
`remediationState.required: false`, tasks 41/41.

## Verification history — three rounds

| Round | Evidence | Verdict | Findings |
|---|---|---|---|
| 1 | `sha256:510f7881…d2f40` | fail | C1 automated coverage incomplete; C2 strict-TDD apply-progress evidence incomplete |
| 2 | `sha256:5649e39a…57138` | fail | C2 closed, C1 partially closed; NEW V1 empty-query path uncovered, V2 `get_section` per-locale resolution uncovered |
| 3 | `sha256:272e11ed…23ef4` | **pass** | V1 and V2 closed; `tools.mjs` integrity confirmed |

Both blocker pairs shared one class: **runtime behavior that is correct but that
no test asserts**. A green suite and a valid envelope never established coverage;
only per-claim confirmation did.

## Corrections recorded during the cycle

1. **A false coverage claim was published and then corrected.** The Unit 4
   TRIANGULATE row in Engram `sdd/wiki-mcp-interface/apply-progress` claimed
   `tests/mcp-http.spec.ts` covered the empty-query error path. It did not. Round 2
   caught it as V1. The topic now opens with an explicit correction notice, and the
   row states plainly that the path was uncovered until the V1/V2 remediation.
2. **"No production file was changed" was imprecise.** True as net content, false as
   file writes: restoring `mcp-server/src/tools.mjs` from the discrimination-probe
   backup is itself a write, and its mtime is later than the test file's. Bytes are
   unchanged and digest-verified.

## Strict-TDD evidence disposition

Historical RED was NOT back-filled. Units 1, 2, the Unit 1 container-heading fix,
the Unit 3a truthiness fix, and cleanup have recorded RED in the native attempt
ledger. Units 3, 4 and 5 have **no recorded RED** and are marked permanently
unreconstructible rather than reconstructed from currently-green tests.
Independent verification reviewed that gap and judged it non-blocking: strict-TDD
RED is checkable by test-file existence rather than a historical log.

For the final V1/V2 remediation no natural RED was reachable, because production
was already correct. Discrimination was proven instead by deliberately breaking
both guards, observing the three new tests fail, then restoring from backup and
verifying the SHA-256 digest identical
(`0e8327018b802b61899f5a58b4da17b753c561f7df38d9f9aa3c4c862d24fa78`).

## Suite at close

| Check | Result |
|---|---|
| `npm run check` | 0 errors, 0 warnings, 0 hints (30 files) |
| `npx vitest run` | 49/49 |
| `npx playwright test` | 55/55 |
| `npx playwright test --project=mcp-http` | 27/27 |
| `npm run build` | 190 sections — 95 EN, 95 ES |

## Capabilities promoted to the living spec set

- `openspec/specs/docs-mcp-adoption/spec.md`
- `openspec/specs/docs-mcp-deployment/spec.md`
- `openspec/specs/docs-mcp-index/spec.md`
- `openspec/specs/docs-mcp-interface/spec.md`

All four are new capabilities; none modified an existing spec, so promotion was a
direct copy with no delta merge.

## Carried forward — two open WARNINGs, neither blocking

1. **`/health` has no automated test.** Implemented at `mcp-server/src/http.mjs:60`
   and evidenced only by live probe. The `mcp-http` Playwright project already boots
   the server, so one assertion closes it. The Automated Coverage requirement
   enumerates schemas, retrieval, parity and client consumption — not `/health` —
   so this is a coverage gap, not a requirement failure.
2. **Layer mismatch on the error-vs-empty decision.** The decision lives at
   `mcp-server/src/tools.mjs:84`. Its error branch is asserted at the wire layer;
   its sibling "valid query matching nothing" branch is asserted at
   `mcp-server/src/search.test.mjs:79` against `search()`, not the tool wrapper.

## Deviation disclosed

The provider-owned runtime state file `.gentle-ai-instance` was moved with the
change folder rather than deleted. Earlier archives in this repository contain no
such file. Moving it keeps provider-owned state paired with its change and
destroys nothing; it is recoverable if the runtime expects it elsewhere.

## Delivery

Nothing was committed, pushed, or opened as a pull request during this cycle. The
candidate remains uncommitted on `unit-5-get-section-client-test`. Delivery is a
separate human decision under ordinary repository policy.
