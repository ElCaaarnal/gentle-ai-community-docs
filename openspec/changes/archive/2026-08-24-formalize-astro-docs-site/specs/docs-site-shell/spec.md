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

## Known Issues (Deferred — Out of Scope)

- `/favicon.ico` returns 404: no favicon file exists in `public/` (only `banner.png`). Deferred by explicit user decision; not specified as a requirement here.

## Non-Goals

- Vercel deployment or any hosting/infrastructure behavior.
- The 18 pending design decisions recorded as open in `docs-gentle-ai/BRIEF.md`.
