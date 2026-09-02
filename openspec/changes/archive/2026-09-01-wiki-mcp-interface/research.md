# Research: per-client adoption and unit-test runner

Change: `wiki-mcp-interface`
Phase: `sdd-research` (two lanes, both selected)
Status: done

## Why this research exists

An MCP server exposing documentation tools was connected to Claude Code and was **not** called
spontaneously: the agent answered from its own incorrect knowledge without touching the server.
Sharpening the tool description did not fix it. The fix was a project-scoped command file,
`.claude/commands/wiki.md`, whose `allowed-tools` frontmatter exposes only the MCP tool — removing
the fallback rather than discouraging it.

Acceptance criterion 1 also names OpenCode, Codex and Pi. This lane asks whether that fix is
reproducible for them under the hard constraint that only project-scoped, repo-committed
configuration may be used.

## Lane 1 — per-client adoption

| Client | Project-scoped command/skill | Tool restriction | Project-scoped remote MCP | Prefer-MCP flag |
| --- | --- | --- | --- | --- |
| OpenCode | Yes — `.opencode/commands/` | Category-level only, via a bound agent in `.opencode/agents/` | Yes — `opencode.json` | Not documented |
| Codex | Yes — `.agents/skills/` | **None documented** | Yes — `.codex/config.toml` (trusted projects) | Not documented |
| Pi | Yes — `.pi/skills/` or `.agents/skills/` | **Yes** — `allowed-tools` (marked experimental) | See orchestrator correction below | Not documented |

### OpenCode

Commands live at `.opencode/commands/<name>.md` with frontmatter `description`, `agent`, `model`.
The command itself has no tool-restriction field. Project-scoped agents at
`.opencode/agents/<name>.md` carry a `permission` field (`allow`/`ask`/`deny`), but granularity is
documented only per tool **category** (`edit`, `bash`, `webfetch`, `mcp`). `mcp` is monolithic: it
covers every registered MCP server as one unit, with no documented syntax for a single named tool.

If the wiki server is the project's only MCP server, an agent with
`{edit: deny, bash: deny, webfetch: deny, mcp: allow}` bound through a command reproduces the
effect. This is a two-file composition, not a one-field equivalent, and it stops being equivalent
the moment a second MCP server is registered.

Remote MCP registration is project-scoped in `opencode.json` at repo root:
`{"mcp": {"<name>": {"type": "remote", "url": "https://…"}}}`.

### Codex

Legacy custom prompts exist only at `~/.codex/prompts/`, are documented as not repo-shareable, and
are deprecated in favour of Skills. Skills live at `$REPO_ROOT/.agents/skills/<name>/SKILL.md` and
are explicitly documented as committed so all Codex sessions pick them up.

**The official SKILL.md frontmatter schema is `name` and `description` only — there is no
tool-restriction field.** The companion `agents/openai.yaml` `dependencies.tools` entry declares an
MCP dependency for discovery; it is not an access-control mechanism. This is a confirmed capability
gap, established by absence in the official documentation.

Remote MCP registration is project-scoped via `.codex/config.toml` (`[mcp_servers.<name>]` with
`url`, `auth`, `bearer_token_env_var`, `http_headers`), loaded only for projects marked trusted.
Trust is a per-path entry normally granted through Codex's own interactive prompt. **Constraint
implication:** setup documentation must instruct contributors to answer that interactive prompt,
never to hand-edit `~/.codex/config.toml`, or the project-scope constraint is breached in spirit.

### Pi

Skills are discovered from project `.pi/skills/` and `.agents/skills/`. SKILL.md frontmatter
supports `allowed-tools` — *"space-delimited list of pre-approved tools (experimental)"* — the only
direct documented equivalent to the Claude Code fix among the three clients. Prompt templates at
`.pi/prompts/*.md` document only `description` and `argument-hint`, so skills, not prompt
templates, are the correct vehicle.

## Orchestrator verification (corrects the research)

The research lane concluded from public documentation that Pi *"intentionally does not include
built-in MCP"* and that MCP arrives only through a community extension, rating Pi's transport
support low-confidence. **Direct inspection of the installed binaries contradicts that**, so the
documentation consulted was stale or incomplete:

| Check | Result |
| --- | --- |
| `pi --version` | 0.84.4 installed |
| `pi --help` | exposes `--mcp-config <value>` (first-party MCP config path), plus `--skill <path>` and `--prompt-template <path>` |
| `codex --version` | codex-cli 0.144.0 installed |
| `codex mcp --help` | first-party `list` / `get` / `add` / `remove` / `login` / `logout` |
| `opencode --version` | 1.18.25 installed |
| `npm view vitest version` | **4.1.11 confirmed exactly** |
| `npm view vitest engines` | `^20.0.0 \|\| ^22.0.0 \|\| >=24.0.0` — Node 24 supported |

