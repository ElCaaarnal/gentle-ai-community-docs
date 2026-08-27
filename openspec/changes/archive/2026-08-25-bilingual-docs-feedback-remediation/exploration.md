## Exploration: Bilingual documentation and feedback remediation

### Current State
The project is an Astro 7.2.4 static site with strict TypeScript, vanilla JavaScript, and one generated route. `src/pages/index.astro` composes `BaseLayout`, `InterfaceChrome`, `Sidebar`, and a 1,400-line `DocumentationContent.astro`; `src/scripts/site.js` provides all runtime navigation, search, copy, responsive-table, scrollspy, progress, and drawer behavior; `src/styles/global.css` contains the complete visual system. There is no `astro.config.*` file, locale-aware route, content abstraction, automated test runner, browser harness, or visual-regression baseline. `npm run check` and `npm run build` are the available automated verification commands.

The current page is Spanish-only. Language is hard-coded in the document (`lang="es"`), page and Open Graph metadata, sidebar, interface chrome, runtime strings (`Sin resultados`, copy states, anchor ARIA), Mermaid source, and CSS-generated mobile table hint (`→ deslizá`). The runtime search index is correctly derived from rendered DOM content, but navigation and scrollspy depend on shared heading IDs. All 33 H2 elements already have explicit Spanish-derived IDs; all 58 H3 IDs are generated at runtime from translated heading text, so translating headings would break cross-locale fragment equivalence unless those IDs are frozen explicitly.

The hero uses `public/banner.webp`, a 1,672 × 941, 68 KiB RGB WebP with a baked-in black background and substantial empty black area. CSS constrains it to 560px, rounds it, and adds a shadow, creating the nested-card treatment. The first callout is `.imp`, while the document contains 21 other callouts across informational, important, success, and warning semantics. The short H2 accent is `h2::after`; the real reading indicator is the independent fixed `#progress` element. Hover motion/color is applied to inert `.card` elements and table rows. Three overlapping `@media(max-width:900px)` blocks remain a known cascade risk, and table card mode depends on JavaScript copying translated table headers into `data-label` attributes.

Astro's current i18n documentation supports the confirmed URL model: `defaultLocale: "en"`, `locales: ["en", "es"]`, `routing.prefixDefaultLocale: false`, root page files for English, and `src/pages/es/` for Spanish. In Astro 6+, `redirectToDefaultLocale` is false by default and only applies when the default locale is prefixed, so this static configuration does not require or imply browser-language redirection.

### Affected Areas
- `astro.config.mjs` (new) — Astro i18n configuration for `en` and `es` with an unprefixed English default.
- `src/pages/index.astro` — becomes the English root route and supplies English page metadata.
- `src/pages/es/index.astro` (new) — Spanish route using the same shell and Spanish metadata.
- `src/layouts/BaseLayout.astro` — locale-driven `lang`, canonical/alternate links, localized Open Graph metadata, and locale props.
- `src/components/DocumentationContent.astro` — 1,400 lines of Spanish content, 33 explicit H2 IDs, 58 generated H3 IDs, 36 tables, 2 Mermaid diagrams, 22 callouts, and the hero.
- `src/components/Sidebar.astro` — localized groups, navigation labels, search control, real-link language selector, and stable fragment targets.
- `src/components/InterfaceChrome.astro` — localized controls, dialog labels, search placeholder/states, keyboard help, and skip link.
- `src/scripts/site.js` — heading-ID fallback, fragment-preserving locale link, localized anchor/copy/search strings, DOM-derived search, subnavigation, scrollspy, and responsive table labels.
- `src/styles/global.css` — full-width hero treatment, H2 accent removal, neutral callout styling, action-only hover/focus rules, localized CSS-generated table hint, and overlapping responsive rules.
- `public/banner.webp` — derive an optimized crop from this existing source rather than replacing the asset concept.
- `README.md` — currently describes a Spanish-only, single-route site and will eventually need bilingual route/build documentation with the corresponding implementation unit.
- `openspec/specs/docs-site-shell/spec.md` — currently contracts exactly one route and Spanish-era shell metadata.
- `openspec/specs/docs-navigation/spec.md` — currently contracts text-derived H3 IDs, one-language sidebar anchors, and existing navigation behavior.
- `openspec/specs/docs-search/spec.md` — needs locale-local search and localized empty/interaction states.
- `openspec/specs/docs-content-presentation/spec.md` — needs bilingual content parity and the confirmed visual remediation behavior.

### Confirmed Product Decisions
- The site is bilingual: English at `/` and Spanish at `/es/`.
- Astro i18n uses `defaultLocale: en`, locales `en` and `es`, no default-locale prefix, localized URLs, real links for language switching, and no browser-language auto-redirect.
- Every user-facing string is translated, including navigation, search states, ARIA, diagrams, CSS-generated text, SEO, and Open Graph metadata.
- Commands, flags, paths, identifiers, product names, code, and configuration literals remain unchanged.
- Canonical section IDs are identical across languages, and the language switch preserves the active fragment.
- The current banner source is cropped/optimized and integrated at full available hero width without the nested-card treatment.
- Only the first informational callout changes to neutral information styling; genuine warning callouts retain warning emphasis.
- The decorative H2 accent is removed; the real `#progress` reading indicator remains.
- Inert cards and rows lose hover effects; real actions retain accessible hover and focus feedback.
- Delivery uses short feature branches and reviewable chained work units, never direct implementation on `main`.

