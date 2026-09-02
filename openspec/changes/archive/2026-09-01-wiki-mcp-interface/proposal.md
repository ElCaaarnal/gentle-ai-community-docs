# Proposal: Read-Only MCP Interface Over the Published Wiki

## Intent

Issue #34: agents answer Gentle AI questions from stale internal knowledge because the published
wiki is browser-only. Expose the same built documentation over a read-only MCP server so Claude
Code, OpenCode, Pi and Codex can search, list and retrieve exact sections in both locales. Success
is measured, not assumed: answers traceable to tool calls in the server log.

## Scope

### In Scope
- Index generated post-build from `dist/index.html` and `dist/es/index.html`, wired into
  `npm run build`; the EN/ES orphan-id parity check **fails the build**, matching the
  throw-on-mismatch convention in `scripts/generate-banner.mjs`.
- Stateless Streamable HTTP server, single `/mcp`, `enableJsonResponse`, 405 on GET. A **missing**
  `Origin` passes (terminal clients send none); present-and-untrusted and `Origin: null` are
  rejected. Second deployable on the VPS; Netlify keeps the static site.
- `search_docs(query, locale?, limit?)`, `list_sections(locale?)`, `get_section(id, locale)` —
  `locale` required because ids repeat across locales. Explicit errors for empty query, unknown id
  and unsupported locale; never silent empty results. BM25-lite scoring.
- Vitest 4.1.11 for pure-function units; Playwright `request` for wire-level HTTP. Both runners get
  explicitly scoped discovery (Playwright `testDir`; Vitest `include` plus `exclude` extending
  `configDefaults.exclude`) because both defaults match `*.spec.ts` anywhere. `openspec/config.yaml`
  testing block updated. `node:test` was considered and knowingly declined: zero dependencies, but
  Vitest's matchers, spies and watch mode suit strict TDD across five slices.
- **AC8 coverage, all four parts.** Tool schemas, retrieval behaviour and locale parity are covered
  by the units and HTTP tests above. **Representative client consumption** is covered by an
  automated test driving the server through the `@modelcontextprotocol/sdk` `Client` over
  Streamable HTTP — a real client performing `initialize`, `tools/list` and `tools/call`, asserting
  the negotiated protocol version, the advertised schemas and a known section's exact returned
  text. This runs in CI with no credentials and no external agent installed. Verification with the
  four *named* agents stays manual, because each needs its own model credentials; the runbook
  records it and the server request log is the evidence, as it was for the Pi spike.
- Deployment/operations docs (nginx, supervision, rate limiting at nginx, versioning, health) and
  project-scoped per-client setup docs.

### Out of Scope
- Refactoring `src/scripts/site.js`. Its runtime DOM extraction stays; the two extraction
  implementations are **accepted, deferred debt**, recorded not dropped. Both read the same `dist/`
  bytes, so content cannot diverge — only edge-case behavior can — and unifying them would touch the
  stable `docs-search` spec inside an MCP-focused change.
- Any home-directory or global configuration. Setup docs route Codex trust through its own
  interactive prompt, never a hand-edited `~/.codex/config.toml`.
- Promoting `spike/mcp/` verbatim; writes, auth, in-process rate limiting, WebMCP, LLM in the server.

## Capabilities

### New Capabilities
- `docs-mcp-index`: build-time locale-aware section index derived from built HTML, with code-block
  and link fidelity and build-failing EN/ES id parity.
- `docs-mcp-interface`: the three tools, their schemas, scoring, bounded results and error paths.
- `docs-mcp-deployment`: transport, origin/host validation, VPS process, nginx, rate limiting,
  versioning, health, and the publish/restart runbook.
- `docs-mcp-adoption`: project-scoped client configuration for the four named agents.

### Modified Capabilities
- None. `docs-search`, `docs-navigation`, `docs-content-presentation`, `docs-site-shell` and
  `docs-browser-verification` are untouched at spec level.

## Approach

Exploration approach 1: derive from built `dist/` HTML, smallest blast radius, zero risk to the
stable browser-search behavior. Five chained slices, each under the 400-line budget: (1) index
generator, build wiring, fail-fast parity, extraction units; (2) server core with `search_docs` and
`list_sections`, origin/host validation, error paths, scoring units, Playwright HTTP; (3)
`get_section`; (4) deployment/operations docs; (5) adoption/setup docs.

