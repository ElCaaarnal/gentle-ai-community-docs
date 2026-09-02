```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:272e11edd62ccf6eca1c5c40ee608d82f8201e1094c0357e40cc5a4b3c223ef4
verdict: pass
blockers: 0
critical_findings: 0
requirements: 30/30
scenarios: 42/42
test_command: npx vitest run && npx playwright test
test_exit_code: 0
test_output_hash: sha256:48f9c039e985a5618b8fddcdf61db6555538d667fb0941f689d91eb9dc49ee72
build_command: npm run build
build_exit_code: 0
build_output_hash: sha256:03d7ef409df6aa80a539c5ea738b8a958339d06b397d8f1912d5e3d4d1c85bfb
```

## Verification Report

**Change**: wiki-mcp-interface
**Mode**: Strict TDD
**Round**: 3 (independent, after the V1/V2 remediation)
**Supersedes**: `sha256:5649e39a...57138` (FAIL, 2 blockers)

### Completeness

| Metric | Value |
|---|---|
| Tasks total | 41 |
| Tasks complete | 41 |
| Tasks incomplete | 0 |

### Build & Tests Execution

All commands re-run in this round; no prior-round result was reused.

| Command | Exit | Result |
|---|---|---|
| `npm run check` | 0 | 30 files, 0 errors / 0 warnings / 0 hints |
| `npx vitest run` | 0 | 4 files, 49/49 passed |
| `npx playwright test` | 0 | 55/55 passed |
| `npm run build` | 0 | 190 sections indexed (en=95, es=95) |
| `npx playwright test --project=mcp-http` | 0 | 27/27 passed in 3.46s wall clock |

**Coverage**: no coverage tool configured — skipped, not a failure.

### Prior Blockers

| ID | Status | Runtime evidence |
|---|---|---|
| V1 — empty/whitespace `query` unasserted | **CLOSED** | `tests/mcp-http.spec.ts:298` parameterized over `''` and `'   '`; both executed and passed (tests 27, 28). Each asserts `isError === true`, exact text `query must not be empty`, and `structuredContent` absent. |
| V2 — `get_section` per-locale resolution unasserted | **CLOSED** | `tests/mcp-http.spec.ts:317` executed and passed (test 29): asserts `locale`, `title` (`Instalación` vs `Installation`), `/es/` URL prefix, and differing body text for the same id. |
| C1 / C2 (round 1) | Remain closed | Unchanged since `sha256:5649e39a...57138`. |

Neither blocker was closed by a vacuous assertion: the fixture at
`mcp-server/test/fixtures/docs-index.json` carries genuinely distinct `installation`
records per locale (different title, different `/es/` URL, 282 vs 151 chars of body).

### Production Integrity — `mcp-server/src/tools.mjs`

The remediation deliberately mutated this file to prove test discrimination. Verified intact:

| Check | Result |
|---|---|
| SHA-256 of working tree | `0e8327018b802b61899f5a58b4da17b753c561f7df38d9f9aa3c4c862d24fa78` — matches the reported digest |
| Empty-query guard | Present and correct at `tools.mjs:84` (`if (!query.trim())`), message at `:87` |
| Locale guard | Present and correct at `tools.mjs:168` (`find((s) => s.id === id && s.locale === locale)`) |
| Mutation fragments | `rg "if \(false\)"` over the repository: zero matches |
| Scratchpad backup vs working tree | `diff` byte-identical |
| Live behavior, real 190-section index | Whitespace query returns `isError:true`, `query must not be empty`, no `structuredContent`; id `requisitos-previos` resolves to distinct title/URL/body per locale |

**Finding: `tools.mjs` is intact.** Both guards are not merely present in source, they are
active at runtime against production data, which no source-only inspection could establish.

A timing anomaly was measured rather than assumed: the backup→restore window was 4s
(22:53:03 → 22:53:07). The focused `mcp-http` project completes in 3.46s wall clock, so the
mutate/observe/restore sequence fits. The reported probe count (3 failed / 20 passed = 23)
equals `tests/mcp-http.spec.ts` alone, consistent with the 27-test project minus the 4
`mcp-client.spec.ts` tests.

### Implementer Claim Audit

