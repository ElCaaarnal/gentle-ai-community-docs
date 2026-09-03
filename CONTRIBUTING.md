# Contributing

Thanks for helping improve the Gentle AI community documentation. This repository
publishes a bilingual static wiki and a read-only MCP server that exposes the same
content to coding agents. Both are built from one source, so a documentation change
lands in both surfaces at once.

## The one rule that matters most

**English and Spanish change together, in the same pull request.**

`/` is the authoritative English route and `/es/` is the Spanish route. They are two
files — `src/components/DocumentationContentEn.astro` and
`DocumentationContentEs.astro` — and they must stay aligned in meaning, structure,
technical literals, and heading IDs.

Heading IDs are **shared across locales, not translated**. A section reads
`<h3 id="upgrading-to-v2-5-0">Upgrading to v2.5.0</h3>` in English and
`<h3 id="upgrading-to-v2-5-0">Actualizar a v2.5.0</h3>` in Spanish: the visible title
is translated, the `id` is identical.

This is enforced, not merely requested. `scripts/build-mcp-index.mjs` fails the build
on any heading ID present in one locale and missing from the other, because the MCP
server addresses sections by that shared ID. If you add a heading to one file and
forget the other, `npm run build` stops with an unpaired-ID error.

## Getting set up

```sh
nvm use          # Node 24, per .nvmrc
npm install
npm run dev
```

## Before you open a pull request

```sh
npm run check       # Astro and TypeScript diagnostics
npm run test:unit   # Vitest — extraction, index store, search
npm run build       # static site plus the MCP index, with the parity guard
npx playwright test # end-to-end and visual checks
```

`npm run build` is the one that catches locale drift, so run it even for a change you
consider documentation-only.

Visual snapshots are committed per platform. If a legitimate layout change makes them
fail, regenerate them deliberately rather than deleting the baselines — the
`Docs browser` workflow accepts a `workflow_dispatch` run with `update_snapshots` to
produce Linux baselines as an artifact.

## Branches, commits, and pull requests

- Work on a short-lived branch off `main`. Do not commit directly to `main`.
- Use [Conventional Commits](https://www.conventionalcommits.org/): `docs(wiki): …`,
  `fix(mcp): …`, `chore(openspec): …`.
- Keep a pull request to one reviewable unit of work. Large changes are easier to
  review — and easier to revert — when split into a chain of focused pull requests.
- Open an issue first for anything beyond a typo. The repository provides four issue
  forms: bug, feature, docs, and chore.

## Where things live

| Path | What it is |
| --- | --- |
| `src/` | The Astro site: layouts, components, i18n strings, client script |
| `scripts/` | Build-time index generation and the banner generator |
| `mcp-server/` | The read-only MCP server over the generated index |
| `tests/` | Playwright end-to-end and visual tests |
| `docs/` | Operator runbook and MCP client setup |
| `openspec/` | Specifications and the archived record of past changes |

`openspec/specs/` holds the living contract for each capability, and
`openspec/changes/archive/` keeps the proposal, design, and exploration behind past
decisions. If you change behavior a spec describes, update that spec in the same
change.

## Working on the MCP server

The index is generated at build time from `dist/` and is never committed. To exercise
the server locally:

```sh
npm run build
node mcp-server/src/server.mjs
```

`docs/mcp-client-setup.md` covers connecting Claude Code, OpenCode, Pi, and Codex to
that local endpoint.
