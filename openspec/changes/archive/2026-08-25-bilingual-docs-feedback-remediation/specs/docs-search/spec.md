# docs-search Specification

## Purpose

Localized search.

## Requirements

### Requirement: Localized search

Search MUST index only the rendered locale and localize controls, results, guidance, empty state, and no-match state. Commands, identifiers, and URLs MUST remain exact.

#### Scenario: Match

- GIVEN a query is submitted from `/` or `/es/`
- WHEN matches exist
- THEN results and fragments target that locale

#### Scenario: Empty

- GIVEN a query is empty or unmatched
- WHEN results render
- THEN its localized state appears without stale cross-locale results