### Remaining Product Decisions
- Define the English editorial voice and whether Spanish intentionally retains its current Rioplatense voice or is normalized for a broader audience.
- Provide the canonical production origin required for absolute canonical, `hreflang`, `og:url`, and social metadata URLs.
- Decide whether a lightweight browser/visual verification harness belongs in this change or whether manual viewport, keyboard, and fragment checks are accepted residual risk.
- Define translation ownership and freshness policy: which locale is authoritative, how release-sensitive facts are synchronized, and what parity check is required before publication.
- Confirm whether both locales use the same adapted social image or require locale-specific Open Graph imagery; the on-page banner itself remains the adapted existing asset.

### Approaches
1. **Locale-specific Astro content components with a shared localized shell** — Keep authored long-form content as separate English and Spanish Astro components, share layout/chrome/runtime behavior, and pass a small typed locale dictionary for interface strings and metadata. Freeze current H2 IDs and current generated Spanish H3 slugs as explicit canonical IDs in both content versions.
   - Pros: Lowest migration risk for rich existing markup; translators see complete prose and tables in context; commands and literals remain visibly protected; each locale can be reviewed independently; no new content framework or dependency.
   - Cons: Long-form markup is duplicated; structural and factual drift requires an explicit parity review process; shared changes must be applied to both content components.
   - Effort: High

2. **One shared structured content model with locale dictionaries** — Convert every section, paragraph, table, callout, diagram label, and metadata field into typed locale data consumed by generic Astro renderers.
   - Pros: Strong structural parity, centralized stable IDs, and compile-time detection of missing keys.
   - Cons: Re-platforms 1,400 lines of heterogeneous prose and markup before translation; deeply nested data reduces editorial readability; code/config literals and rich inline formatting become easier to damage; very large blast radius with no browser tests.
   - Effort: Very High

3. **Locale-specific Markdown/content collections** — Move prose into per-locale Markdown entries and render them through shared page templates.
   - Pros: Familiar translation files and potential future scaling to more pages/locales.
   - Cons: Current tables, callouts, Mermaid blocks, inline HTML, code-copy behavior, stable IDs, and custom responsive semantics need migration or new component syntax; content collections solve discovery but not parity; this is unnecessary platform churn for two single-page locales.
   - Effort: Very High

### Recommendation
Use locale-specific Astro content components with a shared localized shell and a typed interface/metadata dictionary. This preserves the proven DOM structure and runtime-derived search while avoiding a risky content-platform rewrite. Treat section IDs as language-neutral API: inventory the current 33 H2 IDs and 58 generated H3 slugs, make all of them explicit in both locales, and retain slug generation only as a defensive fallback for future headings.

Implement the switcher as a real `<a>` whose base `href` points to the alternate localized route. Progressively enhance that link so its URL includes the current `location.hash`; because both pages contain the same explicit IDs, fragment preservation remains deterministic. Search should continue indexing only the rendered locale page, which prevents mixed-language results and avoids a second index. Localize runtime strings through page-provided data attributes or a small serialized locale dictionary rather than branching on visible text.

Keep the Spanish content intact as the source for `/es/` and author the new English content incrementally. Centralize shared shell behavior, SEO construction, language navigation, and UI strings, but do not force the long-form document into deeply structured data. Add a parity checklist or machine-readable section-ID manifest during design so structural drift can be detected even if prose parity remains editorial.

For the banner, derive a wide crop from the current 1,672 × 941 WebP that removes avoidable empty black area while retaining the rose, wordmark, and tagline. Keep intrinsic dimensions/aspect ratio accurate, remove the 560px maximum, radius, and card-like shadow, and validate focal content at desktop and narrow breakpoints. Do not attempt to synthesize a replacement or claim the baked-in black background can be removed losslessly.