| # | Claim | Verdict |
|---|---|---|
| 1 | V1 suite added with exact message and absent `structuredContent` | Confirmed |
| 2 | V2 per-locale resolution test added | Confirmed |
| 3 | No production file changed in this remediation | Confirmed **as net content**. `tools.mjs` was written during the window (mtime 22:53:07, 20s after the test file), but its bytes equal the pre-mutation backup and both guards are correct. The write is the restore, not a change. |
| 4 | False Unit 4 TRIANGULATE claim corrected in Engram | Confirmed — `sdd/wiki-mcp-interface/apply-progress` (obs #4194) opens with an explicit correction notice and the corrected Unit 4 row |
| 5 | check 0 / vitest 49 / playwright 55 / build 190 (95 EN / 95 ES) | Confirmed by re-execution |

### Spec Compliance Summary

30 requirements and 42 scenarios assessed. Automated runtime coverage maps as follows.

| Spec | Coverage |
|---|---|
| `docs-mcp-interface` (9 req / 14 scen) | COMPLIANT. Ranking, locale-scoped search, bounded 400-char snippet, empty-result path, all three error paths, build identity, and SDK client consumption all covered by passing tests. |
| `docs-mcp-index` (5 req / 10 scen) | COMPLIANT. Extraction fidelity, parity guard (positive and negative), build identity, and the three extraction-failure scenarios covered by `extract.test.mjs` and `build-mcp-index.test.mjs`. |
| `docs-mcp-deployment` (11 req / 12 scen) | COMPLIANT with warnings. Transport, 405s, Origin, Host, and 1 MB limit covered at wire level. Proxy rate limiting, host preparation, static-site independence, and publish-without-restart are infrastructure scenarios evidenced by `docs/mcp-server-operations.md`. |
| `docs-mcp-adoption` (5 req / 6 scen) | COMPLIANT via recorded manual evidence across four client runtimes, plus the automated SDK client test that runs in CI without credentials. |

### Independent Findings (this round)

No further instance of the V1/V2 class — a correct runtime path with zero assertions
anywhere — was found. Two layer-placement gaps were found instead; both behaviors are
asserted somewhere and were live-probed as correct, so neither blocks.

**CRITICAL**: None.

**WARNING**:

1. `/health` has no automated test. `mcp-server/src/http.mjs:60` implements it and the
   deployment scenario "Health reflects the currently loaded index" is evidenced only by a
   live probe (this round: `{"ok":true,"sections":190,...}`). The `mcp-http` Playwright
   project already boots the server, so one `GET /health` assertion would close this. It is
   not a blocker: the "Automated Coverage" requirement enumerates schemas, retrieval, parity,
   and client consumption, and does not include `/health`.
2. The empty-result path is asserted one layer below the decision that governs it. The
   error-vs-empty branch lives at `mcp-server/src/tools.mjs:84`; only its error branch is
   asserted at the wire layer. "Valid query matching nothing" is asserted at
   `mcp-server/src/search.test.mjs:79`, which exercises `search()`, not the tool wrapper. A
   live probe returned `count: 0` with no `isError`, so behavior is correct today.

**SUGGESTION**:

1. Strict-TDD RED is absent for remediation 2, and the omission is recorded honestly rather
   than back-filled. Judged **acceptable**. RED exists to prove a test fails when the
   behavior is absent. Here the behavior already existed and was correct, so no natural RED
   was reachable; the only way to produce one is to break production, which is exactly what
   the discrimination probe did — reverted, digest-verified, and independently confirmed
   above. The probe establishes the property RED is meant to establish. Fabricating a RED
   entry, or claiming production was broken when it was not, would have been the integrity
   failure. The standing rule the apply-progress correction records — TRIANGULATE rows are
   claims, not evidence — is the right response to how V1 survived two rounds.
2. All change content is uncommitted: 10 modified tracked files and 10 untracked candidate
   files. Commit and delivery remain separate human decisions under ordinary repository
   policy.

### Verdict

**PASS WITH WARNINGS** — V1 and V2 are closed by tests that were confirmed to execute, to
discriminate, and to match live production behavior; `mcp-server/src/tools.mjs` is intact
with both guards active; the full suite and build were re-run green in this round. Two
non-blocking layer-placement warnings remain. 0 blockers, 0 critical findings.
