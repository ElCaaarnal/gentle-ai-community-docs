# Proposal: Bilingual Documentation Feedback Remediation

## Intent

Deliver equivalent bilingual documentation, confirmed visual remediations, and focused regression evidence.

## Scope

### In Scope
- Serve authoritative neutral-international English at `/` and parity-gated Spanish at `/es/`; localize all user-facing strings while preserving technical literals.
- Use locale-specific content with a shared shell; configure `https://docs-gentle-ai.netlify.app/`, reciprocal `en`/`es`/`x-default`, sitemap, and Open Graph metadata.
- Preserve explicit canonical IDs through real, fragment-preserving language links; localize search, navigation, ARIA, diagrams, and table labels.
- Adapt the banner for full-width use and shared social metadata; restyle the first callout, remove the H2 accent and inert hover effects, but retain warnings, action feedback, and reading progress.
- Add one Chromium Playwright project with a two-locale/two-viewport matrix and focused hero/table snapshots.

### Out of Scope
- Language redirects, more locales, content-platform migration, replacement artwork, broad redesign, or unrelated cascade cleanup.

## Capabilities

### New Capabilities
- `docs-browser-verification`: Cross-locale behavioral and focused visual regression coverage.

### Modified Capabilities
- `docs-site-shell`: Two locale routes with locale-correct metadata and SEO.
- `docs-navigation`: Canonical fragments and accessible language links.
- `docs-search`: Locale-local indexing, controls, results, and states.
- `docs-content-presentation`: Bilingual parity and confirmed visual remediations.

## Approach

Use Astro i18n with an unprefixed English default, locale-specific content, and a typed UI/metadata dictionary. Freeze heading IDs, append active hashes progressively, retain rendered-DOM search, and enforce English-authoritative same-work-unit parity. Generate the banner reproducibly. Deliver chained work units within the 400-line budget.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `astro.config.mjs`, `src/pages/`, `src/layouts/` | New/Modified | Routes and metadata |
| `src/components/`, `src/scripts/site.js` | New/Modified | Locales, IDs, behavior |
| `src/styles/global.css`, `public/banner.webp` | Modified | Visual remediation |
| `playwright.config.*`, `tests/`, `package.json` | New/Modified | Browser harness |
| `README.md` | Modified | Bilingual guidance |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Locale drift or broken ID behavior | High | Same-unit parity, explicit IDs, browser matrix |
| Snapshot or crop instability | Medium | Pinned settings and focused baselines |
| Review overload | High | Auto-chained slices near 400 lines |

## Rollback Plan

Revert the chain in reverse, restoring the Spanish root and original metadata, banner, and styles; remove i18n and Playwright additions, then run `npm run check` and `npm run build`.

## Dependencies

- Astro i18n/sitemap, Playwright Chromium, and pinned image processing.

## Success Criteria

- [ ] `/` and `/es/` build without redirects and expose reciprocal locale-correct metadata.
- [ ] Both locales preserve meaning, literals, structure, fragments, behavior, and publication parity.
- [ ] Visual remediations pass focused desktop and narrow snapshots.
- [ ] Checks, build, route/metadata inspection, and the Playwright matrix pass.