### Behavioral Risk Analysis
- **Routing:** Adding Astro i18n and a second static route invalidates the existing one-route contract. Build output must prove both `/` and `/es/`; Netlify requires no language redirect. Avoid `navigator.language`, `Astro.preferredLocale`, or `Accept-Language` routing.
- **Fragments:** Existing H2 fragments are explicit, but all 58 H3 fragments are text-derived. Freeze current Spanish slugs before translation, use identical IDs in English, preserve hashes in the switcher, and test direct loads plus locale switches for H2 and H3 targets.
- **Search:** DOM-derived indexing naturally isolates locales, but runtime labels and copy states are hard-coded Spanish. Verify accent-insensitive Spanish search, English search, ranking, empty state, keyboard confinement, focus restoration, and fragment navigation on both routes.
- **Scrollspy/subnavigation:** Both derive links from heading IDs and DOM order. Missing or duplicated IDs can silently break active-state lookup, parent highlighting, and sidebar auto-scroll while `npm run check` still passes.
- **Responsive tables:** Mobile labels come from localized `<th>` text through JavaScript and visible CSS pseudo-content. Both the `data-label` path and `→ deslizá` text require locale coverage; card reflow and horizontal hints must be checked around 760px and the overlapping 900px rules.
- **SEO/accessibility:** `html[lang]`, titles, descriptions, Open Graph fields, canonical URLs, alternates, switcher language names, ARIA labels, skip links, anchor labels, diagram text, and focus behavior must agree with the active locale. Missing production origin blocks correct absolute metadata.
- **Banner processing:** The asset has no alpha and contains an embedded black background. Aggressive cropping can cut the rose or tagline at narrow widths; CSS `object-fit` can further alter focal content. Preserve a reproducible crop command and compare dimensions/file size.
- **Translation drift:** Release versions, agent matrices, commands, warnings, and linked source-of-truth statements are volatile. Duplicated locale components need an explicit synchronization owner and parity checks for IDs, headings, tables, links, literals, and callout semantics.
- **Verification gap:** `site.js` has no automated coverage, and no visual baseline exists. Type-check and build success cannot prove fragments, search, scrollspy, drawer behavior, responsive tables, hover semantics, or visual crop quality.

### Forecast Review Work Units
The change has **High** 400-line budget risk and should use a Feature Branch Chain under the confirmed `auto-chain` strategy. The current feature branch can act as the integration/tracker branch; create a draft/no-merge tracker PR, have child PR 1 target that branch, and have each later child target its immediate predecessor. Retarget/rebase any polluted child diff.

1. **Locale and stable-navigation foundation** — Astro i18n config, locale contract/dictionary, explicit canonical H3 IDs, fragment-switch behavior, and focused contract updates. Target: approximately 250–400 authored changed lines.
2. **English translation: introduction through SDD/OpenSpec/TDD** — one coherent content slice, including diagrams/tables/callouts in that range and literal-preservation review. Target: approximately 300–400 lines.
3. **English translation: skills, personas, routing, and delegation** — second coherent content slice with stable IDs and parity checks. Target: approximately 300–400 lines.
4. **English translation: RDD and complete workflow diagrams** — security-sensitive terminology, warnings, Mermaid labels, and stable fragments. Target: approximately 350–400 lines.
5. **English translation: agents, operations, releases, glossary, and references** — remaining content and volatile fact/literal audit. Target: approximately 350–400 lines.
6. **Bilingual route, shell, search, and SEO integration** — English `/`, Spanish `/es/`, shared localized chrome/sidebar, locale-local search states, canonical/alternate/Open Graph metadata, and README updates. Target: approximately 250–400 lines.
7. **Visual feedback remediation and adapted banner** — first-callout reclassification, H2 accent removal, inert-hover cleanup, responsive full-width crop integration, and responsive cascade cleanup only where required by these changes. Target: approximately 150–300 lines.

Each work unit should include `npm run check`, `npm run build`, a build-output route check, and a scoped manual runtime checklist. Translation units should also record ID/literal/link parity. Final integration requires desktop and mobile checks for both locales, keyboard-only search/navigation, direct fragment loads and language switches, responsive tables near 760/900px, Mermaid rendering, metadata inspection, and banner focal quality. No child PR should claim independent production readiness before the final chain is integrated.

### External Research
Yes. Targeted research would materially reduce uncertainty before design, although the internal architecture recommendation is already clear.

- **Astro 7 static i18n routing:** verify exact 7.2 behavior for unprefixed defaults, locale URL helpers, generated output, and fallback/redirect options. Current Astro documentation already confirms the proposed `prefixDefaultLocale: false` structure and that `redirectToDefaultLocale` does not apply here.
- **Multilingual SEO:** establish authoritative canonical, `hreflang`/`x-default`, `og:locale`/alternate, and social URL rules for an unprefixed default locale.
- **Accessible language navigation:** verify WCAG-aligned link naming, `lang`/`hreflang`, current-language indication, focus behavior after navigation, and fragment-preserving enhancement.
- **Verification strategy:** compare the smallest browser/visual harness suitable for two static routes against an explicitly manual acceptance matrix, especially for hash navigation, search, scrollspy, responsive tables, and banner rendering.
- **Reproducible image processing:** select a deterministic local crop/optimization command and quality threshold that preserves the existing artwork without introducing a new asset concept.

### Risks
- A translation or heading edit can break fragments, subnavigation, search links, and scrollspy together because they share the same ID graph.
- Locale-specific long-form components can drift structurally or factually without parity tooling and ownership.
- The existing JavaScript behavior and responsive cascade can regress while all available automated checks remain green.
- Correct canonical and Open Graph URLs cannot be finalized until the production origin is known.
- The baked-in black banner background limits how completely the visual treatment can be changed without replacing the source, which is explicitly out of scope.
- A single-PR implementation would greatly exceed the 400-line review budget; chain hygiene is required to keep translation review credible.

### Ready for Proposal
Yes, after the orchestrator either resolves the remaining editorial/origin/verification decisions with the user or records them as explicit proposal assumptions. Because external evidence would reduce SEO, accessibility, routing, and verification uncertainty, the recommended immediate next phase is targeted `sdd-research`, not proposal creation.
