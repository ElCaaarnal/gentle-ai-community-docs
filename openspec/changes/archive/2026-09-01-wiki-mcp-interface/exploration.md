# Exploration: read-only MCP interface over the published wiki

Change: `wiki-mcp-interface`
Issue: #34 (approved, open)
Phase: `sdd-explore`

## Current state

Astro 7.2.4 static site with `en`/`es` routes (English unprefixed). Content lives in
`DocumentationContentEn.astro` and `DocumentationContentEs.astro`, rendered through the shared
`DocumentationPage.astro` shell.

`src/scripts/site.js` builds its own search index **at runtime from the live DOM**
(`main.querySelectorAll('h2[id]')`, walking siblings to the next heading) using plain substring
matching. `npm run build` runs `astro build` only; no post-build step exists.

`playwright.config.ts` is the only configured runner and is structurally E2E: its `webServer`
always runs `npm run build` and serves `dist/` through a Python HTTP server. Playwright's
`request` fixture can still perform headless HTTP calls without a browser.

Netlify is confirmed as the current static deploy target and cannot host a long-running process.
The MCP server is therefore necessarily a **second, separate deployable** that only the VPS can run.

`.claude/commands/wiki.md` already exists in this worktree, implementing the spike's verified
adoption fix for Claude Code through `allowed-tools` frontmatter that structurally removes the
local-skill-file fallback.

## Evidence carried from the spike

The throwaway spike at `spike/mcp/` settled the risky unknowns by measurement:

- Stateless Streamable HTTP works against Claude Code.
- A request with a missing `Origin` header must pass; terminal MCP clients never send one.
- One index from `dist/index.html` plus `dist/es/index.html` yields 190 sections (95 EN + 95 ES),
  byte-identical to the deployed site.
- Naive scoring failed 3 of 5 realistic questions; BM25-lite corrected it to 5 of 6 at rank 1.
- `<pre>` blocks must be lifted out before prose whitespace is collapsed, or multi-line commands
  flatten into a single line.
- A sharpened tool description alone was insufficient for cold-start invocation; only the
  project-scoped slash command proved reliable, and only for Claude Code.
- `get_section` is a deliberately untested gap (400-character snippet truncation).

## Affected areas

| Area | Impact |
| --- | --- |
| `spike/mcp/build-index.mjs`, `spike/mcp/server.mjs` | Logic to promote; not usable as-is (regex parsing, one tool, no tests) |
| `package.json` | Post-build index generation, plus a candidate new dev dependency |
| `src/scripts/site.js` | Holds an independent extraction implementation; raises the AC6 single-source question |
| `openspec/specs/docs-search/spec.md` | In scope only if `site.js` is refactored |
| `tests/docs.spec.ts`, `playwright.config.ts` | Not designed for pure-function unit coverage |
| `.claude/commands/wiki.md` | Claude Code fix present; OpenCode/Codex/Pi equivalents unverified |
| `README.md`, `netlify.toml` | Document Netlify only; VPS process and nginx undocumented (AC10 gap) |

## Approaches

1. **Index derived from built `dist/` HTML only, `site.js` untouched.** Effort low-medium.
   Matches what a visitor sees, no risk to the stable `docs-search` spec, smallest blast radius.
   Leaves two independent extraction paths that read the same markup and could drift.
2. **Single generated index consumed by both `site.js` and the MCP server.** Effort high.
   Collapses to one extraction algorithm, but refactors a stable, already-tested runtime feature
   where search, scrollspy and subnav share the DOM but not the index. Real regression risk.
3. **Parse `.astro` sources through Astro's Container API.** Effort high, unproven. Semantic AST
   instead of regex, but a new unproven dependency with no spike evidence, and it does not resolve
   the duplication in approach 1 anyway.

**Recommendation:** approach 1, with the `site.js` unification question recorded explicitly as a
scoping decision for `sdd-propose` rather than silently resolved.

## Testing strategy

Playwright is E2E-shaped by design. The new logic needing coverage — HTML-to-section extraction
and BM25-lite scoring — are pure functions with no DOM dependency, and the spike already proved
the scoring is fragile. Under strict TDD, gating every red/green cycle on `npm run build` plus a
static server is the wrong loop.

A unit-test runner should be introduced (Vitest recommended: zero-config on the existing ESM
setup). Playwright keeps ownership of wire-level tool-schema and HTTP tests through its `request`
fixture, with no browser required.

This exceeds the current `openspec/config.yaml` testing block and must be an explicit proposal
decision, not an assumption.

## Tool surface

| Tool | Status | Notes |
| --- | --- | --- |
| `search_docs(query, locale?, limit?)` | Proven in spike | AC3 |
| `list_sections(locale?)` | New | The discovery capability AC2 names separately from search |
| `get_section(id, locale)` | New | Closes the spike gap; full body preserving code and links (AC4). `locale` is required because ids repeat across locales (AC5) |

All three need explicit error paths for empty queries, unknown ids and unsupported locales (AC7),
never silent empty results.

## Deployment, versioning, rate limiting

Netlify keeps the static site. The MCP server is a second deployable only the VPS can run, with
its own process supervision and nginx location block — undocumented today (AC10 gap).
`ALLOWED_HOSTS` and `ALLOWED_ORIGINS` carry forward from the spike. Rate limiting stays at nginx.

**Staleness:** index freshness is bounded by build recency, and the server process must be
restarted on every docs publish or it serves stale content while the live site is current. This is
an explicit dual-deploy operational risk.

**Parity:** the spike's orphan-id check only warns. For AC5 it must fail the build, matching the
throw-on-mismatch convention already used in `scripts/generate-banner.mjs`.

## Adoption and distribution

The tool-description lever alone is insufficient, by measurement. A global `CLAUDE.md` rule is
forbidden by this change's project-scope constraint. The project-scoped `.claude/commands/wiki.md`
is the verified Claude Code fix, but AC1 also names OpenCode, Pi and Codex, whose equivalent
mechanisms are unverified.

Recommendation: ship the tool description plus the existing slash command, documented as
Claude-Code-specific, and name cold-start-without-slash-command as a known unsolved limitation
rather than implying it is solved.

## Slicing proposal (400-line budget)

1. Index generator promotion, build wiring, fail-fast parity check, extraction unit tests (~250-350)
2. MCP server core (`search_docs`, `list_sections`), origin/host validation, error paths, scoring
   unit tests, Playwright HTTP tests (~350-400)
3. `get_section` tool, code and link preservation tests, locale/id validation (~200-300)
4. Deployment and operations docs: nginx, VPS process, rate limiting, versioning, health (~150-250)
5. Adoption and setup docs: per-agent configuration examples (AC9), slash-command documentation,
   honest record of the cold-start gap (~150-250)

## Risks

- Two independent extraction implementations could drift even on identical `dist/` content.
  Deferred by design; must be recorded, not dropped silently.
- Regex HTML parsing is tied to today's exact markup and must hard-fail on missing structure,
  never degrade silently.
- OpenCode, Codex and Pi adoption mechanisms are unverified; AC1 and AC9 cannot fully close
  without research.
- Dual-deploy staleness between the Netlify site and the VPS MCP process needs an explicit
  runbook, or it reintroduces the independent-copy problem AC6 exists to prevent.
- Introducing Vitest is a testing-configuration change beyond the current `openspec/config.yaml`
  and needs explicit approval.

## Readiness

Ready for proposal, with targeted `sdd-research` recommended but not required on per-client
adoption mechanisms for OpenCode, Codex and Pi, and on confirming Vitest as the unit-test addition.
