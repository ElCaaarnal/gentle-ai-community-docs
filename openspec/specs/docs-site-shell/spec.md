# Docs Site Shell Specification

## Purpose

Describes the static page shell that composes the documentation site: a single route, its document head, external resource loading, and the build's type-checking contract. This is a retroactive spec over an existing, verified implementation — it authorizes no new work.

## Requirements

### Requirement: Static Single-Route Composition

The site MUST expose exactly one route, assembled from a base layout, an interface-chrome region, a sidebar, and a content region.

*Evidence: src/pages/index.astro:1-20 (only file under src/pages/)*

#### Scenario: Root route renders the composed shell

- GIVEN a reader requests the site's root URL
- WHEN the page is served
- THEN the response is a single HTML document composed from the layout, interface chrome, sidebar, and content component

#### Scenario: No other routes exist

- GIVEN the current `src/pages/` directory
- WHEN the site is built
- THEN only the single root route is produced

### Requirement: Document Head Metadata

The page head MUST set character encoding, a responsive viewport, a page title and description supplied by the caller, a dark color-scheme hint, and Open Graph metadata.

*Evidence: src/layouts/BaseLayout.astro:14-22*

#### Scenario: Page renders with the supplied title and description

- GIVEN the root route renders `BaseLayout` with a title and description
- WHEN the page loads
- THEN the document `<title>` and meta description match the values passed as props

### Requirement: Site Icon

The page head MUST declare a site icon, and the site MUST serve a file at `/favicon.ico` so that a browser's automatic icon request resolves without a 404, whether or not the browser reads the declaration.

*Evidence: src/layouts/BaseLayout.astro:23-25, public/favicon.svg, public/favicon.ico, public/apple-touch-icon.png*

#### Scenario: Browser requests the icon it was never told about

- GIVEN a browser that requests `/favicon.ico` by convention, without parsing the document head
- WHEN the request reaches the served site
- THEN it receives an icon file rather than a 404

#### Scenario: Icon is legible at browser-tab size

- GIVEN the declared icon is rendered at 16 and 32 CSS pixels
- WHEN a reader looks at the tab
- THEN the mark remains a recognizable bloom silhouette rather than an indistinct block

### Requirement: External Font and Diagram Script Loading

The shell MUST load its typefaces from Google Fonts and MUST load the Mermaid diagram-rendering library from a CDN script tag. These are documented as accepted external constraints of the current implementation, not as behavior this spec requires future work to preserve unmodified.

*Evidence: src/layouts/BaseLayout.astro:23-26*

#### Scenario: Page load requests the external font and script resources

- GIVEN the page is loading
- WHEN the head is parsed
- THEN a stylesheet request is made to `fonts.googleapis.com` and a script request is made to the Mermaid CDN

### Requirement: Strict TypeScript Build

The project MUST type-check under Astro's strict TypeScript configuration and MUST expose `npm run check` and `npm run build` as the available verification commands.

*Evidence: tsconfig.json:2; package.json:7-10*

#### Scenario: Type check passes

- GIVEN the current source tree
- WHEN `npm run check` is run
- THEN it completes without type errors (verified at time of writing)

#### Scenario: Build produces static output

- GIVEN the current source tree
- WHEN `npm run build` is run
- THEN it produces a static build output without error

### Requirement: Locale routes and parity

The site MUST serve English at `/` and Spanish at `/es/`, without preference redirects. English is authoritative; Spanish MUST ship in the same work unit with equivalent meaning, structure, literals, and IDs.

#### Scenario: Access

- GIVEN `/` or `/es/` is requested
- WHEN it loads
- THEN that locale renders without redirect

#### Scenario: Gate

- GIVEN English content changes
- WHEN release is prepared
- THEN equivalent Spanish content MUST exist

### Requirement: Locale-correct metadata

Each page MUST provide language, localized title/description, absolute self-canonical, reciprocal `en`/`es`/`x-default`, sitemap coverage, and locale-correct Open Graph metadata using the shared image.

#### Scenario: Head

- GIVEN either route is built
- WHEN its head is inspected
- THEN metadata matches its locale and production origin

#### Scenario: Sitemap

- GIVEN the production sitemap is generated
- WHEN routes are checked
- THEN reciprocal locale coverage is complete and unique

## Known Issues (Deferred — Out of Scope)

None currently recorded.

> Resolved 2026-08-24: `/favicon.ico` previously returned 404 because no icon existed in `public/`. The site icon is now a contracted requirement — see *Site Icon* above. This entry is kept as a pointer, not as an open issue.

## Non-Goals

- Deployment and hosting behavior of any provider. The site is a static build; where it is served is out of scope for this contract.
- The 18 pending design decisions recorded as open in `docs-gentle-ai/BRIEF.md`.
