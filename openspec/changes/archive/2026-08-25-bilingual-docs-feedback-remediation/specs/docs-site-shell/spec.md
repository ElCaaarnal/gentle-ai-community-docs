# docs-site-shell Specification

## Purpose

Bilingual routes.

## Requirements

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