Pi's `--mcp-config` accepts an explicit path, so a repo-local MCP config satisfies the
project-scope constraint.

### Pi Streamable HTTP — spiked and CONFIRMED

The one remaining gap was closed by direct spike against Pi 0.84.4 and the running MCP server,
rather than by further documentation research.

Configuration passed with `--mcp-config <path>`, standard shape:

```json
{ "mcpServers": { "gentle-ai-docs": { "type": "http", "url": "http://localhost:3000/mcp" } } }
```

Asked to search for "engram memory" and reply with only the top result's exact title, Pi returned
`Engram — persistent memory` verbatim, and the server's request log recorded **4 `POST /mcp` plus
1 `GET /mcp`**. The verbatim title and the request log together rule out a plausible-looking answer
produced from the model's own knowledge.

Two conclusions follow:

1. **Pi supports remote Streamable HTTP MCP, project-scoped.** AC1 can close for Pi.
2. **Returning 405 on `GET /mcp` is safe.** Pi attempts the server-initiated stream, receives 405
   from the stateless design, and completes the exchange normally. The stateless choice that
   removes SSE — and with it the nginx buffering requirement — costs no Pi compatibility.

All three clients are installed on this machine, so any further per-client uncertainty is
verifiable by direct spike rather than research.

## Lane 2 — unit-test runner

**Vitest 4.1.11**, Node 24 supported, Vite-native and ESM-first; `.mjs`/`.ts`, `import.meta` and
top-level `await` work without configuration.

**Astro wiring.** Astro's docs recommend wrapping `vitest.config.ts` in `getViteConfig()` from
`astro/config` to load the project's Astro configuration into the test environment. The docs do
**not** state that this is unnecessary for modules importing nothing Astro-specific; that carve-out
is a reasonable inference, not a documented guarantee. Recommendation: prototype without
`getViteConfig()` for the two pure-function suites and add it only if resolution actually breaks.

**Collision risk — real, not hypothetical.** Vitest's default `include` is
`**/*.{test,spec}.?(c|m)[jt]s?(x)` and its default `exclude` does not mention Playwright or e2e
directories. Playwright's default match is `.*(test|spec).(js|ts|mjs)`. Both match a file such as
`search.spec.ts` anywhere in the tree. Mitigation, using each vendor's own options:

- Give Playwright an explicit `testDir` (for example `e2e/`).
- Give Vitest an `exclude` extending `configDefaults.exclude` with that directory, and scope its
  `include` to a distinct root such as `src/**/*.test.ts`.
- Do not rely on the `.spec.ts` versus `.test.ts` suffix alone; both defaults match both suffixes.

**`node:test` alternative, stated honestly.** Node 24 ships a stable, zero-dependency, ESM-native
runner with native TypeScript type-stripping (erasure without type-checking, so `tsc --noEmit`
remains necessary under either choice). For the narrow scope here — two pure-function suites, no
snapshots, no heavy mocking — `node:test` satisfies strict TDD with **no new dependency**. Vitest's
advantage is richer matchers, spies and watch-mode ergonomics, and room for the unit surface to
grow. Vitest is not intrinsically required for this scope, and choosing it should be justified by
anticipated growth rather than asserted as the only option.

## Risks

- If OpenCode ever registers a second MCP server on this project, the category-level permission
  workaround stops isolating the wiki tool, and no documented fix exists.
- Codex has no tool-restriction lever for skills. If Codex shows the same "answers from its own
  knowledge" failure Claude Code did, there is no documented remedy. This must be surfaced as a
  known limitation rather than assumed solved.
- Codex's one-time trust decision is recorded in `~/.codex/config.toml`; setup documentation must
  route users through the interactive prompt instead of a manual edit.
- Keeping the Vitest and Playwright scoping configurations in sync is an ongoing obligation; a new
  spec file added outside the designated directory would be silently picked up by the wrong runner.

## Open items for `sdd-propose`

1. Design the OpenCode fix as a project command bound to a project agent with category-level
   permissions, documenting the single-MCP-server limitation explicitly.
2. ~~Decide whether Codex's missing tool restriction is accepted~~ — **decided**: accepted as a
   documented limitation. Codex connects and works on explicit request; spontaneous invocation
   cannot be guaranteed, and AC1 closes partial for Codex with that stated plainly.
3. ~~Confirm Pi's Streamable HTTP transport support~~ — **confirmed by spike**, see above.
4. ~~Confirm the unit runner choice~~ — **decided**: Vitest 4.1.11, justified by strict TDD's
   red/green cadence and an expected unit surface growing across five slices, with the `node:test`
   zero-dependency trade-off recorded above and knowingly declined.
