# Tasks: Read-Only MCP Interface Over the Published Wiki

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | Unit1 ~300, Unit2 ~165, Unit3 ~350, Unit4 ~350, Unit5 ~250, Unit6 ~220, Unit7 ~260 (total ~1895) |
| 400-line budget risk | Medium (Units 3 and 4 sit near the cap at ~350) |
| Chained PRs recommended | Yes |
| Suggested split | 7 chained work units, PR 1 → PR 7 (see Dependency Order); spike removal is local cleanup, no PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | feature-branch-chain (user-selected) |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: Medium

`chain_strategy` was not cached at session start. The orchestrator MUST ask the user to choose
`stacked-to-main`, `feature-branch-chain`, or `size-exception` before `sdd-apply` starts Unit 1,
per the review workload guard (`ask-on-risk` → decision required).

### Suggested Work Units

| Unit | Goal | Est. lines | Risk | Focused test command | Runtime harness | Rollback boundary |
|---|---|---|---|---|---|---|
| 1 | Extraction module + Vitest wiring + CI path-filter fix | ~300 | Low | `npx vitest run scripts/lib/extract.test.mjs` | N/A — no server yet, pure fn tests only | Drop `scripts/lib/`, `vitest.config.mjs`; revert workflow/package.json/config.yaml edits |
| 2 | Generator CLI + parity fail + build wiring | ~165 | Low | `npx vitest run scripts/build-mcp-index.test.mjs` | `npm run build` produces `dist/mcp/docs-index.json` | Drop `scripts/build-mcp-index.mjs`; revert `build` script hook |
| 3 | Index store + scoring (pure, no HTTP) | ~350 | Medium | `npx vitest run mcp-server/src/index-store.test.mjs mcp-server/src/search.test.mjs` | N/A — no transport yet | Drop `mcp-server/` workspace entirely; revert root `workspaces` field |
| 4 | HTTP transport + `search_docs`/`list_sections` | ~350 | Medium | `npx playwright test tests/mcp-http.spec.ts --project=mcp-http` | `node mcp-server/src/server.mjs` against fixture index | Drop `http.mjs`/`tools.mjs`/`server.mjs`; server stays unrouted |
| 5 | `get_section` + AC8 client test | ~250 | Low | `npx playwright test tests/mcp-client.spec.ts tests/mcp-http.spec.ts --project=mcp-http` | SDK `Client` over Streamable HTTP vs. fixture server | Revert `get_section` registration; two earlier tools keep serving |
| 6 | Deployment/operations docs | ~220 | Low (blocked by open Qs) | N/A — docs only | Manual: dry-run `deploy.sh` steps against a staging checkout | Documentation-only revert |
| 7 | Adoption/setup docs + client configs | ~260 | Low | N/A — config + docs | Manual: invoke each of the 4 agents, confirm server log entries | Delete client config files; agents stop discovering the server |
| 8 | Remove `spike/mcp/` | ~330 del. | Low cognition, high count | `npx vitest run && npx playwright test` (regression only) | N/A — deletion only | Restore two files from git history |

## Design Deviation Note

Design's slice mapping (`design.md` → Slice Mapping table) put the CI workflow fix in slice **1b**
(Unit 2 here). The orchestrator's hard requirement #3 overrides this: the workflow's `paths` filter
matches `**.js`, not `.mjs`, so every file this change adds is invisible to CI until fixed, and
`scripts/generate-banner.mjs` stays uncovered today regardless. Deferring the fix to Unit 2 would
leave Unit 1's new Vitest suite unverified by CI. This plan moves the path-filter fix, the
`test:unit` CI step, and the `openspec/config.yaml` testing-block update into **Unit 1** instead, so
CI verifies every unit from the first one onward. Unit 2's estimate drops from design's ~190 to
~165 to reflect the removed workflow/config lines; Unit 1's estimate rises from ~280 to ~300.

## Dependency Order

```
Unit 1 (CI fix, Vitest, extraction) ──┬──► Unit 2 (generator CLI)
                                       │
                                       └──► Unit 3 (index-store + search) ──► Unit 4 (HTTP + 2 tools)
                                                                                    │
                                                                                    ▼
                                                                              Unit 5 (get_section, AC8)
                                                                                    │
                                                              ┌─────────────────────┼─────────────────────┐
                                                              ▼                     ▼                     ▼
                                                        Unit 6 (deploy docs)  Unit 7 (adoption docs)  Unit 8 (delete spike/)
                                                        [needs Unit 2 too]
```

