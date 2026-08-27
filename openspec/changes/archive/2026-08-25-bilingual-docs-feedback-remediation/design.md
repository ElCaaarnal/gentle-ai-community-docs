# Design: Bilingual Documentation Feedback Remediation

## Technical Approach

Generate two static Astro pages—authoritative English `/` and parity-gated Spanish `/es/`—from locale-specific long-form components inside one typed, localized shell. Keep rendered-DOM search and vanilla runtime behavior, but make locale, metadata, UI strings, and canonical heading IDs explicit. Add focused built-site and Chromium evidence without redesigning the site.

## Architecture Decisions

| Option | Tradeoff | Decision and rationale |
|---|---|---|
| Locale Astro components | Duplicates rich markup but avoids re-platforming 1,400 lines | Use `DocumentationContentEn.astro` and `DocumentationContentEs.astro`; this preserves tables, callouts, Mermaid, and literals in editorial context. |
| Typed shared shell | Small dictionary to maintain | `src/i18n/site.ts` owns locale metadata, navigation, ARIA, search/copy states, and table hints, preventing visible-text branching. |
| Explicit IDs | Requires adding all 58 H3 IDs | Treat identical H2/H3 IDs as a canonical API; retain slugging only as a defensive fallback and fail parity tests when server HTML lacks IDs. |
| Narrow browser harness | Adds one test dependency | One Chromium project covers behavior; only hero and narrow-table surfaces get snapshots to avoid full-page noise. |

## Data Flow

    / or /es/ → locale page → shared shell + locale dictionary + locale content
                             → static HTML → site.js (DOM-local search/navigation)
                             → Playwright (head, sitemap, parity, behavior, snapshots)

## File Changes

| File | Action | Description |
|---|---|---|
| `astro.config.mjs` | Create | Set `site`, Astro i18n (`en`, `es`, unprefixed default, no fallback/redirect), and sitemap integration. |
| `src/pages/index.astro`, `src/pages/es/index.astro` | Modify/Create | Thin locale entry points using the shared shell. |
| `src/i18n/site.ts`, `src/components/DocumentationPage.astro` | Create | Typed locale contract and shared composition. |
| `src/components/DocumentationContent.astro` | Rename | Become `DocumentationContentEs.astro`; normalize Spanish and add explicit canonical H3 IDs. |
| `src/components/DocumentationContentEn.astro` | Create | Neutral-international English authority with matching structure, IDs, literals, diagrams, and semantics. |
| `src/layouts/BaseLayout.astro`, `src/components/{Sidebar,InterfaceChrome}.astro` | Modify | Localized shell, language links, and absolute metadata. |
| `src/scripts/site.js` | Modify | Consume serialized UI strings; preserve valid hashes progressively; focus the destination heading/main; keep search locale-local. |
| `src/styles/global.css` | Modify | Full-width responsive banner; neutral first callout; remove H2 accent and inert card/row hover; preserve warnings, action focus/hover, progress, and table feedback. |
| `assets/banner-source.webp`, `scripts/generate-banner.mjs`, `public/banner.webp` | Create/Create/Modify | Preserve source and commit deterministic output. |
| `playwright.config.ts`, `tests/docs.spec.ts`, `tests/docs.spec.ts-snapshots/`, `.github/workflows/docs-browser.yml` | Create | Pinned Chromium matrix and focused baselines. |
| `package.json`, `package-lock.json`, `README.md` | Modify | Pin tooling, scripts, routes, regeneration, and same-work-unit parity gate. |

## Interfaces / Contracts

`Locale = 'en' | 'es'`; each dictionary supplies `lang`, `ogLocale`, title/description, UI strings, and navigation `{id,label}[]`. Canonicals are `https://docs-gentle-ai.netlify.app/` and `/es/`; both heads emit reciprocal absolute `en`, `es`, `x-default` (root), `og:url`, `og:locale` (`en_US`/`es_ES`), alternate locale, and `og:image=https://docs-gentle-ai.netlify.app/banner.webp`. Language links have useful base `href`, `hreflang`, visible focus, and `aria-current="page"` only when active; JavaScript appends only a fragment present in the current canonical ID set.

Banner generation pins Sharp and verifies source SHA-256 `22f2ea7a3a4e360c634b5c9147d6b2f924fd5ae5cc18857be13248a133077df9`; extract `{left:0,top:120,width:1672,height:720}`, resize to `1600×689`, WebP quality `82`, effort `6`, and fail unless dimensions match and output is ≤100 KiB.

## Testing Strategy

| Layer | What | Approach |
|---|---|---|
| Build | Routes, head, sitemap, server IDs/parity | `astro check`, build, then Playwright requests/JS-disabled assertions; sitemap must contain unique reciprocal `en`/`es` entries, while HTML also proves `x-default`. |
| E2E | H2/H3 loads, switch/focus, localized search states, scrollspy, tables | Two locales × desktop 1440×900 and narrow 390×844. Failures include locale, viewport, behavior. |
| Visual | Hero/callout and narrow table | Focused committed snapshots in `mcr.microsoft.com/playwright:v1.61.0-noble`; no full-page snapshots. |

## Threat Matrix

| Boundary | Applicability | Safe/failure behavior | Planned RED test |
|---|---|---|---|
| Locale route/fragment resolution | Applicable | `/` and `/es/` never redirect; valid IDs survive enhancement and receive focus; unknown/malformed hashes are omitted and the alternate route/main remains usable. | No-JS base-link test; valid H2/H3 switch test; unknown/encoded hash fallback test. |
| Documentation-like paths | N/A — no executable classification | No execution boundary | None |
| Git repository selection | N/A — no VCS automation | No repository selector | None |
| Commit state | N/A — no commit automation | No index mutation | None |
| Push state | N/A — no push automation | No remote resolution | None |
| PR commands | N/A — no PR automation | No command composition | None |

## Migration / Rollout

Ship as auto-chained ≤400-line review units: IDs/shell, translation slices, route/SEO integration, then visual asset and browser evidence. Publish only after English/Spanish parity, build, sitemap/head inspection, and pinned matrix pass. Roll back chain in reverse; restore Spanish `/`, original banner/styles, and remove i18n/sitemap/Playwright additions.

## Open Questions

None.
