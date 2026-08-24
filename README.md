# Gentle AI Community Documentation

Static Spanish-language documentation for the Gentle AI community, built with Astro.

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
```

Astro writes the production site to `dist/`. The build is plain static output with no server adapter, so any static host serves it.

## Deployment

Deployed on Netlify:

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Publish directory | `dist` |

No adapter, redirects, or serverless functions are required.

## External runtime dependencies

The first stable version intentionally preserves two dependencies from the validated prototype:

- Google Fonts for Inter, Zen Kaku Gothic New, and JetBrains Mono.
- Mermaid 11 from jsDelivr for client-side diagram rendering.

Without network access, the site falls back to system fonts and Mermaid diagrams remain as source text.

## License

MIT — see [LICENSE](LICENSE).
