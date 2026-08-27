# Gentle AI Community Documentation

Static bilingual documentation for the Gentle AI community, built with Astro.

## Documentation routes

- `/` is the authoritative English route.
- `/es/` is the Spanish route. Keep its meaning, canonical heading IDs, technical literals, and structure aligned with English in the same change.

Both routes publish absolute canonicals, reciprocal `en`/`es`/`x-default` links, localized Open Graph metadata, and sitemap entries.

## Local development

```sh
npm install
npm run dev
```

## Verification

```sh
npm run check
npm run build
npm run preview
npx playwright test
```

Astro writes the production site to `dist/`. The build is plain static output with no server adapter, so any static host serves it.

## Banner asset

The committed banner is generated from its preserved source asset. Regenerate it after an approved source change:

```sh
npm run generate:banner
```

The generator verifies the source hash, crop, output dimensions, size, and reproducible bytes.

## Deployment

Deployed on Netlify:

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Publish directory | `dist` |

These live in `netlify.toml`, which takes precedence over the values held in the Netlify UI. Keep the two in sync.

`netlify.toml` also carries an `ignore` command that cancels the build when a push changed nothing that ships — changes confined to `tests/`, `.github/`, `README.md`, or `LICENSE`. Deploy previews are not metered on the current plan; production deploys are, so a build that would republish identical output is avoided.

No adapter, redirects, or serverless functions are required.

## External runtime dependencies

The first stable version intentionally preserves two dependencies from the validated prototype:

- Google Fonts for Inter, Zen Kaku Gothic New, and JetBrains Mono.
- Mermaid 11 from jsDelivr for client-side diagram rendering.

Without network access, the site falls back to system fonts and Mermaid diagrams remain as source text.

## License

MIT — see [LICENSE](LICENSE).