**Dual-deploy staleness — committed mitigation.** The process serves the index built at its last
restart, so publishing without restarting serves stale content while the site is current — exactly
the independent-copy problem AC6 exists to prevent. Committed mitigation: index build and process
restart are one documented deploy step, and the index build identity is exposed on the health
endpoint and returned with every tool response, making staleness observable instead of silent.

**Cold-start adoption is not solved.** Within an established `/wiki` session follow-ups keep hitting
the server, but an agent asked a Gentle AI question cold still answers from its own knowledge. A
measured, known limitation, shipped as such.

**Codex closes AC1 partial.** Codex `SKILL.md` has no tool-restriction field (confirmed by absence
in official docs), so the Claude Code fix is not reproducible there. Codex connects via
`codex mcp add` and works on explicit request; spontaneous invocation is not guaranteed.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `scripts/build-mcp-index.mjs` (new) | New | Promoted, tested index generator |
| `mcp-server/` (new) | New | Node MCP process, own package boundary |
| `package.json` | Modified | Post-build index step, Vitest dev dependency, unit script |
| `vitest.config.*`, `playwright.config.ts` | New/Modified | Mutually exclusive test discovery |
| `openspec/config.yaml` | Modified | Testing block gains a unit layer |
| `.claude/commands/wiki.md`, `.opencode/`, `.agents/skills/`, `.codex/config.toml`, Pi mcp-config | New/Modified | Project-scoped client setup |
| `README.md`, deployment docs | Modified | VPS, nginx, publish runbook (AC10 gap) |
| `src/scripts/site.js`, `openspec/specs/docs-search/` | Unchanged | Target outcome: zero changes |
| `spike/mcp/` | Removed | Deleted once slice 3 lands |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Stale index served after a docs publish | High | Single deploy step; build identity on health and every response |
| Cold-start questions bypass the server | High | Accepted and documented; slash command is the reliable path |
| Codex cannot restrict tools | High | Documented limitation; AC1 partial for Codex |
| OpenCode isolation breaks if a second MCP server is registered | Medium | Category-level `mcp: allow` limitation documented |
| Regex HTML parsing tied to today's markup | Medium | Hard-fail on missing structure; never degrade silently |
| Vitest/Playwright discovery collision | Medium | Explicit `testDir`, `include` and `exclude`; kept in sync by convention |
| Two extraction implementations drift | Medium | Accepted, deferred; same `dist/` source bounds it to behavior, not content |
| Slice exceeds 400 authored lines | Medium | `ask-on-risk` delivery; split the slice rather than bundle |

## Rollback Plan

Per slice, each independently revertable, latest first:
1. **Index generator** — revert the PR: drop the script and post-build hook; `astro build` returns
   to its current single step. No consumer exists yet.
2. **Server core** — revert the PR and stop the VPS process; the static site is unaffected.
3. **`get_section`** — revert the PR; the server keeps serving the two earlier tools.
4. **Deployment docs** — documentation-only revert; running infrastructure untouched.
5. **Adoption docs** — delete the client config files; agents simply stop discovering the server.

Full rollback is reverting all five plus the `openspec/config.yaml` testing block and the Vitest
dependency. Confirm with `npm run check`, `npm run build`, `npx playwright test`.

## Dependencies

- `@modelcontextprotocol/sdk` and Vitest 4.1.11 (engines `^20 || ^22 || >=24`; Node 24 supported).
- VPS access for nginx and process supervision.
- Published docs build must precede index generation.

## Success Criteria

- [ ] Parity mismatch between EN and ES ids fails `npm run build`.
- [ ] All three tools return typed errors for empty query, unknown id and unsupported locale.
- [ ] Missing `Origin` is accepted; `Origin: null` and untrusted origins are rejected.
- [ ] `get_section` returns full body with code blocks and links intact, untruncated.
- [ ] Vitest and Playwright each run only their own files; both suites green.
- [ ] An automated MCP-client test completes `initialize`, `tools/list` and `tools/call` against the
      running server in CI, asserting schemas and exact returned content (AC8, client consumption).
- [ ] Claude Code, OpenCode and Pi invoke the server from project-scoped config; Codex connects and
      works on explicit request. Manual, evidenced by the server request log.
- [ ] Health output and tool responses carry the index build identity.
- [ ] `src/scripts/site.js` and `openspec/specs/docs-search/spec.md` are unchanged.
