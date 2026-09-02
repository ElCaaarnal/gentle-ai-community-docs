# Use the documentation MCP server from this repository

This repository provides project-scoped client configuration for the read-only `gentle-ai-docs` MCP server. For local testing, start the server and use `http://localhost:3111/mcp`.

For production, replace only that endpoint value with `https://<production-mcp-domain>/mcp` in the relevant project configuration.

## Quick path

1. Build the documentation index: `npm run build`.
2. Start the server: `node mcp-server/src/server.mjs`.
3. Use the client-specific project configuration below and ask a wiki question.

The server log is the manual proof of a tool call: it records `POST /mcp` for each request. The configurations never grant write access to the server; it exposes only documentation tools.

## Claude Code

**Scope:** `.claude/commands/wiki.md` is a repository-local `/wiki` command. Its `allowed-tools` frontmatter exposes only `mcp__gentle-ai-docs__search_docs`, so the command cannot read files, run shell commands, or answer from other tools.

Register the local server as project-scoped configuration before invoking the command:

```bash
claude mcp add --scope project --transport http gentle-ai-docs http://localhost:3111/mcp
```

Then invoke it with a question:

```text
/wiki How do I install Gentle AI?
```

The command searches the wiki, cites canonical URLs, and names an uncovered question instead of guessing.

## OpenCode

**Scope:** `opencode.json`, `.opencode/agents/wiki.md`, and `.opencode/commands/wiki.md` are all repository-local. The `wiki` agent denies every non-MCP permission category and `/wiki` is bound to that agent.

Start OpenCode from this repository and run:

```text
/wiki How do I install Gentle AI?
```

The agent can call MCP tools but cannot read, edit, search, or execute anything else. This is category-level isolation: if a second MCP server is registered in this project, the agent can call that server too. Do not treat this configuration as isolation to `gentle-ai-docs` after adding another MCP server.

## Pi

**Scope:** `.pi/mcp.json` and `.agents/skills/wiki/SKILL.md` are repository-local. Pi consumes the config only when it is launched with the explicit path:

```bash
pi --mcp-config .pi/mcp.json
```

In that Pi session, invoke the `wiki` skill and ask a documentation question. The skill requires `gentle-ai-docs`, searches before answering, retrieves exact sections when necessary, and does not fill gaps from memory.

## Codex

**Scope:** `.codex/config.toml` and `.codex/skills/wiki/SKILL.md` are repository-local. Codex loads project MCP configuration only after its own interactive trust prompt approves this repository; accept that prompt rather than hand-editing `~/.codex/config.toml`.

The equivalent supported registration command is:

```bash
codex mcp add gentle-ai-docs --url http://localhost:3111/mcp
```

Use the `wiki` skill or explicitly ask Codex to use `gentle-ai-docs`, for example: “Use the gentle-ai-docs MCP server to explain installation.” Codex does not provide a skill-level tool-restriction field, so spontaneous MCP invocation on an unprompted documentation question is not guaranteed. This is a documented, accepted limitation; explicit requests are the supported path.

## Manual verification record

The server was started locally from the built index on 2026-09-01. Record only an observed client invocation and matching `POST /mcp` server-log entry; do not infer a tool call from a plausible answer.

| Client | Invocation | Observed result |
| --- | --- | --- |
| Claude Code | `claude -p '/wiki How do I install Gentle AI? Cite the canonical URL returned by the documentation tool.' --output-format json --max-budget-usd 2 --permission-mode dontAsk` | Passed after the quota reset: `mcp__gentle-ai-docs__search_docs` returned documentation snippets and Claude cited canonical URLs including `https://docs-gentle-ai.netlify.app/#install`; exit `0` and six matching `POST /mcp` requests. Its attempted `get_section` call was denied by the command's deliberate search-only restriction, so the answer explicitly stayed within search snippets. |
| OpenCode | `opencode run --agent wiki` with an explicit MCP-only installation query | Passed: the client called `search_docs`, `get_section`, and `list_sections`; the server logged 19 `POST /mcp` requests. |
| Pi | `pi --mcp-config .pi/mcp.json --skill .agents/skills/wiki` with an explicit MCP-only installation query | Passed: the client returned wiki citations; the server logged 13 `POST /mcp` requests. |
| Codex | Interactive Codex v0.152.0 with an explicit `gentle-ai-docs.search_docs` request after project trust | Passed: `gentle-ai-docs.search_docs` returned five real documentation results including `https://docs-gentle-ai.netlify.app/#install`; the server logged four matching `POST /mcp` requests at 21:00:41.111Z, 21:00:41.148Z, 21:00:41.154Z, and 21:01:13.575Z against the 190-section index at commit `b0d7f33`. |

All four configured clients now have observed, server-side manual verification evidence.
