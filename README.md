# Gentle AI Community Documentation

The community wiki for [Gentle AI](https://github.com/Gentleman-Programming/gentle-ai),
published in English and Spanish — and exposed to coding agents through a read-only
MCP server built from the very same source.

**Read it:** https://docs-gentle-ai.netlify.app

## Two surfaces, one source

| Surface | For | Built from |
| --- | --- | --- |
| Static bilingual site | People, in a browser | `src/` via Astro |
| Read-only MCP server | Coding agents | The index generated from `dist/` |

The MCP index is generated at build time from the same HTML the site publishes, so
the two can never drift apart. There is no separately maintained copy of the
documentation.

## Using the documentation from your agent

The MCP server exposes three read-only tools — `search_docs`, `list_sections`, and
`get_section` — each returning canonical URLs alongside the content, so an agent can
cite the source rather than paraphrase from memory. Both locales are addressable
through shared section IDs.

To run it against a local build:

```sh
npm install
npm run build
node mcp-server/src/server.mjs
```

[docs/mcp-client-setup.md](docs/mcp-client-setup.md) has the configuration for Claude
Code, OpenCode, Pi, and Codex, including a repository-local `/wiki` command that is
restricted to the documentation tool so it cannot answer from the model's own
knowledge.

## Contributing

Contributions are welcome — corrections, clarifications, and translations especially.
Start with [CONTRIBUTING.md](CONTRIBUTING.md).

The single most important rule: **English and Spanish change together, in the same
pull request**, sharing untranslated heading IDs. The build fails on locale drift
rather than publishing it.

## Local development

```sh
nvm use          # Node 24, per .nvmrc
npm install
npm run dev
```

## Verification

```sh
npm run check       # Astro and TypeScript diagnostics
npm run test:unit   # Vitest — extraction, index store, search
npm run build       # static site plus the MCP index, with the locale parity guard
npx playwright test # end-to-end and visual checks
npm run preview     # serve the built output
```

Astro writes the production site to `dist/`. The build is plain static output with no
server adapter, so any static host serves it.

## Documentation routes

- `/` is the authoritative English route.
- `/es/` is the Spanish route. Keep its meaning, canonical heading IDs, technical
  literals, and structure aligned with English in the same change.

Both routes publish absolute canonicals, reciprocal `en`/`es`/`x-default` links,
localized Open Graph metadata, and sitemap entries.

## Project layout

| Path | What it is |
| --- | --- |
| `src/` | Astro layouts, components, i18n strings, and the client script |
| `scripts/` | Build-time index generation and the banner generator |
| `mcp-server/` | The read-only MCP server over the generated index |
| `tests/` | Playwright end-to-end and visual tests |
| `docs/` | Operator runbook and MCP client setup |
| `openspec/` | Living specifications and the archived record of past changes |

## Banner asset

The committed banner is generated from its preserved source asset. Regenerate it
after an approved source change:

```sh
npm run generate:banner
```

The generator verifies the source hash, crop, output dimensions, size, and
reproducible bytes.

## Deployment

This project has two deployables:

- **Netlify static demo:** the existing public static deployment and its
  `netlify.toml` configuration.
- **HostGator VPS:** Apache serves the static wiki and reverse-proxies the
  long-running systemd MCP service at
  `https://gentle-ai-wiki.gentlemanprogramming.com/mcp`.

The VPS administrator runbook is
[docs/mcp-server-operations.md](docs/mcp-server-operations.md). It defines the
reproducible Node 24, Apache, systemd, build, health-check, upgrade, and rollback
state; it does not modify Netlify configuration.

Publishing and restarting are one operation: the MCP process serves the index it
loaded at its last restart, so new static output without a restart leaves the two
surfaces disagreeing. `/health` exposes the loaded index identity so that mismatch is
observable.

### Netlify static demo

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Publish directory | `dist` |

These live in `netlify.toml`, which takes precedence over the values held in the
Netlify UI. Keep the two in sync.

`netlify.toml` also carries an `ignore` command that cancels the build when a push
changed nothing that ships — changes confined to `tests/`, `.github/`, `openspec/`,
`docs/`, or the top-level metadata files (README, CONTRIBUTING, SECURITY,
CODE_OF_CONDUCT, LICENSE, and `.nvmrc`). Deploy previews are not metered on
the current plan; production deploys are, so a build that would republish identical
output is avoided.

No adapter, redirects, or serverless functions are required.

## External runtime dependencies

The first stable version intentionally preserves two dependencies from the validated
prototype:

- Google Fonts for Inter, Zen Kaku Gothic New, and JetBrains Mono.
- Mermaid 11 from jsDelivr for client-side diagram rendering.

Without network access, the site falls back to system fonts and Mermaid diagrams
remain as source text.

## Security

Please report vulnerabilities privately — see [SECURITY.md](SECURITY.md).

## Code of Conduct

Participation is governed by our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

MIT — see [LICENSE](LICENSE).