- Units 2 and 3 both depend only on Unit 1 and touch disjoint files (`scripts/` vs `mcp-server/`) —
  **can proceed in parallel**.
- Unit 4 depends on Unit 3's `index-store.mjs`/`search.mjs` exports, not on Unit 2's generator
  (tests run against the committed fixture, not `dist/`).
- Units 6, 7, 8 all depend on Unit 5 (spike removal per rollback plan is safe "only after slice 3",
  i.e. this plan's Unit 5) but are mutually independent — **can proceed in parallel**.
- Unit 6 additionally needs Unit 2 (the `deploy.sh` runbook documents the real `npm run build` hook).
- **Open questions block only Unit 6**: VPS Node version, nginx public hostname/TLS, and
  `MIN_SECTIONS` floor. `MIN_SECTIONS` is set with headroom inside Unit 2 (not blocking); the other
  two block finishing Unit 6's runbook content specifically (tasks 6.1/6.2 below). Units 1–5, 7, 8
  are not blocked by any open question.

## Unit 1: Extraction Module + Vitest Wiring + CI Path-Filter Fix

- [x] 1.1 Add `vitest` devDependency and a `test:unit` script (`vitest run`) to `package.json`.
- [x] 1.2 Create `vitest.config.mjs` — `environment: 'node'`, `include: ['scripts/**/*.test.mjs', 'mcp-server/**/*.test.mjs']`, `exclude: [...configDefaults.exclude, 'tests/**', 'dist/**']`.
- [x] 1.3 Fix `.github/workflows/docs-browser.yml`: add `'**.mjs'` and `'mcp-server/**'` to the `pull_request.paths` list; add a `run: npm run test:unit` step after `npm run check`.
- [x] 1.4 Update `openspec/config.yaml` testing block: add a `unit` layer (`available: true`, `tool: Vitest 4.1.11`, command `npx vitest run`).
- [x] 1.5 RED — create `scripts/lib/extract.test.mjs` with HTML fixtures under `scripts/lib/fixtures/`: assert `<pre>` line breaks survive extraction, link `href` is retained alongside its label, missing canonical link throws, missing `<main>` throws, zero headings throws, a section with empty `text` throws. Run `npx vitest run scripts/lib/extract.test.mjs` — expect failure (module absent).
- [x] 1.6 GREEN — create `scripts/lib/extract.mjs`, porting the pure extraction logic from `spike/mcp/build-index.mjs` (read-only) into exported functions (`toText`, `baseUrlOf`, `extractSections`) with the guards above. Run `npx vitest run scripts/lib/extract.test.mjs` — expect pass.

## Unit 2: Generator CLI + Parity Fail + Build Wiring

- [ ] 2.1 RED — create `scripts/build-mcp-index.test.mjs` with `dist/index.html`/`dist/es/index.html` fixtures (via `DIST_DIR` env): assert a valid pair writes `docs-index.json` with `{schemaVersion:1, generatedAt, commit, sectionCount, base, locales, sections}`; assert an EN/ES id mismatch exits non-zero and writes **no** file; assert `sectionCount < MIN_SECTIONS` exits non-zero. Run `npx vitest run scripts/build-mcp-index.test.mjs` — expect failure.
- [ ] 2.2 GREEN — create `scripts/build-mcp-index.mjs`, porting `spike/mcp/build-index.mjs` (read-only) into the CLI: add `schemaVersion: 1`, `commit` from `$COMMIT_REF`/`git rev-parse --short HEAD` falling back to `"unknown"`, a `MIN_SECTIONS` constant set with headroom above the measured 190, and fail-fast EN/ES parity (non-zero exit, no partial write). Run `npx vitest run scripts/build-mcp-index.test.mjs` — expect pass.
- [ ] 2.3 Wire the generator into `package.json`'s `build` script: `astro build && node scripts/build-mcp-index.mjs`.

## Unit 3: Index Store + Scoring (Pure, No HTTP)

- [ ] 3.1 Create `mcp-server/package.json` — workspace package, `version` field as the release identifier, dependencies `express`, `@modelcontextprotocol/sdk`, `zod`.
- [ ] 3.2 Add `"workspaces": ["mcp-server"]` to root `package.json`; run `npm install` to hoist the SDK/zod/express to one pinned root version.
- [ ] 3.3 Create `mcp-server/test/fixtures/docs-index.json` — small deterministic EN/ES fixture matching the `schemaVersion: 1` contract (≥4 sections per locale, at least one shared id per locale for parity-style assertions).
- [ ] 3.4 RED — create `mcp-server/src/index-store.test.mjs`: assert a valid fixture loads and exposes build identity `{schemaVersion, generatedAt, commit, sectionCount}`; assert an unrecognised `schemaVersion`, a missing top-level field, empty `sections`, and a section missing `id`/`locale`/`title`/`url`/`text` each throw (threat-matrix case: index unknown `schemaVersion`). Run `npx vitest run mcp-server/src/index-store.test.mjs` — expect failure.
- [ ] 3.5 GREEN — create `mcp-server/src/index-store.mjs`: load + validate the index file, expose `getBuildIdentity()` and `getSections()`; throw (never warn-and-continue) on any unrecognised shape. Run `npx vitest run mcp-server/src/index-store.test.mjs` — expect pass.
- [ ] 3.6 RED — create `mcp-server/src/search.test.mjs`: assert a precisely-relevant short section outranks a longer weakly-relevant one under BM25-lite scoring; EN/ES stopwords are excluded from term weighting; `locale` narrows the candidate pool; a produced snippet never exceeds 400 chars; a well-formed query with zero matches returns an empty array, not an error. Run `npx vitest run mcp-server/src/search.test.mjs` — expect failure.
- [ ] 3.7 GREEN — create `mcp-server/src/search.mjs`, porting `norm`, `STOP`, `search`, and `snippet` from `spike/mcp/server.mjs` (read-only) into pure exports with zero `express`/SDK imports. Run `npx vitest run mcp-server/src/search.test.mjs` — expect pass.

## Unit 4: HTTP Transport + `search_docs` / `list_sections`

- [ ] 4.1 RED — create `tests/mcp-http.spec.ts` (Playwright `request`, fixture-backed server): missing `Origin` proceeds; `Origin: null` → `403 forbidden origin`; untrusted `Origin` host → `403 forbidden origin`; `Host` outside allow-list rejected before MCP processing; `GET /mcp` → `405`; `DELETE /mcp` → `405`; body over `1mb` rejected; valid `search_docs` and `list_sections` calls succeed and carry the index build identity. Run `npx playwright test tests/mcp-http.spec.ts --project=mcp-http` — expect failure (server absent).
- [ ] 4.2 Modify `playwright.config.ts`: add `testMatch: 'docs.spec.ts'` to the existing `chromium-desktop`/`chromium-narrow` projects, add an `mcp-http` project (`testMatch: 'mcp-*.spec.ts'`, `use.baseURL: 'http://127.0.0.1:3111'`), add a second `webServer` entry starting `mcp-server/src/server.mjs` against `mcp-server/test/fixtures/docs-index.json`. `testDir` stays unchanged.
- [ ] 4.3 GREEN — create `mcp-server/src/http.mjs`, porting the Express app from `spike/mcp/server.mjs` (read-only): request-logging middleware, `express.json({limit:'1mb'})`, `hostHeaderValidation`, an origin-validation middleware that accepts a missing `Origin` and rejects `null`/untrusted with `403 forbidden origin`, `GET /health` (ok, section count, build identity), `POST /mcp` (fresh `McpServer` + `StreamableHTTPServerTransport` per request, `sessionIdGenerator: undefined`, `enableJsonResponse: true`), `405` handlers for `GET`/`DELETE /mcp`.
- [ ] 4.4 GREEN — create `mcp-server/src/tools.mjs`: register `search_docs` (`query` required string, `locale?` `z.enum(['en','es'])`, `limit?` `1..20` default `5`; empty/whitespace `query` → typed `isError` response, never empty success) and `list_sections` (`locale?`, returns id/title/level/locale only, no body text); every response includes the index build identity.
- [ ] 4.5 GREEN — create `mcp-server/src/server.mjs`: bootstrap reading `PORT`, `ALLOWED_HOSTS`, `ALLOWED_ORIGINS`, `DOCS_INDEX_PATH` env vars, validates the index via `index-store.mjs` before `listen()`, `process.exit(1)` on an invalid shape. Run `npx playwright test tests/mcp-http.spec.ts --project=mcp-http` — expect pass.
- [ ] 4.6 Run `npx playwright test` (full suite) and confirm the existing 14 `tests/docs.spec.ts` tests plus the new `mcp-http` project all pass with no Vitest/Playwright discovery collision.

## Unit 5: `get_section` + AC8 Client Test + Error Paths

- [ ] 5.1 RED — extend `tests/mcp-http.spec.ts`: valid `id`+`locale` returns the full untruncated body with code blocks and links intact; unknown `id` for a given `locale` → typed error naming both; missing `locale` → schema validation error; `locale` outside `en`/`es` → typed error naming the received value; adversarial `id` values `../etc/passwd`, `%00`, and a 10 KiB string → typed unknown-id error, never resolved as a filesystem path (threat-matrix case). Run `npx playwright test tests/mcp-http.spec.ts --project=mcp-http` — expect failure.
- [ ] 5.2 GREEN — add `get_section` to `mcp-server/src/tools.mjs`: `id` (string, required), `locale` (`z.enum(['en','es'])`, required); look up by the `(id, locale)` pair as a map key only, never a path; typed error on no match; success returns `{id, locale, title, level, url, text}` untruncated plus build identity. Run `npx playwright test tests/mcp-http.spec.ts --project=mcp-http` — expect pass.
- [ ] 5.3 RED — create `tests/mcp-client.spec.ts` using `@modelcontextprotocol/sdk` `Client` over Streamable HTTP against the fixture-backed server: complete `initialize`, `tools/list`, and one `tools/call` (`get_section` on a known fixture id); assert the negotiated protocol version, the three advertised tool schemas, and the exact returned section text. Run `npx playwright test tests/mcp-client.spec.ts --project=mcp-http` — expect failure or gap.
- [ ] 5.4 GREEN — close any gap 5.3 surfaces (e.g. explicit `McpServer({name, version})` sourced from `mcp-server/package.json`'s `version`). Run `npx playwright test tests/mcp-client.spec.ts --project=mcp-http` — expect pass.
- [ ] 5.5 Run `npx vitest run && npx playwright test` — full regression, including the untouched 14 `docs.spec.ts` tests.

## Unit 6: Deployment / Operations Docs

- [ ] 6.1 [Blocked — open question: VPS Node version] Confirm the VPS Node runtime satisfies `^20 || ^22 || >=24` before documenting `ExecStart`.
- [ ] 6.2 [Blocked — open question: nginx hostname/TLS] Obtain the real public hostname and TLS termination detail for the `/mcp` `location` block.
- [ ] 6.3 Create `docs/mcp-server-operations.md`: `gentle-ai-docs-mcp.service` (WorkingDirectory, `ExecStart=/usr/bin/node mcp-server/src/server.mjs`, `EnvironmentFile`, `Restart=on-failure`, `RestartSec=5`, `NoNewPrivileges=yes`, `ProtectSystem=strict`, `ProtectHome=yes`, `PrivateTmp=yes`, `MemoryMax=512M`); nginx `limit_req_zone`/`location /mcp` block (`limit_req burst=10 nodelay`, `client_max_body_size 1m`, `proxy_read_timeout 30s`, `proxy_buffering on`, `/health` proxied internally); the one-step `deploy.sh` runbook (`git fetch --prune && git checkout <ref> && npm ci && npm run build && sudo systemctl restart gentle-ai-docs-mcp`); the staleness-is-observable note (build identity in `/health` and every tool response); supported MCP protocol version and the server's release identifier.
- [ ] 6.4 Update `README.md` with a pointer to `docs/mcp-server-operations.md` and the second-deployable (VPS vs. Netlify) note.

## Unit 7: Adoption / Setup Docs + Client Configs

- [ ] 7.1 Fix `.gitignore`: replace the `.pi/` line with `.pi/*` plus `!.pi/mcp.json`, matching the existing `.claude/*` / `!.claude/commands/` precedent, so the repo-local Pi config can be committed.
- [ ] 7.2 Create `.claude/commands/wiki.md` — project-scoped Claude Code command whose `allowed-tools` frontmatter exposes only the MCP documentation tool.
- [ ] 7.3 Create `opencode.json` registering the MCP server, plus a project-scoped `.opencode/` agent whose permissions deny non-MCP categories and a bound project command.
- [ ] 7.4 Create `.pi/mcp.json` (repo-local, consumable via `--mcp-config`) and a corresponding project-scoped skill under `.agents/skills/`.
- [ ] 7.5 Create `.codex/config.toml` and a Codex skill documenting registration via `codex mcp add` and granting project trust through Codex's own interactive prompt — never a hand-edited `~/.codex/config.toml`.
- [ ] 7.6 Create `docs/mcp-client-setup.md`: a working example and explicit scope statement for each of Claude Code, OpenCode, Pi, and Codex; document OpenCode's isolation caveat (breaks once a second MCP server is registered) and Codex's documented spontaneous-invocation limitation (guaranteed only on explicit request).
- [ ] 7.7 Manual verification: invoke each of the four agents against a running server instance; confirm the server request log records the tool call for Claude Code, OpenCode, and Pi, and for Codex on explicit request; record the evidence in `docs/mcp-client-setup.md`.

## Cleanup (not a work unit): remove `spike/mcp/`

`spike/mcp/` was never committed and is now covered by `.gitignore`, so removing it
produces no diff and consumes no review budget. It is a local cleanup step, not a
reviewable unit — committing ~489 lines in order to delete them would have charged
the chain roughly 978 lines for throwaway code.

- [ ] C.1 Confirm Unit 5 has landed (the promoted server serves `search_docs`, `list_sections`, and `get_section` with origin/host validation and index generation).
- [ ] C.2 Delete the local `spike/mcp/` directory.
- [ ] C.3 Run `npm run check && npx vitest run && npx playwright test` to confirm nothing references `spike/mcp/`.

## Spec Requirement Coverage

| Spec | Requirement (short) | Unit |
|---|---|---|
| docs-mcp-index | Index derived from built site output | 2 |
| docs-mcp-index | EN/ES parity enforced at build time | 2 |
| docs-mcp-index | Code block and link fidelity | 1, 2 |
| docs-mcp-index | Index build identity recorded | 2 |
| docs-mcp-index | Extraction failure is explicit | 1, 2 |
| docs-mcp-interface | `search_docs` with relevance scoring | 3, 4 |
| docs-mcp-interface | Results bounded and fully described | 3, 4 |
| docs-mcp-interface | `list_sections` for discovery | 4 |
| docs-mcp-interface | `get_section` full untruncated content | 5 |
| docs-mcp-interface | Locale required wherever id is used | 5 |
| docs-mcp-interface | Explicit errors for invalid input | 4, 5 |
| docs-mcp-interface | Valid query, zero matches is legitimate | 3, 4 |
| docs-mcp-interface | Responses carry build identity | 4, 5 |
| docs-mcp-interface | Automated coverage incl. client consumption (AC8) | 1–5 |
| docs-mcp-deployment | Stateless Streamable HTTP transport | 4 |
| docs-mcp-deployment | No server-initiated streaming (405) | 4 |
| docs-mcp-deployment | Missing Origin accepted | 4 |
| docs-mcp-deployment | Untrusted/null Origin rejected | 4 |
| docs-mcp-deployment | Host header validation | 4 |
| docs-mcp-deployment | Independently deployed from static site | 6 |
| docs-mcp-deployment | Rate limiting at reverse proxy | 6 |
| docs-mcp-deployment | Health endpoint identity | 4, 6 |
| docs-mcp-deployment | Index freshness bound to restart — runbook | 6 |
| docs-mcp-deployment | Versioning and compatibility documented | 6 |
| docs-mcp-adoption | Claude Code tool-restricted command | 7 |
| docs-mcp-adoption | OpenCode project-scoped config | 7 |
| docs-mcp-adoption | Pi project-scoped config | 7 |
| docs-mcp-adoption | Codex config with documented partial coverage | 7 |
| docs-mcp-adoption | Setup docs cover all four agents | 7 |
